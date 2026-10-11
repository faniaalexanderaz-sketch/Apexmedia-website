import AVFoundation
import CoreMotion
import Observation
import SwiftUI

enum AuthState { case unknown, authorized, denied }

struct RampState: Equatable {
    var from: Float?
    var to: Float?
    var duration: Double = 5
    var eased = true
    var running = false
    var progress: Double = 0
}

/// Stato della UI e unica fonte di verità per esposizione, bilanciamento e fuoco.
/// La UI invia intenti; il modello calcola lo stato e lo passa al motore.
@MainActor
@Observable
final class CameraModel {
    let engine: CameraEngine
    let overlay: OverlayRenderer?
    let haptics = Haptics()

    var authorization: AuthState = .unknown
    var isRunning = false
    var mode: CaptureMode = .photo
    var lenses: [Lens] = []
    var currentLens: Lens?
    var zoom: CGFloat = 1
    var caps = DeviceCapabilities()
    var exposure = ExposureState()
    var whiteBalance = WhiteBalanceState()
    var focus = FocusState()
    var measured = MeasuredValues()
    var selected: ControlKind = .aperture
    var histogram: [Float] = []
    var rollAngle: Double = 0
    var isLevel = false
    var levelUsable = true
    var isRecording = false
    var recordingStarted: Date?
    var thumbnail: UIImage?
    var flash = false
    var chromeHidden = false
    var toast: String?
    var focusIndicator: CGPoint?
    var aeLocked = false
    var settings = IrisSettings.load()
    var ramp = RampState()
    var showRampEditor = false
    var showSettings = false

    @ObservationIgnored private let motion = CMMotionManager()
    @ObservationIgnored private var rotationCoordinator: AVCaptureDevice.RotationCoordinator?
    @ObservationIgnored private weak var previewLayer: AVCaptureVideoPreviewLayer?
    @ObservationIgnored private var currentDevice: AVCaptureDevice?
    @ObservationIgnored private var anchor: (aperture: Float, iso: Float, shutter: Double)?
    @ObservationIgnored private var lastApertureChange = Date.distantPast
    @ObservationIgnored private var rampTask: Task<Void, Never>?
    @ObservationIgnored private var toastTask: Task<Void, Never>?
    @ObservationIgnored private var focusTask: Task<Void, Never>?
    @ObservationIgnored private var pinchBase: CGFloat = 1
    @ObservationIgnored private var suspended = false

    init() {
        let engine = CameraEngine()
        self.engine = engine
        overlay = OverlayRenderer(store: engine.frameAnalyzer.store)
        wireEngine()
        updateOverlay()
        engine.frameAnalyzer.histogramEnabled = settings.showHistogram
    }

    // MARK: - Collegamento al motore

    private func wireEngine() {
        engine.onSnapshot = { [weak self] snapshot in self?.apply(snapshot) }
        engine.onMeasured = { [weak self] values in self?.measured = values }
        engine.onRunning = { [weak self] running in self?.isRunning = running }
        engine.onMessage = { [weak self] text in self?.show(text) }
        engine.onWillCapture = { [weak self] in self?.blinkShutter() }
        engine.onPhotoFinished = { [weak self] image in
            if let image { self?.thumbnail = image }
        }
        engine.onRecording = { [weak self] recording in
            guard let self else { return }
            self.isRecording = recording
            self.recordingStarted = recording ? Date() : nil
        }
        engine.onHardwareAperture = { [weak self] value in self?.setAperture(value) }
        engine.onHardwareFocus = { [weak self] value in
            guard let self else { return }
            self.focus = FocusState(auto: false, lensPosition: value)
            self.updateOverlay()
        }
        engine.onHardwareZoom = { [weak self] value in self?.zoom = value }
        engine.onHardwareBias = { [weak self] value in self?.exposure.bias = value }
        engine.onControlsFullscreen = { [weak self] fullscreen in
            withAnimation(.easeOut(duration: 0.2)) { self?.chromeHidden = fullscreen }
        }
        engine.frameAnalyzer.onHistogram = { [weak self] bins in self?.histogram = bins }
    }

