# Iris: fotocamera manuale per iPhone 18 Pro

Iris è un'app fotocamera essenziale con un obiettivo preciso: sfruttare il **diaframma variabile** dell'iPhone 18 Pro in modo **continuo**, senza i 4 scatti fissi dell'app Fotocamera (ƒ1.48 · ƒ1.8 · ƒ2.8 · ƒ4.0).

## Perché si può fare

iOS 27 espone `AVCaptureDevice.setExposureModeCustom(lensAperture:duration:iso:)`. Secondo la documentazione Apple il diaframma accetta **qualsiasi valore compreso tra `minLensAperture` e `maxLensAperture`** del formato attivo. `recommendedLensApertureStops` è solo l'elenco degli stop "consigliati" che usa l'app di sistema. Quando si passano tre valori espliciti (diaframma, tempo, ISO), il diaframma si sposta subito, senza limite di velocità.

Iris invia al sensore il valore al centesimo e mostra accanto il valore **reale** letto da `lensAperture`, così sul telefono vedi subito quale apertura fisica ha raggiunto la lente.

## Funzioni

| Area | Cosa fa |
|---|---|
| **Diaframma continuo** | Righello in stop, da ƒ1.48 a ƒ4.0. Valori al centesimo, click aptico ogni 1/10 di stop e colpo più deciso sugli stop Apple. Precisione selezionabile: Libera, 1/10, 1/3 o Stop Apple |
| **Regolazione fine** | Mentre trascini, alza il dito sopra il righello: il movimento rallenta a ×½, ×¼ e ×⅒ |
| **Esposizione a priorità** | Diaframma, tempo e ISO sono ognuno AUTO oppure bloccato, quindi P / A / S / ISO / M e le combinazioni miste. Le combinazioni vengono validate con `supportsExposureModeCustom` |
| **Compensazione in M** | Se cambi il diaframma in manuale completo, ISO e poi tempo si adeguano: cambia solo la profondità di campo, la luce resta uguale |
| **Rampa di diaframma** | Imposti A e B, scegli durata e curva: il diaframma scorre in modo continuo, anche durante un video. È un "tiraggio" della profondità di campo con esposizione costante |
| **Camera Control** | Slider **continuo** "Diaframma" sul tasto fisico, più zoom, EV e fuoco. Il tasto fisico e il tasto volume scattano |
| **Manuale completo** | Tempo (terzi standard, regola dei 180° in video), ISO, WB in Kelvin, fuoco manuale con posizione lente, EV |
| **Mirino** | Focus peaking e zebra in Metal, istogramma live, livella con feedback aptico, griglia dei terzi, blocco AE/AF con pressione lunga |
| **Obiettivi** | Rilevati dal device: 13 / 24 / 48 / 100 / 200 mm (i ritagli nativi a 48 MP sono inclusi). Pizzica per lo zoom fine |
| **Formati** | HEIF, JPEG, ProRAW, RAW+HEIF fino a 48 MP. Video 4K 24/25/30/60 in HEVC o ProRes 422 HQ, con Apple Log |

## Compilare e installare

Requisiti: Mac con **Xcode 27** (SDK iOS 27), iPhone 18 Pro / Pro Max con iOS 27, un Apple ID.

1. Apri `IrisCamera/Iris.xcodeproj`.
2. Seleziona il target **Iris**, poi *Signing & Capabilities*: scegli il tuo **Team**. Se il bundle id `com.apexmedia.iris` è già occupato, cambialo.
3. Collega l'iPhone, selezionalo come destinazione e premi **Run** (⌘R).
4. Sull'iPhone: *Impostazioni → Privacy e sicurezza → Modalità sviluppatore* attiva, e accetta il certificato sviluppatore se richiesto.

Il simulatore non ha fotocamera, quindi l'app va provata sul dispositivo.

## Struttura

```
Iris/
  App/IrisApp.swift              entry point
  Engine/
    CameraEngine.swift           AVCaptureSession, obiettivi, formati, esposizione, Camera Control
    CaptureDelegates.swift       salvataggio foto/RAW/video in Foto, istogramma
    Models.swift                 stato, matematica degli stop, formattazione
    Overlay.metal                shader peaking + zebra
  UI/
    CameraModel.swift            stato UI, logica diaframma/compensazione/rampa
    DialPanel.swift              pannello di regolazione + mappatura parametri → righello
    ValueRuler.swift             righello di precisione con aptica e regolazione fine
    Viewfinder.swift             preview, overlay, livella, istogramma, obiettivi
    Controls.swift               barra superiore, striscia parametri, pulsante di scatto
    SettingsView.swift           impostazioni
    OverlayRenderer.swift        rendering Metal degli overlay
```

## Note tecniche

- La UI è bloccata in verticale. Le foto vengono comunque orientate correttamente tramite `RotationCoordinator`.
- Con l'esposizione bloccata, lo scatto usa `photoQualityPrioritization = .speed`, come richiede Apple: in caso contrario la fusione multi-frame può riscrivere ISO e tempo.
- Il diaframma variabile esiste solo sul principale da 24 mm. Su 13 mm e 100 mm il righello mostra il valore fisso.
- Il progetto usa Swift 5 con concorrenza "minimal", per ridurre al minimo gli attriti con le API AVFoundation.
