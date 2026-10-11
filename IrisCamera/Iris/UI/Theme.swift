import SwiftUI

enum Theme {
    /// Ambra "iris": unico colore d'accento, usato solo per ciò che è attivo o da guardare.
    static let accent = Color(red: 1.0, green: 0.62, blue: 0.18)
    static let ink = Color(white: 0.96)
    static let dim = Color(white: 0.56)
    static let faint = Color(white: 0.3)
    static let hairline = Color(white: 0.18)
    static let panel = Color(white: 0.06)
    static let record = Color(red: 1.0, green: 0.27, blue: 0.23)

    static func value(_ size: CGFloat, _ weight: Font.Weight = .medium) -> Font {
        .system(size: size, weight: weight).monospacedDigit()
    }

    static func caps(_ size: CGFloat = 10, _ weight: Font.Weight = .semibold) -> Font {
        .system(size: size, weight: weight)
    }
}

extension View {
    /// Etichetta in maiuscoletto spaziato, lo stile tipografico di servizio dell'app.
    func capsLabel(_ size: CGFloat = 10, color: Color = Theme.dim) -> some View {
        font(Theme.caps(size)).tracking(1.4).foregroundStyle(color)
    }
}
