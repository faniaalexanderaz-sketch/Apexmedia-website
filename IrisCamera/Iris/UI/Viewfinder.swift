import AVFoundation
import SwiftUI

// MARK: - Preview AVFoundation

final class PreviewUIView: UIView {
    override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }
    var previewLayer: AVCaptureVideoPreviewLayer { layer as! AVCaptureVideoPreviewLayer }

    var onTap: (@MainActor (CGPoint, CGPoint) -> Void)?
    var onLongPress: (@MainActor () -> Void)?
    var onPinch: (@MainActor (CGFloat, UIGestureRecognizer.State) -> Void)?

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .black
        let tap = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
        let long = UILongPressGestureRecognizer(target: self, action: #selector(handleLongPress(_:)))
        long.minimumPressDuration = 0.45
        let pinch = UIPinchGestureRecognizer(target: self, action: #selector(handlePinch(_:)))
        tap.require(toFail: long)
        addGestureRecognizer(tap)
        addGestureRecognizer(long)
        addGestureRecognizer(pinch)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) non supportato") }

    @objc private func handleTap(_ g: UITapGestureRecognizer) {
        let point = g.location(in: self)
        onTap?(previewLayer.captureDevicePointConverted(fromLayerPoint: point), point)
    }

    @objc private func handleLongPress(_ g: UILongPressGestureRecognizer) {
        if g.state == .began { onLongPress?() }
    }

    @objc private func handlePinch(_ g: UIPinchGestureRecognizer) {
        onPinch?(g.scale, g.state)
    }
}

struct CameraPreview: UIViewRepresentable {
    let model: CameraModel

    func makeUIView(context: Context) -> PreviewUIView {
        let view = PreviewUIView()
        view.previewLayer.session = model.engine.session
        view.previewLayer.videoGravity = .resizeAspect
        view.onTap = { [weak model] devicePoint, viewPoint in
            model?.tap(devicePoint: devicePoint, viewPoint: viewPoint)
        }
        view.onLongPress = { [weak model] in model?.lockAEAF() }
        view.onPinch = { [weak model] scale, state in
            guard let model else { return }
            switch state {
            case .began: model.pinchBegan()
            case .changed: model.pinch(scale: scale, ended: false)
            case .ended, .cancelled, .failed: model.pinch(scale: scale, ended: true)
            default: break
            }
        }
        model.attachPreview(view.previewLayer)
        return view
    }

    func updateUIView(_ uiView: PreviewUIView, context: Context) {}
}

// MARK: - Mirino completo

struct Viewfinder: View {
    let model: CameraModel

    var body: some View {
        GeometryReader { geo in
            // Il riquadro ha esattamente le proporzioni del buffer: nessun ritaglio nascosto.
            let ratio = model.caps.bufferAspect          // lato lungo / lato corto
            let fitWidth = min(geo.size.width, geo.size.height / ratio)
            let size = CGSize(width: fitWidth, height: fitWidth * ratio)
            ZStack {
                CameraPreview(model: model)
                OverlayView(renderer: model.overlay, active: model.overlayActive)
                    .allowsHitTesting(false)
                if model.settings.showGrid { GridOverlay().allowsHitTesting(false) }
                if model.settings.showLevel && model.levelUsable {
                    LevelOverlay(angle: model.rollAngle, isLevel: model.isLevel).allowsHitTesting(false)
                }
                if let point = model.focusIndicator {
                    FocusReticle(locked: model.aeLocked)
                        .position(point)
                        .allowsHitTesting(false)
                        .transition(.opacity)
                }
                VStack {
                    HStack(alignment: .top) {
                        if model.aeLocked {
                            Text("AE·AF LOCK")
                                .capsLabel(9, color: .black)
                                .padding(.horizontal, 8).padding(.vertical, 4)
                                .background(Capsule().fill(Theme.accent))
                        }
                        Spacer()
                        if model.settings.showHistogram && !model.histogram.isEmpty {
                            HistogramView(bins: model.histogram)
                                .frame(width: 96, height: 40)
                        }
                    }
                    .padding(.top, 52)
                    .padding(.horizontal, 10)
                    Spacer()
                    if !model.chromeHidden {
                        LensBar(model: model).padding(.bottom, 10)
                    }
                }
                Color.black.opacity(model.flash ? 0.85 : 0).allowsHitTesting(false)
            }
            .frame(width: size.width, height: size.height)
            .clipped()
            .position(x: geo.size.width / 2, y: size.height / 2)
        }
    }
}

