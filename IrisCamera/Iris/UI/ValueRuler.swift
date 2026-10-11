import SwiftUI

/// Descrive un righello di regolazione. Le unità sono lineari per la percezione:
/// stop per diaframma/tempo/ISO, centinaia di kelvin per il WB, ecc.
struct RulerSpec {
    var range: ClosedRange<Double>
    var pointsPerUnit: CGFloat
    var minorStep: Double
    var majorStep: Double?
    var labels: [(Double, String)] = []
    var highlights: [Double] = []
    var snapStep: Double?
    var snapOrigin: Double = 0
    var snapTargets: [Double]?

    func clamp(_ u: Double) -> Double { min(max(u, range.lowerBound), range.upperBound) }

    func snap(_ u: Double) -> Double {
        if let targets = snapTargets, !targets.isEmpty {
            return targets.min { abs($0 - u) < abs($1 - u) } ?? u
        }
        if let step = snapStep, step > 0 {
            return clamp(((u + snapOrigin) / step).rounded() * step - snapOrigin)
        }
        return u
    }

    var isDegenerate: Bool { range.upperBound - range.lowerBound < 0.0001 }
}

/// Righello orizzontale a trascinamento con regolazione fine:
/// più si solleva il dito dal righello, più il movimento rallenta (×½, ×¼, ×⅒).
struct ValueRuler: View {
    let spec: RulerSpec
    let value: Double
    let isAuto: Bool
    let haptics: Haptics
    let onChange: @MainActor (Double) -> Void
    var onFineChange: @MainActor (Double) -> Void = { _ in }

    @State private var raw: Double?
    @State private var lastX: CGFloat = 0
    @State private var startY: CGFloat = 0
    @State private var lastEmitted: Double = 0
    @State private var atLimit = false

    var body: some View {
        GeometryReader { geo in
            ZStack {
                Canvas { context, size in draw(context: context, size: size) }
                    .mask(
                        LinearGradient(
                            stops: [
                                .init(color: .clear, location: 0),
                                .init(color: .black, location: 0.14),
                                .init(color: .black, location: 0.86),
                                .init(color: .clear, location: 1)
                            ],
                            startPoint: .leading, endPoint: .trailing
                        )
                    )
                // Indice centrale
                VStack(spacing: 0) {
                    Triangle()
                        .fill(isAuto ? Theme.dim : Theme.accent)
                        .frame(width: 9, height: 6)
                    Rectangle()
                        .fill(isAuto ? Theme.dim : Theme.accent)
                        .frame(width: 2, height: 24)
                    Spacer(minLength: 0)
                }
                .allowsHitTesting(false)
            }
            .contentShape(Rectangle())
            .gesture(drag(width: geo.size.width))
            .opacity(spec.isDegenerate ? 0.35 : 1)
            .allowsHitTesting(!spec.isDegenerate)
        }
        .frame(height: 52)
        .accessibilityElement()
        .accessibilityAdjustableAction { direction in
            let step = spec.snapStep ?? spec.minorStep
            let next = spec.clamp(value + (direction == .increment ? step : -step))
            onChange(spec.snap(next))
        }
    }

    // MARK: Disegno

