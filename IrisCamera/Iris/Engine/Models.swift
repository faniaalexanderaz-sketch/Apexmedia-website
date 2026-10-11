import AVFoundation
import CoreMedia

// MARK: - Modalità di cattura

enum CaptureMode: String, Codable, CaseIterable {
    case photo, video

    var title: String { self == .photo ? "FOTO" : "VIDEO" }
}

enum PhotoFormat: String, Codable, CaseIterable, Identifiable {
    case heif, jpeg, proRAW, rawPlusHEIF

    var id: String { rawValue }
    var title: String {
        switch self {
        case .heif: return "HEIF"
        case .jpeg: return "JPEG"
        case .proRAW: return "ProRAW"
        case .rawPlusHEIF: return "RAW+HEIF"
        }
    }
    var needsRAW: Bool { self == .proRAW || self == .rawPlusHEIF }
}

enum VideoCodecChoice: String, Codable, CaseIterable, Identifiable {
    case hevc, proRes

    var id: String { rawValue }
    var title: String { self == .hevc ? "HEVC" : "ProRes 422 HQ" }
}

/// Granularità del diaframma. `free` = nessuno scatto: qualsiasi valore tra min e max.
enum AperturePrecision: String, Codable, CaseIterable, Identifiable {
    case free, tenth, third, apple

    var id: String { rawValue }
    var title: String {
        switch self {
        case .free: return "Libera"
        case .tenth: return "1/10 stop"
        case .third: return "1/3 stop"
        case .apple: return "Stop Apple"
        }
    }
    /// Passo di aggancio in stop (nil = continuo o agganciato ai valori Apple).
    var snapStep: Double? {
        switch self {
        case .free, .apple: return nil
        case .tenth: return 0.1
        case .third: return 1.0 / 3.0
        }
    }
}

enum PeakingMode: String, Codable, CaseIterable, Identifiable {
    case auto, on, off

    var id: String { rawValue }
    var title: String {
        switch self {
        case .auto: return "Auto (MF)"
        case .on: return "Sempre"
        case .off: return "Off"
        }
    }
}

enum ControlKind: String, CaseIterable, Identifiable {
    case aperture, shutter, iso, whiteBalance, focus, bias

    var id: String { rawValue }
}

// MARK: - Impostazioni persistenti

struct IrisSettings: Codable, Equatable {
    var photoFormat: PhotoFormat = .heif
    var preferredMegapixels: Int = 48
    var aperturePrecision: AperturePrecision = .free
    /// In manuale completo, cambiando diaframma l'ISO (poi il tempo) compensa per mantenere la stessa esposizione.
    var compensateAperture: Bool = true
    var showGrid: Bool = true
    var showHistogram: Bool = true
    var showLevel: Bool = true
    var showZebra: Bool = false
    var zebraThreshold: Double = 0.95
    var peaking: PeakingMode = .auto
    var videoFPS: Int = 30
    var videoCodec: VideoCodecChoice = .hevc
    var appleLog: Bool = false
    var cameraControlAperture: Bool = true

    static let storageKey = "iris.settings.v1"

    static func load() -> IrisSettings {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let value = try? JSONDecoder().decode(IrisSettings.self, from: data) else { return IrisSettings() }
        return value
    }

    func save() {
        if let data = try? JSONEncoder().encode(self) {
            UserDefaults.standard.set(data, forKey: Self.storageKey)
        }
    }
}

// MARK: - Esposizione

/// Il triangolo dell'esposizione. Ogni parametro può essere AUTO o bloccato:
/// le combinazioni producono P / A / S / ISO / M e le priorità miste.
struct ExposureState: Equatable {
    var apertureAuto = true
    var aperture: Float = 1.8
    var shutterAuto = true
    var shutter: Double = 1.0 / 120.0
    var isoAuto = true
    var iso: Float = 100
    var bias: Float = 0

    var isAllAuto: Bool { apertureAuto && shutterAuto && isoAuto }
    var isFullManual: Bool { !apertureAuto && !shutterAuto && !isoAuto }

    func modeLabel(variableAperture: Bool) -> String {
        let a = !apertureAuto && variableAperture
        let s = !shutterAuto
        let i = !isoAuto
        switch (a, s, i) {
        case (false, false, false): return "P"
        case (true, false, false): return "A"
        case (false, true, false): return "S"
        case (false, false, true): return "ISO"
        case (true, true, true): return "M"
        case (false, true, true): return variableAperture ? "S·ISO" : "M"
        case (true, true, false): return "A·S"
        case (true, false, true): return "A·ISO"
        }
    }
}

