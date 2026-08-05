# Setup — Essenza d'Oriente Traffic Dashboard

Guida passo-passo per collegare la dashboard a Google Analytics 4 e deployarla su Vercel.

## 1. Creare il service account su Google Cloud Console

1. Vai su [console.cloud.google.com](https://console.cloud.google.com/) e accedi con l'account Google che gestisce (o ha accesso a) la proprietà GA4 di essenzadoriente.it.
2. In alto a sinistra, crea un nuovo progetto (es. `essenza-oriente-dashboard`) oppure selezionane uno esistente da usare per Apex Media.
3. Nella barra di ricerca in alto, cerca **"Google Analytics Data API"** e aprila, poi clicca **Abilita** per attivarla sul progetto.
4. Vai su **IAM e amministrazione → Service account** (menu ☰ a sinistra).
5. Clicca **+ Crea service account**.
   - Nome: `essenza-dashboard` (o simile).
   - Non serve assegnare ruoli a livello di progetto Google Cloud: l'accesso ai dati viene dato dentro Google Analytics (punto 2 sotto). Clicca **Fine**.
6. Apri il service account appena creato, vai sulla tab **Chiavi**.
7. Clicca **Aggiungi chiave → Crea nuova chiave → JSON**, poi **Crea**.
   - Verrà scaricato un file `.json`: **conservalo in un posto sicuro**, non va mai committato su Git.
8. Dal file JSON scaricato, ti servono due valori:
   - `client_email` → questo è `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
   - `private_key` → questo è `GOOGLE_PRIVATE_KEY`.

## 2. Dare accesso Viewer alla proprietà GA4 di essenzadoriente.it

1. Vai su [analytics.google.com](https://analytics.google.com/) con l'account che amministra la proprietà GA4 del sito.
2. Clicca l'icona ingranaggio **Amministrazione** in basso a sinistra.
3. Nella colonna **Proprietà**, verifica di aver selezionato la proprietà di essenzadoriente.it, poi clicca **Accesso alla proprietà** (Property Access Management).
4. Clicca il pulsante **+** in alto a destra → **Aggiungi utenti**.
5. Nel campo email, incolla esattamente il `client_email` del service account (es. `essenza-dashboard@nome-progetto.iam.gserviceaccount.com`).
6. Assegna il ruolo **Visualizzatore** (Viewer) — è sufficiente, la dashboard è di sola lettura.
7. Clicca **Aggiungi**.
8. Recupera il **GA4_PROPERTY_ID**: sempre in Amministrazione → colonna Proprietà → **Dettagli proprietà**. È il numero (es. `123456789`) mostrato in alto, senza il prefisso `properties/`.

> Nota: se in futuro il service account perde l'accesso (es. proprietà rimossa e ricreata), la dashboard mostrerà un errore chiaro nelle card invece di uno schermo bianco — basterà ripetere questo passo.

## 3. Configurare gli eventi di conversione in GTM (opzionale, per far comparire i dati)

La sezione "Eventi di conversione" cerca questi nomi evento in GA4 (configurabili in `lib/conversion-events.ts`):

- `click_whatsapp`
- `click_tel`
- `click_treatwell`

Finché i trigger in Google Tag Manager non sono attivi, questi contatori mostreranno `0` con il badge **"In configurazione"** — non un errore. Quando il team GTM attiva i trigger, i numeri inizieranno a popolarsi automaticamente, senza modifiche al codice.

## 4. Configurare le variabili d'ambiente su Vercel

1. Vai sul progetto Vercel collegato a questa dashboard (o creane uno nuovo importando la cartella `dashboard/` da GitHub — vedi punto 5).
2. Vai su **Settings → Environment Variables**.
3. Aggiungi le seguenti variabili (per gli ambienti **Production**, **Preview** e **Development**):

   | Nome | Valore |
   |---|---|
   | `DASHBOARD_PASSWORD` | La password che userete tu/il cliente per accedere alla dashboard. Scegline una robusta. |
   | `GA4_PROPERTY_ID` | Il numero recuperato al punto 2.8 |
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Il `client_email` dal file JSON |
   | `GOOGLE_PRIVATE_KEY` | Il `private_key` dal file JSON — vedi nota sotto |

   **Nota sulla chiave privata:** nel campo valore di Vercel puoi incollare la chiave così com'è nel JSON (con i veri "a capo"), Vercel la gestisce correttamente come variabile multi-riga. In alternativa puoi incollarla su una riga sola sostituendo ogni "a capo" con la sequenza letterale `\n` — il codice gestisce entrambi i formati.

4. Salva.

## 5. Deployare

### Se il progetto Vercel non esiste ancora

1. Su [vercel.com](https://vercel.com/), clicca **Add New → Project**.
2. Importa il repository GitHub `Apexmedia-website`.
3. In **Root Directory**, seleziona la cartella `dashboard` (perché la dashboard vive in un sottodirectory del repo).
4. Framework Preset: Vercel rileva automaticamente **Next.js** — lascialo così.
5. Prima di cliccare Deploy, aggiungi le variabili d'ambiente del punto 4 (o falle subito dopo e rideploya).
6. Clicca **Deploy**.

### Se il progetto esiste già

Basta pushare su `main` (o sul branch collegato al progetto Vercel): il deploy parte automaticamente. Dopo aver aggiunto/modificato variabili d'ambiente, vai su **Deployments** e clicca **Redeploy** sull'ultimo deployment perché le nuove variabili vengano applicate.

### Verifica finale

1. Apri l'URL del deployment.
2. Dovresti vedere la schermata di login: inserisci il valore di `DASHBOARD_PASSWORD`.
3. Nella sezione "Adesso" dovresti vedere il numero di utenti attivi in tempo reale (0 se in quel momento nessuno è sul sito, è normale).
4. Nella sezione "Report", prova a cambiare tra Oggi / 7 giorni / 30 giorni e verifica che i numeri cambino.
5. Se vedi un banner rosso di errore invece dei dati, rileggi i punti 1-2: quasi sempre è una variabile d'ambiente mancante/errata o il service account senza accesso Viewer alla proprietà GA4 corretta.
