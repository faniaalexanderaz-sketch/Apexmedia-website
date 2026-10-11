import SwiftUI

// MARK: - Barra superiore

struct TopBar: View {
    let model: CameraModel

    var body: some View {
        HStack(spacing: 10) {
            Button { model.resetAll() } label: {
                Text(model.exposure.modeLabel(variableAperture: model.caps.aperture.isVariable))
                    .font(Theme.value(13, .bold))
                    .foregroundStyle(model.exposure.isAllAuto ? Theme.ink : .black)
                    .frame(minWidth: 30, minHeight: 30)
                    .padding(.horizontal, 4)
                    .background(Capsule().fill(model.exposure.isAllAuto ? Color.black.opacity(0.4) : Theme.accent))
            }
            .accessibilityLabel("Modalità esposizione, tocca per tornare tutto in automatico")

            Button { cycleFormat() } label: {
                Text(formatLabel)
                    .capsLabel(10, color: Theme.ink)
                    .padding(.horizontal, 10).frame(height: 30)
                    .background(Capsule().fill(.black.opacity(0.4)))
            }

            Spacer()

            if model.isRecording, let start = model.recordingStarted {
                TimelineView(.periodic(from: start, by: 1)) { context in
                    HStack(spacing: 6) {
                        Circle().fill(Theme.record).frame(width: 7, height: 7)
                        Text(Fmt.duration(context.date.timeIntervalSince(start)))
                            .font(Theme.value(13, .semibold))
                            .foregroundStyle(Theme.ink)
                    }
                    .padding(.horizontal, 10).frame(height: 30)
                    .background(Capsule().fill(.black.opacity(0.4)))
                }
            }

            Spacer()

            Button { model.settings.showZebra.toggle() } label: {
                Image(systemName: "circle.lefthalf.striped.horizontal")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(model.settings.showZebra ? Theme.accent : Theme.ink)
                    .frame(width: 30, height: 30)
                    .background(Circle().fill(.black.opacity(0.4)))
            }
            .accessibilityLabel("Zebra alte luci")

            Button { model.showSettings = true } label: {
                Image(systemName: "slider.horizontal.3")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Theme.ink)
                    .frame(width: 30, height: 30)
                    .background(Circle().fill(.black.opacity(0.4)))
            }
            .accessibilityLabel("Impostazioni")
        }
        .padding(.horizontal, 12)
    }

    private var formatLabel: String {
        if model.mode == .video {
            let codec = model.settings.videoCodec == .proRes ? "PRORES" : "HEVC"
            return "4K\(model.settings.videoFPS) · \(codec)" + (model.settings.appleLog ? " · LOG" : "")
        }
        let mp = model.caps.photoMegapixels.filter { $0 <= model.settings.preferredMegapixels }.max()
            ?? model.caps.photoMegapixels.first ?? model.settings.preferredMegapixels
        return "\(model.settings.photoFormat.title.uppercased()) · \(mp)MP"
    }

    /// Tocco sul badge formato: cambio rapido senza aprire le impostazioni.
    private func cycleFormat() {
        model.haptics.tick()
        if model.mode == .video {
            let options = [24, 25, 30, 60]
            let index = options.firstIndex(of: model.settings.videoFPS) ?? 2
            model.settings.videoFPS = options[(index + 1) % options.count]
            return
        }
        var options: [PhotoFormat] = [.heif, .jpeg]
        if model.caps.supportsProRAW { options += [.proRAW, .rawPlusHEIF] }
        let index = options.firstIndex(of: model.settings.photoFormat) ?? 0
        model.settings.photoFormat = options[(index + 1) % options.count]
    }
}

// MARK: - Striscia parametri

struct ControlStrip: View {
    let model: CameraModel