    private func draw(context: GraphicsContext, size: CGSize) {
        let cx = size.width / 2
        let ppu = spec.pointsPerUnit
        let halfUnits = Double(size.width / ppu) / 2 + spec.minorStep
        let lo = max(spec.range.lowerBound, value - halfUnits)
        let hi = min(spec.range.upperBound, value + halfUnits)
        let top: CGFloat = 6

        func x(_ u: Double) -> CGFloat { cx + CGFloat(u - value) * ppu }
        func isMultiple(_ u: Double, of step: Double) -> Bool {
            let q = u / step
            return abs(q - q.rounded()) < 1e-6
        }

        var minor = Path()
        var major = Path()
        if spec.minorStep > 0 {
            var k = (lo / spec.minorStep).rounded(.up)
            while k * spec.minorStep <= hi + 1e-9 {
                let u = k * spec.minorStep
                let px = x(u)
                if let m = spec.majorStep, isMultiple(u, of: m) {
                    major.move(to: CGPoint(x: px, y: top))
                    major.addLine(to: CGPoint(x: px, y: top + 15))
                } else {
                    minor.move(to: CGPoint(x: px, y: top + 2))
                    minor.addLine(to: CGPoint(x: px, y: top + 9))
                }
                k += 1
            }
        }
        // Estremi del campo
        for edge in [spec.range.lowerBound, spec.range.upperBound] where edge >= lo - 1e-9 && edge <= hi + 1e-9 {
            major.move(to: CGPoint(x: x(edge), y: top - 2))
            major.addLine(to: CGPoint(x: x(edge), y: top + 17))
        }
        context.stroke(minor, with: .color(Theme.faint), lineWidth: 1)
        context.stroke(major, with: .color(Theme.dim), lineWidth: 1)

        var accent = Path()
        for h in spec.highlights where h >= lo - 1e-9 && h <= hi + 1e-9 {
            accent.move(to: CGPoint(x: x(h), y: top))
            accent.addLine(to: CGPoint(x: x(h), y: top + 17))
        }
        context.stroke(accent, with: .color(Theme.accent.opacity(0.85)), lineWidth: 1.5)

        for (u, text) in spec.labels where u >= lo - 0.5 && u <= hi + 0.5 {
            let highlighted = spec.highlights.contains { abs($0 - u) < 1e-6 }
            let label = Text(text)
                .font(Theme.value(10, highlighted ? .semibold : .regular))
                .foregroundStyle(highlighted ? Theme.accent : Theme.dim)
            context.draw(label, at: CGPoint(x: x(u), y: top + 30), anchor: .center)
        }
    }

    // MARK: Gesto

    private func drag(width: CGFloat) -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { g in
                if raw == nil {
                    raw = value
                    lastX = g.location.x
                    startY = g.startLocation.y
                    lastEmitted = value
                    atLimit = false
                    haptics.prepare()
                }
                let dx = g.location.x - lastX
                lastX = g.location.x
                let lift = max(0, startY - g.location.y)
                let factor: Double = lift < 50 ? 1 : lift < 110 ? 0.5 : lift < 170 ? 0.25 : 0.1
                onFineChange(factor)

                let unclamped = (raw ?? value) - Double(dx / spec.pointsPerUnit) * factor
                let clamped = spec.clamp(unclamped)
                let hitsEdge = clamped != unclamped
                if hitsEdge && !atLimit { haptics.limit() }
                atLimit = hitsEdge
                raw = clamped

                let snapped = spec.snap(clamped)
                guard abs(snapped - lastEmitted) > 1e-9 else { return }
                feedback(from: lastEmitted, to: snapped)
                lastEmitted = snapped
                onChange(snapped)
            }
            .onEnded { g in
                let moved = abs(g.translation.width) + abs(g.translation.height)
                if moved < 4 { tap(at: g.location.x, width: width) }
                raw = nil
                onFineChange(1)
            }
    }

    /// Tocco su un'etichetta: salta a quel valore.
    private func tap(at px: CGFloat, width: CGFloat) {
        let u = value + Double((px - width / 2) / spec.pointsPerUnit)
        let candidates = spec.labels.map(\.0) + spec.highlights
        guard let target = candidates.min(by: { abs($0 - u) < abs($1 - u) }),
              abs(target - u) * Double(spec.pointsPerUnit) < 26 else { return }
        haptics.major()
        onChange(spec.clamp(target))
    }

    /// Click aptico a ogni tacca, colpo più deciso sugli stop evidenziati.
    private func feedback(from a: Double, to b: Double) {
        let lo = min(a, b), hi = max(a, b)
        if spec.highlights.contains(where: { $0 > lo + 1e-9 && $0 <= hi + 1e-9 }) {
            haptics.major()
            return
        }
        let step = spec.minorStep
        guard step > 0 else { return }
        if Int((a / step).rounded(.down)) != Int((b / step).rounded(.down)) || spec.snapTargets != nil || spec.snapStep != nil {
            haptics.tick()
        }
    }
}

struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.midX, y: rect.maxY))
        p.closeSubpath()
        return p
    }
}
