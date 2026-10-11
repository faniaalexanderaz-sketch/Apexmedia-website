import SwiftUI

struct SettingsView: View {
    @Bindable var model: CameraModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Precisione diaframma", selection: $model.settings.aperturePrecision) {
                        ForEach(AperturePrecision.allCases) { Text($0.title).tag($0) }
                    }
                    Toggle("Compensa esposizione in M", isOn: $model.settings.compensateAperture)
                    Toggle("Diaframma sul Camera Control", isOn: $model.settings.cameraControlAperture)
                        .disabled(!model.caps.supportsControls)
                    LabeledContent("Intervallo hardware", value: apertureRangeText)
                    LabeledContent("Stop consigliati Apple", value: recommendedText)
                } header: {
                    Text("Diaframma")
                } footer: {
                    Text("“Libera” invia al sensore qualsiasi valore tra minimo e massimo, al centesimo. Con la compensazione attiva, in manuale completo l'ISO (poi il tempo) si adegua: cambi solo la profondità di campo, non la luce.")
                }

                Section("Foto") {
                    Picker("Formato", selection: $model.settings.photoFormat) {
                        ForEach(PhotoFormat.allCases) { format in
                            Text(format.title).tag(format)
                        }
                    }
                    if model.settings.photoFormat.needsRAW && !model.caps.supportsProRAW && model.mode == .photo {
                        Text("ProRAW non disponibile su questo obiettivo").font(.footnote).foregroundStyle(.secondary)
                    }
                    Picker("Risoluzione", selection: $model.settings.preferredMegapixels) {
                        ForEach(megapixelOptions, id: \.self) { Text("\($0) MP").tag($0) }
                    }
                }

                Section("Video") {
                    Picker("Frame rate", selection: $model.settings.videoFPS) {
                        ForEach([24, 25, 30, 60], id: \.self) { Text("\($0) fps").tag($0) }
                    }
                    Picker("Codec", selection: $model.settings.videoCodec) {
                        ForEach(VideoCodecChoice.allCases) { Text($0.title).tag($0) }
                    }
                    Toggle("Apple Log", isOn: $model.settings.appleLog)
                        .disabled(!model.caps.supportsAppleLog)
                }

                Section("Mirino") {
                    Toggle("Griglia dei terzi", isOn: $model.settings.showGrid)
                    Toggle("Istogramma", isOn: $model.settings.showHistogram)
                    Toggle("Livella", isOn: $model.settings.showLevel)
                    Toggle("Zebra alte luci", isOn: $model.settings.showZebra)
                    Picker("Soglia zebra", selection: $model.settings.zebraThreshold) {
                        Text("90%").tag(0.90)
                        Text("95%").tag(0.95)
                        Text("100%").tag(0.995)
                    }
                    .disabled(!model.settings.showZebra)
                    Picker("Focus peaking", selection: $model.settings.peaking) {
                        ForEach(PeakingMode.allCases) { Text($0.title).tag($0) }
                    }
                }

                Section {
                    LabeledContent("Tocco sul mirino", value: "Fuoco + esposizione")
                    LabeledContent("Pressione lunga", value: "Blocco AE/AF")
                    LabeledContent("Pizzico", value: "Zoom fine sull'obiettivo")
                    LabeledContent("Badge P/A/S/M", value: "Tutto in AUTO")
                    LabeledContent("Righello", value: "Solleva il dito = fine")
                } header: {
                    Text("Gesti")
                }
            }
            .navigationTitle("Iris")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Fine") { dismiss() }
                }
            }
        }
        .preferredColorScheme(.dark)
        .tint(Theme.accent)
    }

    private var megapixelOptions: [Int] {
        let available = model.caps.photoMegapixels
        let options = available.isEmpty ? [12, 24, 48] : available
        return options.contains(model.settings.preferredMegapixels) ? options : options + [model.settings.preferredMegapixels]
    }

    private var apertureRangeText: String {
        let r = model.caps.aperture
        return r.isVariable ? "ƒ\(Fmt.aperture(r.min)) – ƒ\(Fmt.aperture(r.max))" : "fisso ƒ\(Fmt.aperture(r.min))"
    }

    private var recommendedText: String {
        let stops = model.caps.aperture.recommended
        return stops.isEmpty ? "—" : stops.map { "ƒ" + Fmt.aperture($0) }.joined(separator: " · ")
    }
}
