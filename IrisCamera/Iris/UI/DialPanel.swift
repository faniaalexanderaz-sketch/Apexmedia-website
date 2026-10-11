import SwiftUI

/// Pannello di regolazione del parametro selezionato: AUTO, lettura grande, righello, riga informativa.
struct DialPanel: View {
    let model: CameraModel
    @State private var fineFactor: Double = 1

    var body: some View {
        let kind = model.selected
        let control = model.control(for: kind)
        VStack(spacing: 4) {
            if kind == .aperture && model.showRampEditor {
                RampEditor(model: model)
                    .frame(height: 40)
            } else {
                header(kind: kind, control: control)
                    .frame(height: 40)
            }
            ValueRuler(
                spec: control.spec,
                value: control.units,
                isAuto: control.auto,
                haptics: model.haptics,
                onChange: control.set,
                onFineChange: { factor in
                    if factor != fineFactor { fineFactor = factor }
                }
            )
            .id(kind)
            Text(fineFactor < 1 ? fineLabel : control.info)
                .font(Theme.value(10))
                .foregroundStyle(fineFactor < 1 ? Theme.accent : Theme.dim)
                .lineLimit(1)
                .frame(height: 14)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 6)
    }

    private var fineLabel: String {
        let text = fineFactor <= 0.1 ? "⅒" : fineFactor <= 0.25 ? "¼" : "½"
        return "REGOLAZIONE FINE ×\(text)  ·  solleva il dito per più precisione"
    }

    @ViewBuilder
    private func header(kind: ControlKind, control: ControlState) -> some View {
        HStack(spacing: 12) {
            AutoPill(isAuto: control.auto, enabled: control.autoToggleEnabled) {
                model.toggleAuto(kind)
            }
            Spacer(minLength: 0)
            HStack(spacing: 10) {
                if kind == .aperture {
                    IrisGlyph(
                        fNumber: model.displayedAperture,
                        minF: model.caps.aperture.min,
                        maxF: model.caps.aperture.isVariable ? model.caps.aperture.max : model.caps.aperture.min * 2.7
                    )
                    .frame(width: 30, height: 30)
                }
                Text(control.readout)
                    .font(Theme.value(30, .light))
                    .foregroundStyle(control.auto ? Theme.dim : Theme.ink)
                    .contentTransition(.numericText())
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
            }
            Spacer(minLength: 0)
            if kind == .aperture && model.caps.aperture.isVariable {
                Button {
                    model.showRampEditor = true
                    model.haptics.tick()
                } label: {
                    Text("RAMPA").capsLabel(10, color: Theme.ink)
                        .padding(.horizontal, 10).padding(.vertical, 7)
                        .overlay(Capsule().stroke(Theme.faint, lineWidth: 1))
                }
            } else {
                Color.clear.frame(width: 62, height: 1)
            }
        }
    }
}

struct AutoPill: View {
    let isAuto: Bool
    let enabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text("AUTO")
                .capsLabel(10, color: isAuto ? .black : Theme.dim)
                .padding(.horizontal, 10).padding(.vertical, 7)
                .background(Capsule().fill(isAuto ? Theme.accent : .clear))
                .overlay(Capsule().stroke(isAuto ? .clear : Theme.faint, lineWidth: 1))
        }
        .disabled(!enabled)
        .opacity(enabled ? 1 : 0.4)
        .frame(width: 62, alignment: .leading)
    }
}

/// Diaframma a 6 lamelle come quello fisico: l'apertura (e la rotazione delle lamelle) segue l'f-number.
struct IrisGlyph: View {
    let fNumber: Float
    let minF: Float
    let maxF: Float

    var body: some View {
        Canvas { context, size in
            let r = min(size.width, size.height) / 2 - 1
            let c = CGPoint(x: size.width / 2, y: size.height / 2)
            let circle = Path(ellipseIn: CGRect(x: c.x - r, y: c.y - r, width: r * 2, height: r * 2))
            let open = CGFloat(minF / max(fNumber, 0.1))               // diametro ∝ 1/N
            let travel = CGFloat((fNumber - minF) / max(maxF - minF, 0.01)).clamped(0, 1)
            let opening = r * 0.9 * open
            let rotation = Double(travel) * .pi / 4

            var hexagon = Path()
            var vertices: [CGPoint] = []
            for i in 0..<6 {
                let a = Double(i) * .pi / 3 + rotation
                let p = CGPoint(x: c.x + opening * CGFloat(cos(a)), y: c.y + opening * CGFloat(sin(a)))
                vertices.append(p)
                if i == 0 { hexagon.move(to: p) } else { hexagon.addLine(to: p) }
            }
            hexagon.closeSubpath()

            context.fill(circle, with: .color(Theme.panel))
            context.fill(hexagon, with: .color(Theme.accent.opacity(0.9)))
            var blades = Path()
            for i in 0..<6 {
                let v = vertices[i]
                let prev = vertices[(i + 5) % 6]
                let dx = v.x - prev.x, dy = v.y - prev.y
                let len = max(sqrt(dx * dx + dy * dy), 0.001)
                blades.move(to: v)
                blades.addLine(to: CGPoint(x: v.x + dx / len * r * 2, y: v.y + dy / len * r * 2))
            }
            var clipped = context
            clipped.clip(to: circle)
            clipped.stroke(blades, with: .color(Theme.dim), lineWidth: 0.8)
            context.stroke(circle, with: .color(Theme.faint), lineWidth: 1)
        }
        .accessibilityHidden(true)
    }
}

