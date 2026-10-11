import SwiftUI

@main
struct IrisApp: App {
    @State private var model = CameraModel()

    var body: some Scene {
        WindowGroup {
            CameraScreen(model: model)
        }
    }
}
