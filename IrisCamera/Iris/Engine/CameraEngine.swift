import AVFoundation
import UIKit

struct SessionConfig: Equatable {
    var mode: CaptureMode = .photo
    var lensDeviceID: String = ""
    var lensZoom: CGFloat = 1
    var proRAW = false
    var videoFPS = 30
    var appleLog = false
    var cameraControlAperture = true
}

struct EngineSnapshot {
    var lenses: [Lens]
    var activeLens: Lens?
    var caps: DeviceCapabilities
    var device: AVCaptureDevice?
}

/// Possiede la AVCaptureSession. Tutto ciò che tocca sessione e device gira sulla `sessionQueue`;
/// verso la UI comunica solo tramite callback eseguite sul MainActor.
final class CameraEngine: NSObject, @unchecked Sendable {

    let session = AVCaptureSession()
    let sessionQueue = DispatchSerialQueue(label: "com.apexmedia.iris.session", qos: .userInitiated)
    private let videoQueue = DispatchQueue(label: "com.apexmedia.iris.video", qos: .userInteractive)

    let frameAnalyzer = FrameAnalyzer()

    // MARK: Callback (sempre sul MainActor)

    var onSnapshot: (@MainActor (EngineSnapshot) -> Void)?
    var onMeasured: (@MainActor (MeasuredValues) -> Void)?
    var onRunning: (@MainActor (Bool) -> Void)?
    var onMessage: (@MainActor (String) -> Void)?
    var onWillCapture: (@MainActor () -> Void)?
    var onPhotoFinished: (@MainActor (UIImage?) -> Void)?
    var onRecording: (@MainActor (Bool) -> Void)?
    var onHardwareAperture: (@MainActor (Float) -> Void)?
    var onHardwareFocus: (@MainActor (Float) -> Void)?
    var onHardwareZoom: (@MainActor (CGFloat) -> Void)?
    var onHardwareBias: (@MainActor (Float) -> Void)?
    var onControlsFullscreen: (@MainActor (Bool) -> Void)?

    // MARK: Stato (solo sessionQueue)

    private var device: AVCaptureDevice?
    private var videoInput: AVCaptureDeviceInput?
    private var audioInput: AVCaptureDeviceInput?
    private let photoOutput = AVCapturePhotoOutput()
    private let videoDataOutput = AVCaptureVideoDataOutput()
    private let movieOutput = AVCaptureMovieFileOutput()
    private var config = SessionConfig()
    private var lenses: [Lens] = []
    private var devicesByID: [String: AVCaptureDevice] = [:]
    private var didDiscover = false
    private var meterTimer: DispatchSourceTimer?
    private var lastMeasured = MeasuredValues()
    private var inFlightPhotos: [Int64: PhotoCaptureProcessor] = [:]
    private var movieRecorder: MovieRecorder?
    private var apertureSlider: AVCaptureSlider?
    private var focusSlider: AVCaptureSlider?
    private var lastHardwareApertureAt = Date.distantPast
    private var lastHardwareFocusAt = Date.distantPast
    private var lastExposure = ExposureState()
    private var lastExposureWarning = ""
    private var observers: [NSObjectProtocol] = []

    private lazy var exposureCoalescer = Coalescer<ExposureState>(queue: sessionQueue) { [weak self] in self?.applyExposureNow($0) }
    private lazy var whiteBalanceCoalescer = Coalescer<WhiteBalanceState>(queue: sessionQueue) { [weak self] in self?.applyWhiteBalanceNow($0) }
    private lazy var focusCoalescer = Coalescer<FocusState>(queue: sessionQueue) { [weak self] in self?.applyFocusNow($0) }

    // MARK: - Ciclo di vita

    func start(config newConfig: SessionConfig) {
        sessionQueue.async { [self] in
            if !didDiscover {
                discoverLenses()
                installObservers()
                didDiscover = true
            }
            configureSession(newConfig)
            if !session.isRunning { session.startRunning() }
            startMetering()
            let running = session.isRunning
            main { $0.onRunning?(running) }
        }
    }

    func stop() {
        sessionQueue.async { [self] in
            stopMetering()
            if movieOutput.isRecording { movieOutput.stopRecording() }
            if session.isRunning { session.stopRunning() }
            main { $0.onRunning?(false) }
        }
    }

    func reconfigure(_ newConfig: SessionConfig) {
        sessionQueue.async { [self] in configureSession(newConfig) }
    }

    // MARK: - Obiettivi