struct RampEditor: View {
    let model: CameraModel

    var body: some View {
        HStack(spacing: 8) {
            point(title: "A", value: model.ramp.from) { model.markRamp(start: true) }
            Image(systemName: "arrow.right").font(.system(size: 10, weight: .semibold)).foregroundStyle(Theme.dim)
            point(title: "B", value: model.ramp.to) { model.markRamp(start: false) }
            Menu {
                ForEach([2.0, 5.0, 10.0, 20.0, 40.0], id: \.self) { seconds in
                    Button("\(Int(seconds)) s") { model.ramp.duration = seconds }
                }
            } label: {
                Text("\(Int(model.ramp.duration))s").font(Theme.value(12)).foregroundStyle(Theme.ink)
                    .frame(width: 34)
            }
            Button {
                model.ramp.eased.toggle()
            } label: {
                Image(systemName: model.ramp.eased ? "point.topleft.down.to.point.bottomright.curvepath" : "line.diagonal")
                    .font(.system(size: 13))
                    .foregroundStyle(Theme.ink)
                    .frame(width: 26)
            }
            Spacer(minLength: 0)
            Button {
                model.ramp.running ? model.stopRamp() : model.startRamp()
            } label: {
                ZStack {
                    Circle().stroke(Theme.faint, lineWidth: 1)
                    Circle().trim(from: 0, to: model.ramp.progress)
                        .stroke(Theme.accent, style: StrokeStyle(lineWidth: 2, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    Image(systemName: model.ramp.running ? "stop.fill" : "play.fill")
                        .font(.system(size: 11))
                        .foregroundStyle(model.ramp.from != nil && model.ramp.to != nil ? Theme.accent : Theme.faint)
                }
                .frame(width: 32, height: 32)
            }
            .disabled(model.ramp.from == nil || model.ramp.to == nil)
            Button {
                model.stopRamp()
                model.showRampEditor = false
            } label: {
                Image(systemName: "xmark").font(.system(size: 11, weight: .semibold)).foregroundStyle(Theme.dim)
                    .frame(width: 24, height: 32)
            }
        }
    }

    private func point(title: String, value: Float?, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(title).capsLabel(9, color: Theme.accent)
                Text(value.map { "ƒ" + Fmt.aperture($0) } ?? "fissa")
                    .font(Theme.value(13))
                    .foregroundStyle(value == nil ? Theme.dim : Theme.ink)
            }
            .padding(.horizontal, 8).padding(.vertical, 6)
            .overlay(Capsule().stroke(Theme.faint, lineWidth: 1))
        }
    }
}

// MARK: - Mappatura parametri → righello

struct ControlState {
    let spec: RulerSpec
    let units: Double
    let readout: String
    let info: String
    let auto: Bool
    let autoToggleEnabled: Bool
    let set: @MainActor (Double) -> Void
}

extension CameraModel {
    private static let shutterThirds: [Double] = [
        1.0 / 16000, 1.0 / 12800, 1.0 / 10000, 1.0 / 8000, 1.0 / 6400, 1.0 / 5000, 1.0 / 4000, 1.0 / 3200, 1.0 / 2500,
        1.0 / 2000, 1.0 / 1600, 1.0 / 1250, 1.0 / 1000, 1.0 / 800, 1.0 / 640, 1.0 / 500, 1.0 / 400, 1.0 / 320,
        1.0 / 250, 1.0 / 200, 1.0 / 160, 1.0 / 125, 1.0 / 100, 1.0 / 80, 1.0 / 60, 1.0 / 50, 1.0 / 48, 1.0 / 40,
        1.0 / 30, 1.0 / 25, 1.0 / 24, 1.0 / 20, 1.0 / 15, 1.0 / 13, 1.0 / 10, 1.0 / 8, 1.0 / 6, 1.0 / 5, 1.0 / 4,
        0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.3, 1.6, 2, 2.5, 3.2, 4, 5, 6, 8, 10
    ]
    private static let shutterLabels: [(Int, String)] = [
        (-14, "1/16000"), (-13, "1/8000"), (-12, "1/4000"), (-11, "1/2000"), (-10, "1/1000"), (-9, "1/500"),
        (-8, "1/250"), (-7, "1/125"), (-6, "1/60"), (-5, "1/30"), (-4, "1/15"), (-3, "1/8"), (-2, "1/4"),
        (-1, "½″"), (0, "1″"), (1, "2″"), (2, "4″"), (3, "8″")
    ]
    private static let isoThirds: [Float] = [
        25, 32, 40, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600,
        2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600
    ]