    var body: some View {
        HStack(spacing: 0) {
            chip(.aperture, title: "DIAF.", value: "ƒ" + Fmt.aperture(model.displayedAperture),
                 auto: model.isAuto(.aperture))
            chip(.shutter, title: "TEMPO",
                 value: Fmt.shutter(model.exposure.shutterAuto ? model.measured.shutter : model.exposure.shutter),
                 auto: model.exposure.shutterAuto)
            chip(.iso, title: "ISO",
                 value: Fmt.iso(model.exposure.isoAuto ? model.measured.iso : model.exposure.iso),
                 auto: model.exposure.isoAuto)
            chip(.whiteBalance, title: "WB",
                 value: Fmt.kelvin(model.whiteBalance.auto ? model.measured.kelvin : model.whiteBalance.kelvin),
                 auto: model.whiteBalance.auto)
            chip(.focus, title: "FUOCO",
                 value: model.focus.auto ? "AF" : Fmt.focus(model.focus.lensPosition),
                 auto: model.focus.auto)
            chip(.bias, title: "EV", value: Fmt.ev(model.exposure.bias), auto: abs(model.exposure.bias) < 0.01)
        }
        .padding(.horizontal, 6)
        .frame(height: 44)
        .overlay(alignment: .top) { Rectangle().fill(Theme.hairline).frame(height: 0.5) }
    }

    private func chip(_ kind: ControlKind, title: String, value: String, auto: Bool) -> some View {
        let selected = model.selected == kind
        return Button {
            guard model.selected != kind else { return }
            model.haptics.tick()
            if kind != .aperture { model.showRampEditor = false }
            withAnimation(.easeOut(duration: 0.15)) { model.selected = kind }
        } label: {
            VStack(spacing: 3) {
                HStack(spacing: 2) {
                    Text(title).capsLabel(8, color: selected ? Theme.accent : Theme.dim)
                    if auto && kind != .bias {
                        Text("A").font(Theme.caps(7, .bold)).foregroundStyle(Theme.dim)
                    }
                }
                Text(value)
                    .font(Theme.value(13, selected ? .semibold : .regular))
                    .foregroundStyle(selected ? Theme.ink : (auto ? Theme.dim : Theme.ink))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Rectangle()
                    .fill(selected ? Theme.accent : .clear)
                    .frame(width: 16, height: 1.5)
            }
            .frame(maxWidth: .infinity)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Riga di scatto

struct ShutterRow: View {
    let model: CameraModel

    var body: some View {
        HStack {
            Button { model.openPhotos() } label: {
                Group {
                    if let image = model.thumbnail {
                        Image(uiImage: image).resizable().scaledToFill()
                    } else {
                        Theme.panel
                    }
                }
                .frame(width: 46, height: 46)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Theme.hairline, lineWidth: 1))
            }
            .accessibilityLabel("Apri Foto")
            .frame(maxWidth: .infinity, alignment: .leading)

            ShutterButton(mode: model.mode, isRecording: model.isRecording) {
                model.shutterPressed()
            }

            VStack(spacing: 8) {
                ForEach(CaptureMode.allCases, id: \.self) { mode in
                    Button { model.setMode(mode) } label: {
                        Text(mode.title)
                            .capsLabel(10, color: model.mode == mode ? Theme.accent : Theme.dim)
                    }
                    .disabled(model.isRecording)
                }
            }
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(.horizontal, 24)
        .frame(height: 96)
    }
}

struct ShutterButton: View {
    let mode: CaptureMode
    let isRecording: Bool
    let action: () -> Void
    @State private var pressed = false

    var body: some View {
        Button(action: action) {
            ZStack {
                Circle().stroke(Theme.ink, lineWidth: 3).frame(width: 74, height: 74)
                if mode == .photo {
                    Circle().fill(Theme.ink).frame(width: 60, height: 60)
                } else {
                    RoundedRectangle(cornerRadius: isRecording ? 6 : 30)
                        .fill(Theme.record)
                        .frame(width: isRecording ? 28 : 60, height: isRecording ? 28 : 60)
                }
            }
            .scaleEffect(pressed ? 0.92 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: isRecording)
            .animation(.easeOut(duration: 0.1), value: pressed)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in if !pressed { pressed = true } }
                .onEnded { _ in pressed = false }
        )
        .accessibilityLabel(mode == .photo ? "Scatta" : (isRecording ? "Ferma registrazione" : "Registra"))
    }
}

// MARK: - Toast

struct Toast: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.system(size: 12, weight: .medium))
            .foregroundStyle(Theme.ink)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 14).padding(.vertical, 9)
            .background(Capsule().fill(.black.opacity(0.75)))
            .overlay(Capsule().stroke(Theme.hairline, lineWidth: 0.5))
            .padding(.horizontal, 24)
    }
}