    private func discoverLenses() {
        let discovery = AVCaptureDevice.DiscoverySession(
            deviceTypes: [.builtInUltraWideCamera, .builtInWideAngleCamera, .builtInTelephotoCamera],
            mediaType: .video,
            position: .back
        )
        let devices = discovery.devices
        guard let wide = devices.first(where: { $0.deviceType == .builtInWideAngleCamera }) ?? devices.first else {
            lenses = []
            return
        }

        // Fattori di zoom relativi al grandangolo, letti dal device virtuale (più preciso del FOV).
        var relative: [AVCaptureDevice.DeviceType: CGFloat] = [:]
        let virtual = AVCaptureDevice.default(.builtInTripleCamera, for: .video, position: .back)
            ?? AVCaptureDevice.default(.builtInDualWideCamera, for: .video, position: .back)
            ?? AVCaptureDevice.default(.builtInDualCamera, for: .video, position: .back)
        if let virtual {
            let switchOver = virtual.virtualDeviceSwitchOverVideoZoomFactors.map { CGFloat($0.doubleValue) }
            var zoomByType: [AVCaptureDevice.DeviceType: CGFloat] = [:]
            for (index, constituent) in virtual.constituentDevices.enumerated() {
                zoomByType[constituent.deviceType] = index == 0 ? 1 : (index - 1 < switchOver.count ? switchOver[index - 1] : 1)
            }
            if let wideZoom = zoomByType[.builtInWideAngleCamera], wideZoom > 0 {
                for (type, zoom) in zoomByType { relative[type] = zoom / wideZoom }
            }
        }

        let wideHalfFOV = Double(wide.activeFormat.videoFieldOfView) * .pi / 360
        func fovRelative(_ d: AVCaptureDevice) -> CGFloat {
            let half = Double(d.activeFormat.videoFieldOfView) * .pi / 360
            guard half > 0 else { return 1 }
            return CGFloat(tan(wideHalfFOV) / tan(half))
        }
        // Focale equivalente del principale dal FOV orizzontale (sensore 4:3, diagonale 43,27 mm).
        let mainEquivalent = wideHalfFOV > 0 ? 17.31 / tan(wideHalfFOV) : 24

        var result: [Lens] = []
        var map: [String: AVCaptureDevice] = [:]
        for d in devices {
            map[d.uniqueID] = d
            let rel = relative[d.deviceType] ?? fovRelative(d)
            result.append(Lens(
                deviceID: d.uniqueID,
                zoomFactor: 1,
                relativeZoom: rel,
                equivalentFocalLength: Self.niceFocalLength(mainEquivalent * Double(rel)),
                hasVariableAperture: Self.hasVariableAperture(d),
                fixedAperture: d.lensAperture
            ))
        }
        // Ritagli a risoluzione nativa (es. 2× del 48 MP).
        var crops: [Lens] = []
        for d in devices {
            guard let base = result.first(where: { $0.deviceID == d.uniqueID }) else { continue }
            for factor in d.activeFormat.secondaryNativeResolutionZoomFactors where factor > 1 {
                let rel = base.relativeZoom * factor
                let all = result + crops
                guard !all.contains(where: { abs($0.relativeZoom - rel) / rel < 0.15 }) else { continue }
                crops.append(Lens(
                    deviceID: d.uniqueID,
                    zoomFactor: factor,
                    relativeZoom: rel,
                    equivalentFocalLength: Self.niceFocalLength(mainEquivalent * Double(rel)),
                    hasVariableAperture: base.hasVariableAperture,
                    fixedAperture: base.fixedAperture
                ))
            }
        }
        lenses = (result + crops).sorted { $0.relativeZoom < $1.relativeZoom }
        devicesByID = map
    }

    private static func hasVariableAperture(_ d: AVCaptureDevice) -> Bool {
        d.formats.contains { $0.maxLensAperture - $0.minLensAperture > 0.01 }
    }

    private static func niceFocalLength(_ mm: Double) -> Int {
        let known: [Double] = [13, 14, 24, 26, 28, 35, 48, 52, 77, 85, 100, 120, 200, 240]
        if let match = known.min(by: { abs($0 - mm) < abs($1 - mm) }), abs(match - mm) / match < 0.1 {
            return Int(match)
        }
        return Int(mm.rounded())
    }

    // MARK: - Configurazione sessione