    func control(for kind: ControlKind) -> ControlState {
        switch kind {
        case .aperture: return apertureControl()
        case .shutter: return shutterControl()
        case .iso: return isoControl()
        case .whiteBalance: return whiteBalanceControl()
        case .focus: return focusControl()
        case .bias: return biasControl()
        }
    }

    private func apertureControl() -> ControlState {
        let range = caps.aperture
        let base = range.min
        guard range.isVariable else {
            return ControlState(
                spec: RulerSpec(range: 0...0, pointsPerUnit: 90, minorStep: 0.1),
                units: 0,
                readout: "ƒ" + Fmt.aperture(base),
                info: "Diaframma fisso su questo obiettivo · variabile solo sul principale",
                auto: true, autoToggleEnabled: false, set: { _ in }
            )
        }
        let maxStops = Stops.fromFNumber(range.max, base: base)
        let stops = range.recommended.map { Stops.fromFNumber($0, base: base) }
        var labels = zip(stops, range.recommended).map { ($0, Fmt.aperture($1)) }
        if labels.isEmpty {
            labels = [(0, Fmt.aperture(range.min)), (maxStops, Fmt.aperture(range.max))]
        }
        let precision = settings.aperturePrecision
        let spec = RulerSpec(
            range: 0...maxStops,
            pointsPerUnit: 92,
            minorStep: 0.1,
            majorStep: 1,
            labels: labels,
            highlights: stops,
            snapStep: precision.snapStep,
            snapOrigin: 2 * log2(Double(base)),
            snapTargets: precision == .apple ? stops : nil
        )
        let n = displayedAperture
        let lightLoss = Stops.fromFNumber(n, base: base)
        let depth = n / base
        var info = String(format: "−%.2f EV di luce  ·  PdC ×%.2f", lightLoss, depth)
        if exposure.apertureAuto {
            info = "AUTO: il sistema gestisce il diaframma · tocca il righello per prenderlo"
        } else if abs(measured.aperture - exposure.aperture) > 0.015 {
            info += "  ·  in movimento ƒ" + Fmt.aperture(measured.aperture)
        } else {
            info += "  ·  reale ƒ" + Fmt.aperture(measured.aperture)
        }
        return ControlState(
            spec: spec,
            units: Stops.fromFNumber(n, base: base),
            readout: "ƒ" + Fmt.aperture(n),
            info: info,
            auto: exposure.apertureAuto,
            autoToggleEnabled: true,
            set: { [weak self] u in self?.setAperture(Stops.toFNumber(u, base: base)) }
        )
    }

    private func shutterControl() -> ControlState {
        let lo = log2(caps.minShutter), hi = log2(caps.maxShutter)
        let seconds = exposure.shutterAuto ? measured.shutter : exposure.shutter
        var targets = Self.shutterThirds.filter { $0 >= caps.minShutter * 0.999 && $0 <= caps.maxShutter * 1.001 }.map { log2($0) }
        var highlights: [Double] = []
        var info = exposure.shutterAuto ? "AUTO · tocca il righello per bloccare il tempo" : "Tempo di posa bloccato"
        if mode == .video {
            let angle180 = 1.0 / Double(settings.videoFPS * 2)
            if angle180 >= caps.minShutter && angle180 <= caps.maxShutter {
                highlights = [log2(angle180)]
                targets.append(log2(angle180))
            }
            info = "Regola dei 180° a \(settings.videoFPS) fps: " + Fmt.shutter(angle180)
        }
        let labels = Self.shutterLabels
            .map { (Double($0.0), $0.1) }
            .filter { $0.0 >= lo - 0.01 && $0.0 <= hi + 0.01 }
        let spec = RulerSpec(
            range: lo...max(hi, lo + 0.0001),
            pointsPerUnit: 30,
            minorStep: 1.0 / 3.0,
            majorStep: 1,
            labels: labels,
            highlights: highlights,
            snapTargets: targets
        )
        return ControlState(
            spec: spec,
            units: log2(max(seconds, 1e-6)),
            readout: Fmt.shutter(seconds),
            info: info,
            auto: exposure.shutterAuto,
            autoToggleEnabled: true,
            set: { [weak self] u in self?.setShutter(pow(2, u)) }
        )
    }

