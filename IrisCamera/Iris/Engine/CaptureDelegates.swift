import AVFoundation
import ImageIO
import Photos
import UIKit

// MARK: - Foto

/// Raccoglie HEIF/JPEG e/o DNG di uno scatto e li salva in Foto come un unico asset.
final class PhotoCaptureProcessor: NSObject, AVCapturePhotoCaptureDelegate {
    private var processedData: Data?
    private var rawData: Data?
    private var thumbnail: UIImage?
    private let willCapture: () -> Void
    private let completion: (UIImage?, String?) -> Void

    init(willCapture: @escaping () -> Void, completion: @escaping (UIImage?, String?) -> Void) {
        self.willCapture = willCapture
        self.completion = completion
    }

    func photoOutput(_ output: AVCapturePhotoOutput, willCapturePhotoFor resolvedSettings: AVCaptureResolvedPhotoSettings) {
        willCapture()
    }

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        guard error == nil else { return }
        if photo.isRawPhoto {
            rawData = photo.fileDataRepresentation()
        } else {
            processedData = photo.fileDataRepresentation()
        }
        if thumbnail == nil, let preview = photo.previewCGImageRepresentation() {
            let raw = (photo.metadata[kCGImagePropertyOrientation as String] as? UInt32) ?? 1
            let orientation = CGImagePropertyOrientation(rawValue: raw) ?? .up
            thumbnail = UIImage(cgImage: preview, scale: 1, orientation: UIImage.Orientation(orientation))
        }
    }

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishCaptureFor resolvedSettings: AVCaptureResolvedPhotoSettings, error: Error?) {
        if let error {
            completion(nil, "Scatto non riuscito: \(error.localizedDescription)")
            return
        }
        let processed = processedData
        let raw = rawData
        let thumb = thumbnail
        guard processed != nil || raw != nil else {
            completion(nil, "Scatto vuoto")
            return
        }
        let completion = self.completion
        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            guard status == .authorized || status == .limited else {
                completion(thumb, "Consenti l'accesso a Foto per salvare gli scatti")
                return
            }
            PHPhotoLibrary.shared().performChanges({
                let request = PHAssetCreationRequest.forAsset()
                if let processed {
                    request.addResource(with: .photo, data: processed, options: nil)
                    if let raw {
                        let options = PHAssetResourceCreationOptions()
                        options.uniformTypeIdentifier = "com.adobe.raw-image"
                        request.addResource(with: .alternatePhoto, data: raw, options: options)
                    }
                } else if let raw {
                    let options = PHAssetResourceCreationOptions()
                    options.uniformTypeIdentifier = "com.adobe.raw-image"
                    request.addResource(with: .photo, data: raw, options: options)
                }
            }, completionHandler: { success, error in
                completion(thumb, success ? nil : "Salvataggio fallito: \(error?.localizedDescription ?? "errore")")
            })
        }
    }
}

extension UIImage.Orientation {
    init(_ cg: CGImagePropertyOrientation) {
        switch cg {
        case .up: self = .up
        case .upMirrored: self = .upMirrored
        case .down: self = .down
        case .downMirrored: self = .downMirrored
        case .left: self = .left
        case .leftMirrored: self = .leftMirrored
        case .right: self = .right
        case .rightMirrored: self = .rightMirrored
        @unknown default: self = .up
        }
    }
}

// MARK: - Video

final class MovieRecorder: NSObject, AVCaptureFileOutputRecordingDelegate {
    private let onStart: () -> Void
    private let onFinish: (String?) -> Void

    init(onStart: @escaping () -> Void, onFinish: @escaping (String?) -> Void) {
        self.onStart = onStart
        self.onFinish = onFinish
    }

    func fileOutput(_ output: AVCaptureFileOutput, didStartRecordingTo fileURL: URL, from connections: [AVCaptureConnection]) {
        onStart()
    }

    func fileOutput(_ output: AVCaptureFileOutput, didFinishRecordingTo outputFileURL: URL, from connections: [AVCaptureConnection], error: Error?) {
        var finished = true
        if let error = error as NSError? {
            finished = (error.userInfo[AVErrorRecordingSuccessfullyFinishedKey] as? Bool) ?? false
        }
        let onFinish = self.onFinish
        guard finished else {
            try? FileManager.default.removeItem(at: outputFileURL)
            onFinish("Registrazione interrotta: \(error?.localizedDescription ?? "errore")")
            return
        }
        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            guard status == .authorized || status == .limited else {
                try? FileManager.default.removeItem(at: outputFileURL)
                onFinish("Consenti l'accesso a Foto per salvare i video")
                return
            }
            PHPhotoLibrary.shared().performChanges({
                let options = PHAssetResourceCreationOptions()
                options.shouldMoveFile = true
                PHAssetCreationRequest.forAsset().addResource(with: .video, fileURL: outputFileURL, options: options)
            }, completionHandler: { success, error in
                if !success { try? FileManager.default.removeItem(at: outputFileURL) }
                onFinish(success ? nil : "Salvataggio video fallito: \(error?.localizedDescription ?? "errore")")
            })
        }
    }
}

// MARK: - Analisi frame (istogramma + sorgente per peaking/zebra)

/// Ultimo frame disponibile, condiviso tra la coda video e il renderer Metal.
final class FrameStore: @unchecked Sendable {
    private let lock = NSLock()
    private var buffer: CVPixelBuffer?

    func put(_ pixelBuffer: CVPixelBuffer) {
        lock.lock()
        buffer = pixelBuffer
        lock.unlock()
    }

    func take() -> CVPixelBuffer? {
        lock.lock()
        defer { lock.unlock() }
        let value = buffer
        buffer = nil
        return value
    }
}

final class FrameAnalyzer: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate, @unchecked Sendable {
    let store = FrameStore()
    var onHistogram: (@MainActor ([Float]) -> Void)?
    var histogramEnabled = true
    private var frameIndex = 0

    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        store.put(pixelBuffer)
        frameIndex &+= 1
        if histogramEnabled, frameIndex % 3 == 0 {
            let bins = Self.histogram(pixelBuffer)
            Task { @MainActor [weak self] in self?.onHistogram?(bins) }
        }
    }

    /// Istogramma di luminanza (Rec.709) a 64 classi, campionando ~19k pixel.
    private static func histogram(_ pixelBuffer: CVPixelBuffer) -> [Float] {
        CVPixelBufferLockBaseAddress(pixelBuffer, .readOnly)
        defer { CVPixelBufferUnlockBaseAddress(pixelBuffer, .readOnly) }
        guard let base = CVPixelBufferGetBaseAddress(pixelBuffer) else { return [] }
        let width = CVPixelBufferGetWidth(pixelBuffer)
        let height = CVPixelBufferGetHeight(pixelBuffer)
        let bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer)
        let pixels = base.assumingMemoryBound(to: UInt8.self)
        let stepX = max(1, width / 160)
        let stepY = max(1, height / 120)
        var bins = [Float](repeating: 0, count: 64)
        var y = 0
        while y < height {
            let row = pixels + y * bytesPerRow
            var x = 0
            while x < width {
                let p = row + x * 4
                let luma = 0.0722 * Float(p[0]) + 0.7152 * Float(p[1]) + 0.2126 * Float(p[2])
                bins[min(63, Int(luma) >> 2)] += 1
                x += stepX
            }
            y += stepY
        }
        let peak = max(bins.max() ?? 1, 1)
        return bins.map { ($0 / peak).squareRoot() }
    }
}