    private func configureSession(_ newConfig: SessionConfig) {
        var cfg = newConfig
        if devicesByID[cfg.lensDeviceID] == nil {
            let primary = lenses.first { abs($0.relativeZoom - 1) < 0.01 } ?? lenses.first
            cfg.lensDeviceID = primary?.deviceID ?? ""
            cfg.lensZoom = primary?.zoomFactor ?? 1
        }
        guard let newDevice = devicesByID[cfg.lensDeviceID] else {
            main { $0.onMessage?("Nessuna fotocamera posteriore disponibile") }
            return
        }
        if movieOutput.isRecording { movieOutput.stopRecording() }

        session.beginConfiguration()

        // Input video
        if videoInput?.device.uniqueID != newDevice.uniqueID {
            if let videoInput { session.removeInput(videoInput) }
            videoInput = nil
            if let input = try? AVCaptureDeviceInput(device: newDevice), session.canAddInput(input) {
                session.addInput(input)
                videoInput = input
            }
        }
        device = videoInput?.device

        // Output in base alla modalità
        session.automaticallyConfiguresCaptureDeviceForWideColor = cfg.mode == .photo
        if cfg.mode == .photo {
            if session.outputs.contains(movieOutput) { session.removeOutput(movieOutput) }
            if let audioInput { session.removeInput(audioInput) }
            audioInput = nil
            if !session.outputs.contains(photoOutput), session.canAddOutput(photoOutput) { session.addOutput(photoOutput) }
            if session.canSetSessionPreset(.photo) { session.sessionPreset = .photo }
        } else {
            if session.outputs.contains(photoOutput) { session.removeOutput(photoOutput) }
            if session.canSetSessionPreset(.high) { session.sessionPreset = .high }
            if !session.outputs.contains(movieOutput), session.canAddOutput(movieOutput) { session.addOutput(movieOutput) }
            if audioInput == nil, let mic = AVCaptureDevice.default(for: .audio),
               let input = try? AVCaptureDeviceInput(device: mic), session.canAddInput(input) {
                session.addInput(input)
                audioInput = input
            }
        }
        if !session.outputs.contains(videoDataOutput) {
            videoDataOutput.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]
            videoDataOutput.alwaysDiscardsLateVideoFrames = true
            videoDataOutput.deliversPreviewSizedOutputBuffers = true
            videoDataOutput.setSampleBufferDelegate(frameAnalyzer, queue: videoQueue)
            if session.canAddOutput(videoDataOutput) { session.addOutput(videoDataOutput) }
        }

        config = cfg
        session.commitConfiguration()

        // Secondo passaggio, con preset e connessioni già applicati:
        // formato definitivo del sensore, capacità dell'output, rotazioni, Camera Control.
        session.beginConfiguration()
        if let device {
            if cfg.mode == .photo {
                ensureVariableAperturePhotoFormat(device)
            } else {
                applyVideoFormat(device, fps: cfg.videoFPS, log: cfg.appleLog)
            }
            if (try? device.lockForConfiguration()) != nil {
                device.videoZoomFactor = cfg.lensZoom.clamped(1, device.activeFormat.videoMaxZoomFactor)
                device.unlockForConfiguration()
            }
        }
        if cfg.mode == .photo, let device {
            photoOutput.maxPhotoQualityPrioritization = .quality
            let dims = device.activeFormat.supportedMaxPhotoDimensions
            if let largest = dims.max(by: { Int($0.width) * Int($0.height) < Int($1.width) * Int($1.height) }) {
                photoOutput.maxPhotoDimensions = largest
            }
            photoOutput.isAppleProRAWEnabled = cfg.proRAW && photoOutput.isAppleProRAWSupported
        }
        // UI bloccata in verticale: buffer di preview/analisi sempre dritti.
        for output in [videoDataOutput, photoOutput, movieOutput] as [AVCaptureOutput] {
            if let connection = output.connection(with: .video), connection.isVideoRotationAngleSupported(90) {
                connection.videoRotationAngle = 90
            }
        }
        if cfg.mode == .video, let connection = movieOutput.connection(with: .video), connection.isVideoStabilizationSupported {
            connection.preferredVideoStabilizationMode = .auto
        }
        configureCameraControl()
        session.commitConfiguration()

