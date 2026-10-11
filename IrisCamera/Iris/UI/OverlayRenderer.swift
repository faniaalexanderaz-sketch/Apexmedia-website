import MetalKit
import SwiftUI

struct OverlayParams {
    var peakingColor: SIMD4<Float>
    var peakingThreshold: Float
    var zebraThreshold: Float
    var time: Float
    var flags: UInt32
}

/// Renderizza peaking/zebra su una MTKView trasparente allineata alla preview.
@MainActor
final class OverlayRenderer: NSObject, MTKViewDelegate {
    let device: MTLDevice
    private let queue: MTLCommandQueue
    private let pipeline: MTLRenderPipelineState
    private var textureCache: CVMetalTextureCache?
    private var currentTexture: CVMetalTexture?
    private let store: FrameStore
    private let startTime = CACurrentMediaTime()

    var peaking = false
    var zebra = false
    var zebraThreshold: Float = 0.95
    var peakingThreshold: Float = 0.32
    var peakingColor = SIMD4<Float>(1.0, 0.36, 0.12, 0.95)

    var isActive: Bool { peaking || zebra }

    init?(store: FrameStore) {
        guard let device = MTLCreateSystemDefaultDevice(),
              let queue = device.makeCommandQueue(),
              let library = device.makeDefaultLibrary(),
              let vertex = library.makeFunction(name: "irisOverlayVertex"),
              let fragment = library.makeFunction(name: "irisOverlayFragment") else { return nil }
        let descriptor = MTLRenderPipelineDescriptor()
        descriptor.vertexFunction = vertex
        descriptor.fragmentFunction = fragment
        descriptor.colorAttachments[0].pixelFormat = .bgra8Unorm
        guard let pipeline = try? device.makeRenderPipelineState(descriptor: descriptor) else { return nil }
        self.device = device
        self.queue = queue
        self.pipeline = pipeline
        self.store = store
        super.init()
        CVMetalTextureCacheCreate(kCFAllocatorDefault, nil, device, nil, &textureCache)
    }

    nonisolated func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}

    nonisolated func draw(in view: MTKView) {
        MainActor.assumeIsolated { self.render(in: view) }
    }

    private func render(in view: MTKView) {
        if let pixelBuffer = store.take(), let cache = textureCache {
            var cvTexture: CVMetalTexture?
            let width = CVPixelBufferGetWidth(pixelBuffer)
            let height = CVPixelBufferGetHeight(pixelBuffer)
            let status = CVMetalTextureCacheCreateTextureFromImage(kCFAllocatorDefault, cache, pixelBuffer, nil, .bgra8Unorm, width, height, 0, &cvTexture)
            if status == kCVReturnSuccess { currentTexture = cvTexture }
        }
        guard let pass = view.currentRenderPassDescriptor,
              let drawable = view.currentDrawable,
              let commands = queue.makeCommandBuffer() else { return }
        pass.colorAttachments[0].loadAction = .clear
        pass.colorAttachments[0].clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        guard let encoder = commands.makeRenderCommandEncoder(descriptor: pass) else { return }
        if isActive, let cvTexture = currentTexture, let texture = CVMetalTextureGetTexture(cvTexture) {
            var params = OverlayParams(
                peakingColor: peakingColor,
                peakingThreshold: peakingThreshold,
                zebraThreshold: zebraThreshold,
                time: Float(CACurrentMediaTime() - startTime),
                flags: (peaking ? 1 : 0) | (zebra ? 2 : 0)
            )
            encoder.setRenderPipelineState(pipeline)
            encoder.setFragmentTexture(texture, index: 0)
            encoder.setFragmentBytes(&params, length: MemoryLayout<OverlayParams>.stride, index: 0)
            encoder.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: 4)
        }
        encoder.endEncoding()
        commands.present(drawable)
        commands.commit()
    }
}

struct OverlayView: UIViewRepresentable {
    let renderer: OverlayRenderer?
    let active: Bool

    func makeUIView(context: Context) -> MTKView {
        let view = MTKView(frame: .zero, device: renderer?.device)
        view.isOpaque = false
        view.backgroundColor = .clear
        view.colorPixelFormat = .bgra8Unorm
        view.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        view.framebufferOnly = true
        view.preferredFramesPerSecond = 30
        view.isUserInteractionEnabled = false
        view.delegate = renderer
        view.isPaused = !active
        view.isHidden = !active
        return view
    }

    func updateUIView(_ view: MTKView, context: Context) {
        view.isPaused = !active
        view.isHidden = !active
    }
}