    private func isoControl() -> ControlState {
        let minISO = caps.minISO, maxISO = caps.maxISO
        let iso = exposure.isoAuto ? measured.iso : exposure.iso
        let maxUnits = Stops.fromISO(maxISO, base: minISO)
        var values = Self.isoThirds.filter { $0 > minISO * 1.02 && $0 < maxISO * 0.98 }
        values.append(minISO)
        values.append(maxISO)
        let targets = values.map { Stops.fromISO($0, base: minISO) }
        let labels: [(Double, String)] = ([minISO] + [100, 200, 400, 800, 1600, 3200, 6400, 12800].filter { $0 > minISO * 1.15 && $0 <= maxISO })
            .map { (Stops.fromISO($0, base: minISO), Fmt.iso($0)) }
        let spec = RulerSpec(
            range: 0...max(maxUnits, 0.0001),
            pointsPerUnit: 40,
            minorStep: 1.0 / 3.0,
            majorStep: 1,
            labels: labels,
            snapTargets: targets
        )
        let gain = Stops.fromISO(iso, base: minISO)
        return ControlState(
            spec: spec,
            units: gain,
            readout: "ISO " + Fmt.iso(iso),
            info: String(format: "Guadagno +%.1f stop sul nativo ISO %@", gain, Fmt.iso(minISO)),
            auto: exposure.isoAuto,
            autoToggleEnabled: true,
            set: { [weak self] u in self?.setISO(Stops.toISO(u, base: minISO)) }
        )
    }

    private func whiteBalanceControl() -> ControlState {
        let kelvin = whiteBalance.auto ? measured.kelvin : whiteBalance.kelvin
        let labels: [(Double, String)] = stride(from: 20, through: 100, by: 10).map { (Double($0), "\($0 / 10)K") }
        let spec = RulerSpec(
            range: 20...100,
            pointsPerUnit: 5,
            minorStep: 1,
            majorStep: 10,
            labels: labels,
            highlights: [32, 56],
            snapStep: 0.5
        )
        return ControlState(
            spec: spec,
            units: Double(kelvin / 100),
            readout: Fmt.kelvin(kelvin),
            info: caps.supportsManualWB ? "Tungsteno 3200K  ·  Luce diurna 5600K" : "WB manuale non supportato",
            auto: whiteBalance.auto,
            autoToggleEnabled: caps.supportsManualWB,
            set: { [weak self] u in self?.setKelvin(Float(u * 100)) }
        )
    }

    private func focusControl() -> ControlState {
        let position = focus.auto ? measured.lensPosition : focus.lensPosition
        let spec = RulerSpec(
            range: 0...100,
            pointsPerUnit: 3.4,
            minorStep: 2,
            majorStep: 10,
            labels: [(0, "VICINO"), (50, "·"), (100, "∞")]
        )
        let info: String
        if !caps.supportsManualFocus {
            info = "Messa a fuoco manuale non supportata"
        } else if focus.auto {
            info = "AF continuo · tocca il mirino per scegliere il punto"
        } else {
            info = peakingActive ? "MF · peaking attivo sui bordi a fuoco" : "MF · posizione lente " + Fmt.focus(position)
        }
        return ControlState(
            spec: spec,
            units: Double(position * 100),
            readout: focus.auto ? "AF" : "MF " + Fmt.focus(position),
            info: info,
            auto: focus.auto,
            autoToggleEnabled: caps.supportsManualFocus,
            set: { [weak self] u in self?.setFocus(Float(u / 100)) }
        )
    }

    private func biasControl() -> ControlState {
        let lo = Double(max(caps.minBias, -3)), hi = Double(min(caps.maxBias, 3))
        let labels: [(Double, String)] = stride(from: lo.rounded(.up), through: hi, by: 1).map { v in
            (v, v == 0 ? "0" : (v > 0 ? "+\(Int(v))" : "−\(Int(-v))"))
        }
        let spec = RulerSpec(
            range: lo...max(hi, lo + 0.0001),
            pointsPerUnit: 54,
            minorStep: 1.0 / 3.0,
            majorStep: 1,
            labels: labels,
            highlights: [0],
            snapStep: 1.0 / 3.0
        )
        let active = !exposure.isFullManual
        return ControlState(
            spec: spec,
            units: Double(exposure.bias),
            readout: Fmt.ev(exposure.bias),
            info: active ? "Compensazione: agisce sui parametri in AUTO" : "In manuale completo la compensazione non agisce",
            auto: abs(exposure.bias) < 0.01,
            autoToggleEnabled: true,
            set: { [weak self] u in self?.setBias(Float(u)) }
        )
    }
}