struct WhiteBalanceState: Equatable {
    var auto = true
    var kelvin: Float = 5500
}

struct FocusState: Equatable {
    var auto = true
    var lensPosition: Float = 0.5
}

/// Valori realmente applicati dal sensore, letti dal device ~12 volte al secondo.
struct MeasuredValues: Equatable {
    var aperture: Float = 1.8
    var iso: Float = 100
    var shutter: Double = 1.0 / 120.0
    var lensPosition: Float = 0.5
    var kelvin: Float = 5500
    var bias: Float = 0
}

struct ApertureRange: Equatable {
    var min: Float = 1.8
    var max: Float = 1.8
    var recommended: [Float] = []

    var isVariable: Bool { max - min > 0.01 }

    func clamp(_ value: Float) -> Float { Swift.min(Swift.max(value, min), max) }
}

struct DeviceCapabilities: Equatable {
    var aperture = ApertureRange()
    var minISO: Float = 50
    var maxISO: Float = 3200
    var minShutter: Double = 1.0 / 8000.0
    var maxShutter: Double = 1.0
    var minBias: Float = -3
    var maxBias: Float = 3
    var supportsManualFocus = true
    var supportsManualWB = true
    var maxZoom: CGFloat = 1
    var photoMegapixels: [Int] = []
    var supportsProRAW = false
    var supportsAppleLog = false
    var supportsProRes = false
    var supportsControls = false
    var bufferAspect: CGFloat = 4.0 / 3.0   // lato lungo / lato corto del buffer video
}

// MARK: - Obiettivi

struct Lens: Identifiable, Hashable {
    let deviceID: String
    let zoomFactor: CGFloat        // videoZoomFactor applicato al device fisico
    let relativeZoom: CGFloat      // rispetto al grandangolo principale (1×)
    let equivalentFocalLength: Int // mm equivalenti 35mm
    let hasVariableAperture: Bool
    let fixedAperture: Float

    var id: String { "\(deviceID)@\(zoomFactor)" }
}

// MARK: - Matematica degli stop

enum Stops {
    /// Stop di luce persi rispetto a `base` (f-number): 1 stop = ×√2.
    static func fromFNumber(_ n: Float, base: Float) -> Double {
        2.0 * log2(Double(n) / Double(base))
    }

    static func toFNumber(_ stops: Double, base: Float) -> Float {
        Float(Double(base) * pow(2.0, stops / 2.0))
    }

    static func fromSeconds(_ s: Double, base: Double) -> Double { log2(s / base) }
    static func toSeconds(_ stops: Double, base: Double) -> Double { base * pow(2.0, stops) }

    static func fromISO(_ iso: Float, base: Float) -> Double { log2(Double(iso) / Double(base)) }
    static func toISO(_ stops: Double, base: Float) -> Float { Float(Double(base) * pow(2.0, stops)) }
}

// MARK: - Formattazione

enum Fmt {
    static func aperture(_ n: Float) -> String {
        let tenth = (n * 10).rounded() / 10
        if abs(n - tenth) < 0.005 { return String(format: "%.1f", tenth) }
        return String(format: "%.2f", n)
    }

    static func shutter(_ s: Double) -> String {
        if s >= 0.95 {
            let v = (s * 10).rounded() / 10
            return v == v.rounded() ? "\(Int(v))″" : String(format: "%.1f″", v)
        }
        if s >= 0.3 { return String(format: "%.1f″", s) }
        return "1/\(Int((1.0 / s).rounded()))"
    }

    static func iso(_ v: Float) -> String { "\(Int(v.rounded()))" }

    static func kelvin(_ k: Float) -> String { "\(Int((k / 10).rounded() * 10))K" }

    static func ev(_ e: Float) -> String {
        if abs(e) < 0.05 { return "±0.0" }
        return (e > 0 ? "+" : "−") + String(format: "%.1f", abs(e))
    }

    static func focus(_ p: Float) -> String { String(format: "%.2f", p) }

    static func duration(_ t: TimeInterval) -> String {
        let total = Int(t)
        return String(format: "%02d:%02d", total / 60, total % 60)
    }
}

extension Comparable {
    func clamped(_ lo: Self, _ hi: Self) -> Self { min(max(self, lo), hi) }
}