    private func apply(_ snapshot: EngineSnapshot) {
        lenses = snapshot.lenses
        currentLens = snapshot.activeLens
        caps = snapshot.caps
        zoom = snapshot.activeLens?.zoomFactor ?? 1
        currentDevice = snapshot.device

        exposure.iso = exposure.iso.clamped(caps.minISO, caps.maxISO)
        exposure.shutter = exposure.shutter.clamped(caps.minShutter, caps.maxShutter)
        exposure.bias = exposure.bias.clamped(caps.minBias, caps.maxBias)
        if caps.aperture.isVariable { exposure.aperture = caps.aperture.clamp(exposure.aperture) }
        if !caps.aperture.isVariable { stopRamp() }

        engine.applyExposure(exposure)
        engine.applyWhiteBalance(whiteBalance)
        engine.applyFocus(focus)
        setupRotation()
    }

    // MARK: - Ciclo di vita

    func onAppear() async {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            authorization = .authorized
        case .notDetermined:
            authorization = await AVCaptureDevice.requestAccess(for: .video) ? .authorized : .denied
        default:
            authorization = .denied
        }
        guard authorization == .authorized else { return }
        engine.start(config: sessionConfig())
        startMotion()
    }

    func scenePhaseChanged(_ phase: ScenePhase) {
        guard authorization == .authorized else { return }
        switch phase {
        case .active:
            guard suspended else { return }
            suspended = false
            engine.start(config: sessionConfig())
            startMotion()
        case .background:
            suspended = true
            stopRamp()
            engine.stop()
            motion.stopDeviceMotionUpdates()
        default:
            break
        }
    }

    private func sessionConfig() -> SessionConfig {
        SessionConfig(
            mode: mode,
            lensDeviceID: currentLens?.deviceID ?? "",
            lensZoom: currentLens?.zoomFactor ?? 1,
            proRAW: settings.photoFormat.needsRAW,
            videoFPS: settings.videoFPS,
            appleLog: settings.appleLog,
            cameraControlAperture: settings.cameraControlAperture
        )
    }

    func attachPreview(_ layer: AVCaptureVideoPreviewLayer) {
        previewLayer = layer
        setupRotation()
    }

    private func setupRotation() {
        guard let device = currentDevice, let layer = previewLayer else { return }
        let coordinator = AVCaptureDevice.RotationCoordinator(device: device, previewLayer: layer)
        rotationCoordinator = coordinator
        // L'interfaccia è bloccata in verticale: l'angolo della preview resta costante.
        let angle = coordinator.videoRotationAngleForHorizonLevelPreview
        if let connection = layer.connection, connection.isVideoRotationAngleSupported(angle) {
            connection.videoRotationAngle = angle
        }
    }

    private var captureAngle: CGFloat {
        rotationCoordinator?.videoRotationAngleForHorizonLevelCapture ?? 90
    }

    // MARK: - Diaframma (il cuore dell'app)

    var apertureStops: Double { Stops.fromFNumber(displayedAperture, base: caps.aperture.min) }

    var displayedAperture: Float {
        guard caps.aperture.isVariable else { return caps.aperture.min }
        return exposure.apertureAuto ? measured.aperture : exposure.aperture
    }

    /// Imposta un diaframma qualsiasi nell'intervallo, al centesimo.
    /// In manuale completo compensa con ISO (poi tempo) per mantenere invariata l'esposizione:
    /// cambia solo la profondità di campo.
    func setAperture(_ value: Float) {
        guard caps.aperture.isVariable else { return }
        let target = caps.aperture.clamp(value)
        let now = Date()
        if exposure.apertureAuto {
            exposure.aperture = caps.aperture.clamp(measured.aperture)
            exposure.apertureAuto = false
            anchor = nil
        }
        if anchor == nil || now.timeIntervalSince(lastApertureChange) > 0.8 {
            anchor = (exposure.aperture, exposure.iso, exposure.shutter)
        }
        lastApertureChange = now
        exposure.aperture = target
        if settings.compensateAperture, !exposure.isoAuto, !exposure.shutterAuto, let anchor {
            let ratio = Double(target / anchor.aperture)
            let wantedISO = Double(anchor.iso) * ratio * ratio
            let iso = Float(wantedISO).clamped(caps.minISO, caps.maxISO)
            let residual = wantedISO / Double(iso)
            exposure.iso = iso
            exposure.shutter = (anchor.shutter * residual).clamped(caps.minShutter, caps.maxShutter)
        }
        aeLocked = false
        engine.applyExposure(exposure)
    }

    // MARK: - Altri parametri

    func setShutter(_ seconds: Double) {
        exposure.shutterAuto = false
        exposure.shutter = seconds.clamped(caps.minShutter, caps.maxShutter)
        anchor = nil
        engine.applyExposure(exposure)
    }

    func setISO(_ value: Float) {
        exposure.isoAuto = false
        exposure.iso = value.clamped(caps.minISO, caps.maxISO)
        anchor = nil
        engine.applyExposure(exposure)
    }

    func setBias(_ value: Float) {
        exposure.bias = value.clamped(caps.minBias, caps.maxBias)
        engine.applyExposure(exposure)
    }

    func setKelvin(_ value: Float) {
        whiteBalance = WhiteBalanceState(auto: false, kelvin: value.clamped(2000, 10000))
        engine.applyWhiteBalance(whiteBalance)
    }

    func setFocus(_ value: Float) {
        focus = FocusState(auto: false, lensPosition: value.clamped(0, 1))
        engine.applyFocus(focus)
        updateOverlay()
    }

    func isAuto(_ kind: ControlKind) -> Bool {
        switch kind {
        case .aperture: return exposure.apertureAuto || !caps.aperture.isVariable
        case .shutter: return exposure.shutterAuto
        case .iso: return exposure.isoAuto
        case .whiteBalance: return whiteBalance.auto
        case .focus: return focus.auto
        case .bias: return abs(exposure.bias) < 0.01
        }
    }

    /// AUTO ↔ manuale. Passando a manuale si parte dal valore misurato: nessun salto d'immagine.
    func toggleAuto(_ kind: ControlKind) {
        haptics.soft()
        switch kind {
        case .aperture:
            guard caps.aperture.isVariable else { return }
            if exposure.apertureAuto { exposure.aperture = caps.aperture.clamp(measured.aperture) }
            exposure.apertureAuto.toggle()
        case .shutter:
            if exposure.shutterAuto { exposure.shutter = measured.shutter.clamped(caps.minShutter, caps.maxShutter) }
            exposure.shutterAuto.toggle()
        case .iso:
            if exposure.isoAuto { exposure.iso = measured.iso.clamped(caps.minISO, caps.maxISO) }
            exposure.isoAuto.toggle()
        case .whiteBalance:
            if whiteBalance.auto { whiteBalance.kelvin = measured.kelvin.clamped(2000, 10000) }
            whiteBalance.auto.toggle()
            engine.applyWhiteBalance(whiteBalance)
        case .focus:
            if focus.auto { focus.lensPosition = measured.lensPosition }
            focus.auto.toggle()
            engine.applyFocus(focus)
            updateOverlay()
        case .bias:
            exposure.bias = 0
        }
        anchor = nil
        aeLocked = false
        engine.applyExposure(exposure)
    }

    func resetAll() {
        stopRamp()
        exposure = ExposureState(aperture: exposure.aperture, shutter: exposure.shutter, iso: exposure.iso)
        whiteBalance.auto = true
        focus.auto = true
        aeLocked = false
        engine.applyExposure(exposure)
        engine.applyWhiteBalance(whiteBalance)
        engine.applyFocus(focus)
        updateOverlay()
        haptics.major()
    }

    // MARK: - Gesti sul mirino

    func tap(devicePoint: CGPoint, viewPoint: CGPoint) {
        aeLocked = false
        focusIndicator = viewPoint
        engine.focusAndExpose(at: devicePoint, focusAuto: focus.auto)
        haptics.soft()
        focusTask?.cancel()
        focusTask = Task { @MainActor [weak self] in
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            guard !Task.isCancelled else { return }
            withAnimation(.easeOut(duration: 0.25)) { self?.focusIndicator = nil }
        }
    }

    /// Pressione lunga: blocca AE/AF sui valori misurati (diventano valori manuali modificabili).
    func lockAEAF() {
        if caps.aperture.isVariable {
            exposure.aperture = caps.aperture.clamp(measured.aperture)
            exposure.apertureAuto = false
        }
        exposure.shutter = measured.shutter.clamped(caps.minShutter, caps.maxShutter)
        exposure.iso = measured.iso.clamped(caps.minISO, caps.maxISO)
        exposure.shutterAuto = false
        exposure.isoAuto = false
        focus = FocusState(auto: false, lensPosition: measured.lensPosition)
        anchor = nil
        aeLocked = true
        engine.applyExposure(exposure)
        engine.applyFocus(focus)
        updateOverlay()
        haptics.major()
    }

    func pinch(scale: CGFloat, ended: Bool) {
        if pinchBase <= 0 { pinchBase = zoom }
        let value = (pinchBase * scale).clamped(1, max(caps.maxZoom, 1))
        zoom = value
        engine.setZoom(value, animated: false)
        if ended { pinchBase = 0 }
    }

    func pinchBegan() { pinchBase = zoom }

    var equivalentFocalLength: Int {
        guard let lens = currentLens else { return 24 }
        return Int((Double(lens.equivalentFocalLength) / Double(lens.zoomFactor) * Double(zoom)).rounded())
    }

    // MARK: - Obiettivi e modalità

    func select(_ lens: Lens) {
        guard !isRecording, lens != currentLens || abs(zoom - lens.zoomFactor) > 0.01 else { return }
        haptics.tick()
        if lens.deviceID == currentLens?.deviceID {
            currentLens = lens
            zoom = lens.zoomFactor
            engine.setZoom(lens.zoomFactor, animated: true)
        } else {
            stopRamp()
            currentLens = lens
            engine.reconfigure(sessionConfig())
        }
    }

    func setMode(_ newMode: CaptureMode) {
        guard newMode != mode, !isRecording else { return }
        haptics.tick()
        stopRamp()
        mode = newMode
        engine.reconfigure(sessionConfig())
    }

    func settingsChanged(from old: IrisSettings, to new: IrisSettings) {
        new.save()
        engine.frameAnalyzer.histogramEnabled = new.showHistogram
        updateOverlay()
        if old.photoFormat.needsRAW != new.photoFormat.needsRAW
            || old.videoFPS != new.videoFPS
            || old.appleLog != new.appleLog
            || old.cameraControlAperture != new.cameraControlAperture {
            engine.reconfigure(sessionConfig())
        }
    }

    var peakingActive: Bool {
        switch settings.peaking {
        case .on: return true
        case .off: return false
        case .auto: return !focus.auto
        }
    }

    private func updateOverlay() {
        overlay?.peaking = peakingActive
        overlay?.zebra = settings.showZebra
        overlay?.zebraThreshold = Float(settings.zebraThreshold)
    }

    var overlayActive: Bool { peakingActive || settings.showZebra }

    // MARK: - Scatto e registrazione

    func shutterPressed() {
        switch mode {
        case .photo:
            haptics.shutter()
            engine.capturePhoto(
                format: settings.photoFormat,
                megapixels: settings.preferredMegapixels,
                lockedExposure: !exposure.isAllAuto || aeLocked,
                rotationAngle: captureAngle
            )
        case .video:
            haptics.major()
            if isRecording {
                engine.stopRecording()
            } else {
                engine.startRecording(codec: settings.videoCodec, rotationAngle: captureAngle)
            }
        }
    }

    private func blinkShutter() {
        flash = true
        Task { @MainActor [weak self] in
            try? await Task.sleep(nanoseconds: 90_000_000)
            withAnimation(.easeOut(duration: 0.18)) { self?.flash = false }
        }
    }

    func openPhotos() {
        if let url = URL(string: "photos-redirect://") { UIApplication.shared.open(url) }
    }

    // MARK: - Rampa di diaframma (tiraggio della profondità di campo)

    func markRamp(start: Bool) {
        if start { ramp.from = displayedAperture } else { ramp.to = displayedAperture }
        haptics.tick()
    }

    func startRamp() {
        guard let from = ramp.from, let to = ramp.to, caps.aperture.isVariable else { return }
        rampTask?.cancel()
        ramp.running = true
        ramp.progress = 0
        let base = caps.aperture.min
        let s0 = Stops.fromFNumber(from, base: base)
        let s1 = Stops.fromFNumber(to, base: base)
        let duration = max(ramp.duration, 0.5)
        let eased = ramp.eased
        anchor = nil
        setAperture(from)
        haptics.major()
        rampTask = Task { @MainActor [weak self] in
            let start = Date()
            while !Task.isCancelled {
                guard let self else { return }
                let t = min(1, Date().timeIntervalSince(start) / duration)
                let e = eased ? t * t * (3 - 2 * t) : t
                // Interpolazione in stop: variazione di luce percettivamente lineare.
                self.setAperture(Stops.toFNumber(s0 + (s1 - s0) * e, base: base))
                self.ramp.progress = t
                if t >= 1 { break }
                try? await Task.sleep(nanoseconds: 16_000_000)
            }
            self?.ramp.running = false
            self?.haptics.major()
        }
    }

    func stopRamp() {
        rampTask?.cancel()
        rampTask = nil
        ramp.running = false
    }

    // MARK: - Livella

    private func startMotion() {
        guard motion.isDeviceMotionAvailable, !motion.isDeviceMotionActive else { return }
        motion.deviceMotionUpdateInterval = 1.0 / 30.0
        motion.startDeviceMotionUpdates(to: .main) { [weak self] data, _ in
            guard let gravity = data?.gravity else { return }
            let (x, y, z) = (gravity.x, gravity.y, gravity.z)
            MainActor.assumeIsolated { self?.updateLevel(x: x, y: y, z: z) }
        }
    }

    private func updateLevel(x: Double, y: Double, z: Double) {
        let angle = atan2(x, -y) * 180 / .pi
        let deviation = angle - (angle / 90).rounded() * 90
        let level = abs(deviation) < 0.5
        if level && !isLevel { haptics.soft() }
        rollAngle = angle
        isLevel = level
        levelUsable = abs(z) < 0.85
    }

    // MARK: - Messaggi

    func show(_ text: String) {
        withAnimation(.easeOut(duration: 0.2)) { toast = text }
        toastTask?.cancel()
        toastTask = Task { @MainActor [weak self] in
            try? await Task.sleep(nanoseconds: 2_400_000_000)
            guard !Task.isCancelled else { return }
            withAnimation(.easeIn(duration: 0.25)) { self?.toast = nil }
        }
    }
}

// MARK: - Haptics

@MainActor
final class Haptics {
    private let selection = UISelectionFeedbackGenerator()
    private let light = UIImpactFeedbackGenerator(style: .light)
    private let medium = UIImpactFeedbackGenerator(style: .medium)
    private let rigid = UIImpactFeedbackGenerator(style: .rigid)

    func prepare() {
        selection.prepare()
        medium.prepare()
    }

    func tick() { selection.selectionChanged() }
    func major() { medium.impactOccurred() }
    func limit() { rigid.impactOccurred(intensity: 0.9) }
    func soft() { light.impactOccurred(intensity: 0.55) }
    func shutter() { rigid.impactOccurred(intensity: 0.7) }
}