        publishSnapshot()
        exposureCoalescer.submit(lastExposure)
    }

    /// Con il preset .photo il sistema sceglie il formato: se non espone il diaframma variabile
    /// cerchiamo un formato equivalente (stessa risoluzione foto massima) che lo esponga.
    private func ensureVariableAperturePhotoFormat(_ device: AVCaptureDevice) {
        let current = device.activeFormat
        guard current.maxLensAperture - current.minLensAperture <= 0.01, Self.hasVariableAperture(device) else { return }
        let area: (CMVideoDimensions) -> Int = { Int($0.width) * Int($0.height) }
        let currentMax = current.supportedMaxPhotoDimensions.map(area).max() ?? 0
        let candidates = device.formats.filter {
            $0.maxLensAperture - $0.minLensAperture > 0.01 &&
            ($0.supportedMaxPhotoDimensions.map(area).max() ?? 0) >= currentMax &&
            CMFormatDescriptionGetMediaSubType($0.formatDescription) == CMFormatDescriptionGetMediaSubType(current.formatDescription)
        }
        guard let format = candidates.first, (try? device.lockForConfiguration()) != nil else { return }
        device.activeFormat = format
        device.unlockForConfiguration()
    }

    private func applyVideoFormat(_ device: AVCaptureDevice, fps: Int, log: Bool) {
        guard let format = Self.bestVideoFormat(device, fps: Double(fps), log: log) ?? Self.bestVideoFormat(device, fps: Double(fps), log: false),
              (try? device.lockForConfiguration()) != nil else { return }
        defer { device.unlockForConfiguration() }
        device.activeFormat = format
        let maxRate = format.videoSupportedFrameRateRanges.map(\.maxFrameRate).max() ?? 30
        let rate = min(Double(fps), maxRate)
        let duration = CMTime(value: 1000, timescale: CMTimeScale(rate * 1000))
        device.activeVideoMinFrameDuration = duration
        device.activeVideoMaxFrameDuration = duration

        let spaces = format.supportedColorSpaces
        if log && spaces.contains(.appleLog) {
            device.activeColorSpace = .appleLog
        } else if Self.isTenBit(format) && spaces.contains(.HLG_BT2020) {
            device.activeColorSpace = .HLG_BT2020
        } else if spaces.contains(.P3_D65) {
            device.activeColorSpace = .P3_D65
        } else if let first = spaces.first {
            device.activeColorSpace = first
        }
        if log && !spaces.contains(.appleLog) {
            main { $0.onMessage?("Apple Log non disponibile su questo obiettivo/frame rate") }
        }
    }

    private static func isTenBit(_ f: AVCaptureDevice.Format) -> Bool {
        CMFormatDescriptionGetMediaSubType(f.formatDescription) == kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange
    }

    private static func bestVideoFormat(_ device: AVCaptureDevice, fps: Double, log: Bool) -> AVCaptureDevice.Format? {
        func score(_ f: AVCaptureDevice.Format) -> Int {
            let d = CMVideoFormatDescriptionGetDimensions(f.formatDescription)
            var s = 0
            if d.width == 3840 && d.height == 2160 { s += 1000 }
            if f.maxLensAperture - f.minLensAperture > 0.01 { s += 200 }
            if isTenBit(f) { s += 50 }
            if f.isVideoStabilizationModeSupported(.cinematicExtended) { s += 5 }
            return s
        }
        let candidates = device.formats.filter { f in
            let d = CMVideoFormatDescriptionGetDimensions(f.formatDescription)
            guard d.width * 9 == d.height * 16, d.width >= 1920 else { return false }
            guard f.videoSupportedFrameRateRanges.contains(where: { $0.minFrameRate <= fps && fps <= $0.maxFrameRate }) else { return false }
            if log && !f.supportedColorSpaces.contains(.appleLog) { return false }
            return true
        }
        return candidates.max { score($0) < score($1) }
    }

    private func publishSnapshot() {
        guard let device else { return }
        let f = device.activeFormat
        var caps = DeviceCapabilities()
        let minAp = f.minLensAperture, maxAp = f.maxLensAperture
        if minAp > 0, maxAp - minAp > 0.01 {
            caps.aperture = ApertureRange(min: minAp, max: maxAp, recommended: f.recommendedLensApertureStops.sorted())
        } else {
            caps.aperture = ApertureRange(min: device.lensAperture, max: device.lensAperture, recommended: [])
        }
        caps.minISO = f.minISO
        caps.maxISO = f.maxISO
        caps.minShutter = max(f.minExposureDuration.seconds, 1.0 / 16000.0)
        var maxShutter = f.maxExposureDuration.seconds
        if config.mode == .video {
            maxShutter = min(maxShutter, device.activeVideoMinFrameDuration.seconds)
        }
        caps.maxShutter = max(maxShutter, caps.minShutter)
        caps.minBias = max(device.minExposureTargetBias, -4)
        caps.maxBias = min(device.maxExposureTargetBias, 4)
        caps.supportsManualFocus = device.isLockingFocusWithCustomLensPositionSupported
        caps.supportsManualWB = device.isLockingWhiteBalanceWithCustomDeviceGainsSupported
        caps.maxZoom = min(f.videoMaxZoomFactor, 10)
        let mp = f.supportedMaxPhotoDimensions.map { Int(Double($0.width) * Double($0.height) / 1_000_000) }
        caps.photoMegapixels = Array(Set(mp)).sorted()
        caps.supportsProRAW = config.mode == .photo && photoOutput.isAppleProRAWSupported
        caps.supportsAppleLog = device.formats.contains { $0.supportedColorSpaces.contains(.appleLog) }
        caps.supportsProRes = config.mode == .video && movieOutput.availableVideoCodecTypes.contains(.proRes422HQ)
        caps.supportsControls = session.supportsControls
        let dims = CMVideoFormatDescriptionGetDimensions(f.formatDescription)
        if dims.width > 0, dims.height > 0 {
            caps.bufferAspect = CGFloat(max(dims.width, dims.height)) / CGFloat(min(dims.width, dims.height))
        }

        let active = lenses.first { $0.deviceID == device.uniqueID && abs($0.zoomFactor - config.lensZoom) < 0.01 }
            ?? lenses.first { $0.deviceID == device.uniqueID }
        let snapshot = EngineSnapshot(lenses: lenses, activeLens: active, caps: caps, device: device)
        main { $0.onSnapshot?(snapshot) }
    }

    // MARK: - Camera Control (tasto fisico)

    private func configureCameraControl() {
        guard session.supportsControls, let device else { return }
        for control in session.controls { session.removeControl(control) }
        apertureSlider = nil
        focusSlider = nil

        var controls: [AVCaptureControl] = []
        let f = device.activeFormat
        if config.cameraControlAperture, f.minLensAperture > 0, f.maxLensAperture - f.minLensAperture > 0.01 {
            // Slider continuo: nessuno scatto a gradini, a differenza dell'app Fotocamera.
            let slider = AVCaptureSlider("Diaframma", symbolName: "camera.aperture", in: f.minLensAperture...f.maxLensAperture)
            slider.localizedValueFormat = "ƒ%@"
            slider.prominentValues = f.recommendedLensApertureStops
            slider.value = device.lensAperture.clamped(f.minLensAperture, f.maxLensAperture)
            slider.setActionQueue(sessionQueue) { [weak self] value in
                guard let self else { return }
                self.lastHardwareApertureAt = Date()
                self.main { $0.onHardwareAperture?(value) }
            }
            controls.append(slider)
            apertureSlider = slider
        }
        controls.append(AVCaptureSystemZoomSlider(device: device) { [weak self] zoom in
            self?.onHardwareZoom?(zoom)
        })
        controls.append(AVCaptureSystemExposureBiasSlider(device: device) { [weak self] bias in
            self?.onHardwareBias?(bias)
        })
        if device.isLockingFocusWithCustomLensPositionSupported {
            let slider = AVCaptureSlider("Fuoco", symbolName: "scope", in: 0...1)
            slider.value = device.lensPosition
            slider.setActionQueue(sessionQueue) { [weak self] value in
                guard let self else { return }
                self.lastHardwareFocusAt = Date()
                self.applyFocusNow(FocusState(auto: false, lensPosition: value))
                self.main { $0.onHardwareFocus?(value) }
            }
            controls.append(slider)
            focusSlider = slider
        }
        for control in controls where session.canAddControl(control) {
            session.addControl(control)
        }
        session.setControlsDelegate(self, queue: sessionQueue)
    }

    // MARK: - Esposizione, bilanciamento, fuoco

    func applyExposure(_ state: ExposureState) { exposureCoalescer.submit(state) }
    func applyWhiteBalance(_ state: WhiteBalanceState) { whiteBalanceCoalescer.submit(state) }
    func applyFocus(_ state: FocusState) { focusCoalescer.submit(state) }

    private func applyExposureNow(_ s: ExposureState) {
        lastExposure = s
        guard let device, (try? device.lockForConfiguration()) != nil else { return }
        defer { device.unlockForConfiguration() }
        let f = device.activeFormat
        let variable = f.minLensAperture > 0 && f.maxLensAperture - f.minLensAperture > 0.01
        let apertureLocked = variable && !s.apertureAuto

        if !apertureLocked && s.shutterAuto && s.isoAuto {
            if device.isExposureModeSupported(.continuousAutoExposure) {
                device.exposureMode = .continuousAutoExposure
            }
        } else {
            let iso: Float = s.isoAuto ? AVCaptureDevice.autoISO : s.iso.clamped(f.minISO, f.maxISO)
            let seconds = s.shutter.clamped(f.minExposureDuration.seconds, f.maxExposureDuration.seconds)
            let duration: CMTime = s.shutterAuto
                ? AVCaptureDevice.autoExposureDuration
                : CMTime(seconds: seconds, preferredTimescale: 1_000_000_000)
            let aperture: Float = apertureLocked
                ? s.aperture.clamped(f.minLensAperture, f.maxLensAperture)
                : AVCaptureDevice.autoLensAperture

            if f.supportsExposureModeCustom(lensAperture: aperture, duration: duration, iso: iso) {
                // Con tutti e tre i valori espliciti il diaframma si muove subito, senza rate limit.
                device.setExposureModeCustom(lensAperture: aperture, duration: duration, iso: iso, completionHandler: nil)
                lastExposureWarning = ""
            } else if !apertureLocked,
                      f.supportsExposureModeCustom(lensAperture: AVCaptureDevice.currentLensAperture, duration: duration, iso: iso) {
                device.setExposureModeCustom(lensAperture: AVCaptureDevice.currentLensAperture, duration: duration, iso: iso, completionHandler: nil)
                warnOnce("Diaframma fissato al valore attuale: questa priorità non supporta l'auto-apertura")
            } else {
                warnOnce("Combinazione di priorità non supportata dal sensore")
            }
        }

        let bias = s.bias.clamped(device.minExposureTargetBias, device.maxExposureTargetBias)
        if abs(device.exposureTargetBias - bias) > 0.001 {
            device.setExposureTargetBias(bias, completionHandler: nil)
        }

        // Tiene allineato il Camera Control senza "strappargli" il valore mentre lo si sta usando.
        if let slider = apertureSlider, apertureLocked, Date().timeIntervalSince(lastHardwareApertureAt) > 0.6 {
            let v = s.aperture.clamped(f.minLensAperture, f.maxLensAperture)
            if abs(slider.value - v) > 0.005 { slider.value = v }
        }
    }

    private func warnOnce(_ text: String) {
        guard text != lastExposureWarning else { return }
        lastExposureWarning = text
        main { $0.onMessage?(text) }
    }

    private func applyWhiteBalanceNow(_ wb: WhiteBalanceState) {
        guard let device, (try? device.lockForConfiguration()) != nil else { return }
        defer { device.unlockForConfiguration() }
        if wb.auto {
            if device.isWhiteBalanceModeSupported(.continuousAutoWhiteBalance) {
                device.whiteBalanceMode = .continuousAutoWhiteBalance
            }
        } else if device.isLockingWhiteBalanceWithCustomDeviceGainsSupported {
            let values = AVCaptureDevice.WhiteBalanceTemperatureAndTintValues(temperature: wb.kelvin, tint: 0)
            var gains = device.deviceWhiteBalanceGains(for: values)
            let maxGain = device.maxWhiteBalanceGain
            gains.redGain = gains.redGain.clamped(1, maxGain)
            gains.greenGain = gains.greenGain.clamped(1, maxGain)
            gains.blueGain = gains.blueGain.clamped(1, maxGain)
            device.setWhiteBalanceModeLocked(with: gains, completionHandler: nil)
        }
    }

    private func applyFocusNow(_ focus: FocusState) {
        guard let device, (try? device.lockForConfiguration()) != nil else { return }
        defer { device.unlockForConfiguration() }
        if focus.auto {
            if device.isFocusModeSupported(.continuousAutoFocus) {
                device.focusMode = .continuousAutoFocus
            }
        } else if device.isLockingFocusWithCustomLensPositionSupported {
            device.setFocusModeLocked(lensPosition: focus.lensPosition.clamped(0, 1), completionHandler: nil)
            if let slider = focusSlider, Date().timeIntervalSince(lastHardwareFocusAt) > 0.6,
               abs(slider.value - focus.lensPosition) > 0.005 {
                slider.value = focus.lensPosition.clamped(0, 1)
            }
        }
    }

    /// Tocco sul mirino: punto di fuoco/esposizione. Rispetta i parametri bloccati.
    func focusAndExpose(at point: CGPoint, focusAuto: Bool) {
        sessionQueue.async { [self] in
            guard let device, (try? device.lockForConfiguration()) != nil else { return }
            if focusAuto, device.isFocusPointOfInterestSupported, device.isFocusModeSupported(.continuousAutoFocus) {
                device.focusPointOfInterest = point
                device.focusMode = .continuousAutoFocus
            }
            if device.isExposurePointOfInterestSupported {
                device.exposurePointOfInterest = point
                if device.exposureMode != .custom, device.isExposureModeSupported(.continuousAutoExposure) {
                    device.exposureMode = .continuousAutoExposure
                }
            }
            device.unlockForConfiguration()
            if device.exposureMode == .custom { applyExposureNow(lastExposure) }
        }
    }

    func setZoom(_ factor: CGFloat, animated: Bool) {
        sessionQueue.async { [self] in
            guard let device, (try? device.lockForConfiguration()) != nil else { return }
            let z = factor.clamped(1, device.activeFormat.videoMaxZoomFactor)
            if animated {
                device.ramp(toVideoZoomFactor: z, withRate: 6)
            } else {
                device.cancelVideoZoomRamp()
                device.videoZoomFactor = z
            }
            device.unlockForConfiguration()
            config.lensZoom = z
        }
    }

    // MARK: - Misure live

    private func startMetering() {
        meterTimer?.cancel()
        let timer = DispatchSource.makeTimerSource(queue: sessionQueue)
        timer.schedule(deadline: .now(), repeating: .milliseconds(80))
        timer.setEventHandler { [weak self] in self?.meter() }
        timer.resume()
        meterTimer = timer
    }

    private func stopMetering() {
        meterTimer?.cancel()
        meterTimer = nil
    }

    private func meter() {
        guard let device else { return }
        var m = MeasuredValues()
        m.aperture = device.lensAperture
        m.iso = device.iso
        m.shutter = device.exposureDuration.seconds
        m.lensPosition = device.lensPosition
        m.kelvin = device.temperatureAndTintValues(for: device.deviceWhiteBalanceGains).temperature
        m.bias = device.exposureTargetBias
        guard m != lastMeasured else { return }
        lastMeasured = m
        main { $0.onMeasured?(m) }
    }

    // MARK: - Scatto

    func capturePhoto(format: PhotoFormat, megapixels: Int, lockedExposure: Bool, rotationAngle: CGFloat) {
        sessionQueue.async { [self] in
            guard config.mode == .photo, let device, session.outputs.contains(photoOutput) else { return }

            let rawTypes = photoOutput.availableRawPhotoPixelFormatTypes
            let rawType = rawTypes.first { AVCapturePhotoOutput.isAppleProRAWPixelFormat($0) } ?? rawTypes.first
            let processed: [String: Any] = photoOutput.availablePhotoCodecTypes.contains(.hevc)
                ? [AVVideoCodecKey: AVVideoCodecType.hevc]
                : [AVVideoCodecKey: AVVideoCodecType.jpeg]

            let settings: AVCapturePhotoSettings
            if format == .proRAW, let rawType {
                settings = AVCapturePhotoSettings(rawPixelFormatType: rawType)
            } else if format == .rawPlusHEIF, let rawType {
                settings = AVCapturePhotoSettings(rawPixelFormatType: rawType, processedFormat: processed)
            } else if format == .jpeg {
                settings = AVCapturePhotoSettings(format: [AVVideoCodecKey: AVVideoCodecType.jpeg])
            } else {
                settings = AVCapturePhotoSettings(format: processed)
            }
            if format.needsRAW && rawType == nil {
                main { $0.onMessage?("RAW non disponibile: salvo in HEIF") }
            }

            // Risoluzione: la più grande che non supera quella scelta.
            let area: (CMVideoDimensions) -> Int = { Int($0.width) * Int($0.height) }
            let limit = area(photoOutput.maxPhotoDimensions)
            let dims = device.activeFormat.supportedMaxPhotoDimensions
                .filter { area($0) <= limit }
                .sorted { area($0) < area($1) }
            if let chosen = dims.last(where: { area($0) / 1_000_000 <= megapixels }) ?? dims.first {
                settings.maxPhotoDimensions = chosen
            }

            // Con esposizione bloccata serve .speed, altrimenti il sistema può sovrascrivere ISO/tempo.
            let desired: AVCapturePhotoOutput.QualityPrioritization = lockedExposure ? .speed : .balanced
            settings.photoQualityPrioritization = desired.rawValue <= photoOutput.maxPhotoQualityPrioritization.rawValue
                ? desired : photoOutput.maxPhotoQualityPrioritization
            if let previewType = settings.availablePreviewPhotoPixelFormatTypes.first {
                settings.previewPhotoFormat = [kCVPixelBufferPixelFormatTypeKey as String: previewType]
            }

            if let connection = photoOutput.connection(with: .video), connection.isVideoRotationAngleSupported(rotationAngle) {
                connection.videoRotationAngle = rotationAngle
            }

            let id = settings.uniqueID
            let processor = PhotoCaptureProcessor(
                willCapture: { [weak self] in self?.main { $0.onWillCapture?() } },
                completion: { [weak self] thumbnail, error in
                    guard let self else { return }
                    self.sessionQueue.async { self.inFlightPhotos[id] = nil }
                    self.main {
                        $0.onPhotoFinished?(thumbnail)
                        if let error { $0.onMessage?(error) }
                    }
                }
            )
            inFlightPhotos[id] = processor
            photoOutput.capturePhoto(with: settings, delegate: processor)
        }
    }

    // MARK: - Video

    func startRecording(codec: VideoCodecChoice, rotationAngle: CGFloat) {
        sessionQueue.async { [self] in
            guard config.mode == .video, !movieOutput.isRecording,
                  let connection = movieOutput.connection(with: .video) else { return }
            if connection.isVideoRotationAngleSupported(rotationAngle) {
                connection.videoRotationAngle = rotationAngle
            }
            let available = movieOutput.availableVideoCodecTypes
            if codec == .proRes, available.contains(.proRes422HQ) {
                movieOutput.setOutputSettings([AVVideoCodecKey: AVVideoCodecType.proRes422HQ], for: connection)
            } else {
                if codec == .proRes { main { $0.onMessage?("ProRes non disponibile in questo formato: registro in HEVC") } }
                if available.contains(.hevc) {
                    movieOutput.setOutputSettings([AVVideoCodecKey: AVVideoCodecType.hevc], for: connection)
                }
            }
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("iris-\(UUID().uuidString).mov")
            let recorder = MovieRecorder(
                onStart: { [weak self] in self?.main { $0.onRecording?(true) } },
                onFinish: { [weak self] error in
                    guard let self else { return }
                    self.sessionQueue.async { self.movieRecorder = nil }
                    self.main {
                        $0.onRecording?(false)
                        $0.onMessage?(error ?? "Video salvato in Foto")
                    }
                }
            )
            movieRecorder = recorder
            movieOutput.startRecording(to: url, recordingDelegate: recorder)
        }
    }

    func stopRecording() {
        sessionQueue.async { [self] in
            if movieOutput.isRecording { movieOutput.stopRecording() }
        }
    }

    // MARK: - Notifiche di sessione

    private func installObservers() {
        let center = NotificationCenter.default
        observers.append(center.addObserver(forName: AVCaptureSession.runtimeErrorNotification, object: session, queue: nil) { [weak self] _ in
            guard let self else { return }
            self.sessionQueue.async {
                if !self.session.isRunning { self.session.startRunning() }
                let running = self.session.isRunning
                self.main { $0.onRunning?(running) }
            }
        })
        observers.append(center.addObserver(forName: AVCaptureSession.wasInterruptedNotification, object: session, queue: nil) { [weak self] _ in
            self?.main { $0.onMessage?("Fotocamera in pausa: in uso da un'altra app") }
        })
    }

    // MARK: - Utility

    /// Esegue `body` sul MainActor passando l'engine.
    private func main(_ body: @escaping @MainActor (CameraEngine) -> Void) {
        Task { @MainActor [self] in body(self) }
    }
}

