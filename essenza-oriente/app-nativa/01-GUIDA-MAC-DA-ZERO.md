# Dal Mac vuoto all'app nel simulatore — guida da zero

Tempo: circa 45 minuti la prima volta. Ogni comando si **copia e incolla** nel Terminale e si preme **Invio**.

## Regole del Terminale (leggi prima)
- Il Terminale è una finestra dove scrivi comandi invece di cliccare. Non si rompe niente se segui la guida.
- Incolla un comando alla volta, premi **Invio**, e **aspetta** che finisca: è finito quando ricompare una riga che termina con `%` e il cursore lampeggia.
- Se chiede la **Password**: è quella del Mac. Mentre la scrivi **non vedi niente** (nemmeno puntini): è normale. Scrivila e premi Invio.
- Se compare `(y/n)` o "Press RETURN": scrivi `y` e Invio, oppure premi solo Invio.
- Per fermare qualcosa che sta girando: **Ctrl + C**.

## Passo 1 — Aprire il Terminale
Premi **Cmd + Spazio**, scrivi `Terminale`, premi Invio. Tienilo nel Dock: tasto destro sull'icona → Opzioni → Mantieni nel Dock.

## Passo 2 — Preparare Xcode (già installato)
1. Apri Xcode una volta dalla cartella Applicazioni, accetta la licenza, lascia che installi i componenti, poi chiudilo.
2. Nel Terminale incolla, uno alla volta:
```
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```
```
sudo xcodebuild -license accept
```
```
xcodebuild -runFirstLaunch
```
3. Riapri Xcode → menu **Xcode → Settings → Components** → scarica **iOS** (il simulatore, circa 8 GB). Aspetta che finisca.
4. Controllo: menu **Xcode → Open Developer Tool → Simulator**. Si apre un iPhone finto sul Mac. Ok, chiudilo.

## Passo 3 — Homebrew (installa gli altri programmi)
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Chiede la password del Mac e poi Invio. Ci mette qualche minuto.
**Importante:** alla fine scrive "Next steps" con 2 righe che iniziano con `echo` ed `eval`. Copiale e incollale una alla volta, come dice lui. Di solito sono:
```
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
```
```
eval "$(/opt/homebrew/bin/brew shellenv)"
```
Controllo: `brew --version` deve scrivere un numero di versione.

## Passo 4 — Node, Watchman, Git, CocoaPods
```
brew install node watchman git cocoapods
```
Controllo: `node -v` deve scrivere un numero tipo v22.x o v24.x.

## Passo 5 — Installare Claude Code
```
curl -fsSL https://claude.ai/install.sh | bash
```
Se alla fine dice di aggiungere qualcosa al PATH, copia e incolla la riga che ti mostra. Poi **chiudi il Terminale (Cmd + Q) e riaprilo**.
Controllo: `claude --version` deve scrivere un numero.
Nota: serve un abbonamento **Claude Pro o Max** (o crediti API) per usarlo.

## Passo 6 — Creare la cartella del progetto
```
mkdir -p ~/Progetti/essenza-oriente-app
```
```
open ~/Progetti/essenza-oriente-app
```
Si apre la cartella nel Finder.

## Passo 7 — Mettere dentro prompt, logo e foto
1. Dal browser apri GitHub con il tuo account: repository **Apexmedia-website**, branch **essenza-oriente-prompt-app**.
   Link diretto per scaricare tutto in zip:
   `https://github.com/faniaalexanderaz-sketch/Apexmedia-website/archive/refs/heads/essenza-oriente-prompt-app.zip`
2. Apri lo zip scaricato (doppio clic) → entra in `essenza-oriente` → `app-nativa`.
3. **Trascina tutto il contenuto** di `app-nativa` (i file `.md` e la cartella `assets-brand`) dentro la cartella `essenza-oriente-app` aperta al passo 6.

## Passo 8 — Avviare Claude Code nella cartella
```
cd ~/Progetti/essenza-oriente-app
```
```
claude
```
- La prima volta ti chiede tema e login: scegli **"Claude account"**, si apre il browser, accedi e autorizza, poi torna al Terminale.
- Ti chiede se ti fidi della cartella: rispondi **Sì**.
- Ora vedi un riquadro dove scrivere: stai parlando con Claude.

## Passo 9 — Dare il primo prompt
Scrivi nel riquadro di Claude (non serve incollare tutto il file):
```
Leggi 00-GUIDA.md e poi esegui per intero le istruzioni di PROMPT-1-fondamenta.md. Gli asset del brand sono in assets-brand/. Lavora in autonomia e chiedimi solo le chiavi quando servono.
```
Premi Invio.
- Claude ti chiederà spesso il permesso per eseguire comandi o creare file: leggi in breve e premi **Invio** su "Yes". Per non chiederlo ogni volta, scegli l'opzione "Yes, and don't ask again" per quel tipo di comando.
- Quando chiede le **chiavi di Supabase**: vai su supabase.com → il tuo progetto → **Project Settings → API**, copia Project URL e le chiavi e incollale nel Terminale quando le chiede.
- Lascialo lavorare: può metterci anche 30–60 minuti. Puoi fare altro.

## Passo 10 — Vedere l'app nel simulatore
Alla fine Claude stesso lancia il simulatore. Se vuoi farlo tu, apri un **secondo Terminale** (Cmd + T) e scrivi:
```
cd ~/Progetti/essenza-oriente-app
```
```
npx expo run:ios
```
La prima volta ci mette 5–10 minuti (compila). Poi si apre l'iPhone finto con l'app. Le modifiche successive compaiono in pochi secondi.

## Passo 11 — Prompt 2 e 3
Quando il prompt 1 funziona, nella finestra di Claude scrivi:
```
Ora esegui per intero PROMPT-2-app-cliente.md.
```
E dopo, quando anche quello funziona:
```
Ora esegui per intero PROMPT-3-area-riservata-e-app-store.md.
```

## Se qualcosa va storto
- **"command not found"**: chiudi e riapri il Terminale; se continua, rifai il passo dove si installava quel programma.
- **Errore rosso durante la compilazione**: scrivi a Claude "ho questo errore" e incolla il testo, lo sistema lui.
- **Vuoi riprendere il lavoro un altro giorno**: Terminale → `cd ~/Progetti/essenza-oriente-app` → `claude --continue` (riprende la conversazione dove l'avevi lasciata).
- **Uscire da Claude**: scrivi `/exit` oppure Ctrl + C due volte.
