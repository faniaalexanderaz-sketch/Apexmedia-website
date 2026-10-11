import AVKit
import SwiftUI

struct CameraScreen: View {
    @Bindable var model: CameraModel
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            if model.authorization == .denied {
                PermissionView()
            } else {
                content
            }
        }
        .statusBarHidden()
        .persistentSystemOverlays(.hidden)
        .preferredColorScheme(.dark)
        .task { await model.onAppear() }
        .onChange(of: scenePhase) { _, phase in model.scenePhaseChanged(phase) }
        .onChange(of: model.settings) { old, new in model.settingsChanged(from: old, to: new) }
        .onCameraCaptureEvent { event in
            // Tasto laterale, volume o Camera Control: scatto al rilascio.
            if event.phase == .ended { model.shutterPressed() }
        }
        .sheet(isPresented: $model.showSettings) {
            SettingsView(model: model)
        }
    }

    private var content: some View {
        VStack(spacing: 0) {
            ZStack(alignment: .top) {
                Viewfinder(model: model)
                if !model.chromeHidden {
                    TopBar(model: model).padding(.top, 8)
                }
                if let toast = model.toast {
                    Toast(text: toast)
                        .padding(.top, 52)
                        .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }
            .frame(maxHeight: .infinity)

            if !model.chromeHidden {
                ControlStrip(model: model)
                DialPanel(model: model)
            }
            ShutterRow(model: model)
        }
    }
}

struct PermissionView: View {
    var body: some View {
        VStack(spacing: 18) {
            IrisGlyph(fNumber: 2.8, minF: 1.48, maxF: 4)
                .frame(width: 64, height: 64)
            Text("Iris ha bisogno della fotocamera")
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(Theme.ink)
            Text("Consenti l'accesso in Impostazioni per controllare diaframma, tempo e ISO.")
                .font(.system(size: 14))
                .foregroundStyle(Theme.dim)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            Button {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            } label: {
                Text("Apri Impostazioni")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.black)
                    .padding(.horizontal, 22).padding(.vertical, 12)
                    .background(Capsule().fill(Theme.accent))
            }
        }
    }
}