struct GridOverlay: View {
    var body: some View {
        Canvas { context, size in
            var path = Path()
            for i in 1...2 {
                let x = size.width * CGFloat(i) / 3
                let y = size.height * CGFloat(i) / 3
                path.move(to: CGPoint(x: x, y: 0)); path.addLine(to: CGPoint(x: x, y: size.height))
                path.move(to: CGPoint(x: 0, y: y)); path.addLine(to: CGPoint(x: size.width, y: y))
            }
            context.stroke(path, with: .color(.white.opacity(0.22)), lineWidth: 0.5)
        }
    }
}

struct LevelOverlay: View {
    let angle: Double
    let isLevel: Bool

    var body: some View {
        let deviation = angle - (angle / 90).rounded() * 90
        ZStack {
            HStack(spacing: 34) {
                Capsule().frame(width: 46, height: 1.5)
                Capsule().frame(width: 46, height: 1.5)
            }
            .foregroundStyle(isLevel ? Theme.accent : .white.opacity(0.75))
            .rotationEffect(.degrees(-angle))
            Circle()
                .stroke(isLevel ? Theme.accent : .white.opacity(0.5), lineWidth: 1)
                .frame(width: 8, height: 8)
            if !isLevel && abs(deviation) < 20 {
                Text(String(format: "%.1f°", abs(deviation)))
                    .font(Theme.value(9))
                    .foregroundStyle(.white.opacity(0.7))
                    .offset(y: 16)
            }
        }
        .animation(.interactiveSpring(response: 0.15), value: angle)
    }
}

struct FocusReticle: View {
    let locked: Bool
    @State private var appeared = false

    var body: some View {
        RoundedRectangle(cornerRadius: 2)
            .stroke(Theme.accent, lineWidth: 1)
            .frame(width: 70, height: 70)
            .overlay(alignment: .top) { Rectangle().fill(Theme.accent).frame(width: 1, height: 6) }
            .overlay(alignment: .bottom) { Rectangle().fill(Theme.accent).frame(width: 1, height: 6) }
            .overlay(alignment: .leading) { Rectangle().fill(Theme.accent).frame(width: 6, height: 1) }
            .overlay(alignment: .trailing) { Rectangle().fill(Theme.accent).frame(width: 6, height: 1) }
            .scaleEffect(appeared ? 1 : 1.35)
            .onAppear { withAnimation(.spring(response: 0.25, dampingFraction: 0.7)) { appeared = true } }
    }
}

struct HistogramView: View {
    let bins: [Float]

    var body: some View {
        Canvas { context, size in
            guard bins.count > 1 else { return }
            var path = Path()
            path.move(to: CGPoint(x: 0, y: size.height))
            let step = size.width / CGFloat(bins.count - 1)
            for (i, v) in bins.enumerated() {
                path.addLine(to: CGPoint(x: CGFloat(i) * step, y: size.height * (1 - CGFloat(v) * 0.92)))
            }
            path.addLine(to: CGPoint(x: size.width, y: size.height))
            path.closeSubpath()
            context.fill(path, with: .color(.white.opacity(0.55)))
            // Clipping: alte luci bruciate in ambra
            if let last = bins.last, last > 0.35 {
                let r = CGRect(x: size.width - 3, y: 0, width: 3, height: size.height)
                context.fill(Path(r), with: .color(Theme.accent))
            }
        }
        .padding(4)
        .background(RoundedRectangle(cornerRadius: 6).fill(.black.opacity(0.35)))
    }
}

// MARK: - Obiettivi

struct LensBar: View {
    let model: CameraModel

    var body: some View {
        HStack(spacing: 6) {
            ForEach(model.lenses) { lens in
                let selected = lens == model.currentLens
                Button { model.select(lens) } label: {
                    Text(selected ? "\(model.equivalentFocalLength)" : "\(lens.equivalentFocalLength)")
                        .font(Theme.value(selected ? 12 : 11, .semibold))
                        .foregroundStyle(selected ? .black : Theme.ink)
                        .frame(width: 38, height: 38)
                        .background(Circle().fill(selected ? Theme.accent : .black.opacity(0.45)))
                        .overlay(alignment: .bottom) {
                            if lens.hasVariableAperture && lens.zoomFactor == 1 {
                                Circle().fill(selected ? .black : Theme.accent).frame(width: 3, height: 3).offset(y: -5)
                            }
                        }
                }
                .disabled(model.isRecording)
                .accessibilityLabel("\(lens.equivalentFocalLength) millimetri")
            }
            Text("mm").capsLabel(9, color: .white.opacity(0.6)).padding(.leading, 2)
        }
        .padding(.horizontal, 6).padding(.vertical, 4)
        .background(Capsule().fill(.black.opacity(0.25)))
    }
}