// MARK: - Camera Control delegate

extension CameraEngine: AVCaptureSessionControlsDelegate {
    func sessionControlsDidBecomeActive(_ session: AVCaptureSession) {}

    func sessionControlsWillEnterFullscreenAppearance(_ session: AVCaptureSession) {
        main { $0.onControlsFullscreen?(true) }
    }

    func sessionControlsWillExitFullscreenAppearance(_ session: AVCaptureSession) {
        main { $0.onControlsFullscreen?(false) }
    }

    func sessionControlsDidBecomeInactive(_ session: AVCaptureSession) {
        main { $0.onControlsFullscreen?(false) }
    }
}

// MARK: - Coalescer

/// Tiene solo l'ultima richiesta: lo slider può generare 120 eventi/s, il device ne applica uno per volta.
final class Coalescer<T>: @unchecked Sendable {
    private let lock = NSLock()
    private var pending: T?
    private var scheduled = false
    private let queue: DispatchQueue
    private let work: (T) -> Void

    init(queue: DispatchQueue, work: @escaping (T) -> Void) {
        self.queue = queue
        self.work = work
    }

    func submit(_ value: T) {
        lock.lock()
        pending = value
        let shouldSchedule = !scheduled
        scheduled = true
        lock.unlock()
        if shouldSchedule {
            queue.async { [self] in drain() }
        }
    }

    private func drain() {
        lock.lock()
        let value = pending
        pending = nil
        scheduled = false
        lock.unlock()
        if let value { work(value) }
    }
}
