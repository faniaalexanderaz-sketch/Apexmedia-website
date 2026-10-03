# Graph Report - Apexmedia-website  (2026-10-03)

## Corpus Check
- Large corpus: 377 files · ~8,304,165 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 780 nodes · 1268 edges · 54 communities (45 shown, 9 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Arabesque Admin API
- Audit Gratuito UI (Next.js)
- Fioreria Ads e Collezione
- Arabesque Storefront JS
- Audit Gratuito Dipendenze
- Arabesque Checkout Stripe
- Fioreria Admin Dashboard
- Arabesque Prompt e Design
- Essenza Ads e Cookie
- Fioreria Movimento UI
- Fioreria Account e Coupon
- Audit Admin e Email
- Fioreria Email Ordini
- Audit Config TypeScript
- fioreria/main.js
- admin/layout.tsx
- arabesque/checkout.js
- script.js
- admin-scorte.js
- fioreria/api/_admin.js
- essenza-oriente/animazioni.js
- account.js
- lead/route.ts
- fallback-storage.ts
- fioreria/animazioni.js
- Catalogo Donna
- essenza-oriente-massaggio-promo/package.
- Catalogo Accessori
- [id]/route.ts
- Campagna Google Ads Essenza d'Oriente se
- assistente.js
- fioreria/api/traccia-ordine.js
- arabesque/package.json
- genera-trattamenti.js
- fioreria/package.json
- hyperframes.json
- Arabesque robots.txt
- arabesque/catalogo.js
- audit_gratuito_app_globals
- APEXMEDIA landing page
- fioreria/cookie.js
- main.js
- Pagina Curvy XL-6XL
- AdminPage()
- arabesque/vercel.json
- assistente-fiorista.js
- arabesque/cookie.js
- next.config.mjs
- fioreria/vercel.json
- LICENSE frontend-design skill
- Essenza d'Oriente robots.txt

## God Nodes (most connected - your core abstractions)
1. `Arabesque Busalla e-commerce (README)` - 25 edges
2. `compilerOptions` - 17 edges
3. `Antica Fioreria - Home` - 16 edges
4. `Essenza d'Oriente - Home (landing massaggi Alessandria)` - 15 edges
5. `sql` - 13 edges
6. `Campagna Google Ads Essenza d'Oriente (3 set - 3 ott 2026, EUR 450)` - 13 edges
7. `sql()` - 12 edges
8. `assicuraSchema()` - 12 edges
9. `assicuraSchema()` - 12 edges
10. `Home` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Campagna Google Ads Essenza d'Oriente (3 set - 3 ott 2026, EUR 450)` --semantically_similar_to--> `Campagna Google Ads Antica Fioreria (15 set - 14 ott 2026, EUR 270)`  [INFERRED] [semantically similar]
  essenza-oriente/campagna-ads-settembre-2026.md → fioreria/campagna-ads-settembre-2026.md
- `Campagna Google Ads Fioreria set-ott 2026 (Shopping + Ricerca, 270 euro)` --semantically_similar_to--> `Campagna Google Ads Essenza d'Oriente set-ott 2026 (450 euro, Ricerca locale)`  [INFERRED] [semantically similar]
  fioreria/campagna-ads-settembre-2026.pdf → essenza-oriente/campagna-ads-settembre-2026.pdf
- `BRIEF Reel Essenza d'Oriente (Meta Ads 9:16, 20s)` --references--> `Social proof 5,0 stelle Google, 106 recensioni`  [EXTRACTED]
  reels/essenza-oriente-massaggio-promo/BRIEF.md → essenza-oriente/campagna-ads-settembre-2026.pdf
- `Avviso incoerenza prezzo annuncio 40/40 vs sito 60/60` --conceptually_related_to--> `6 gruppi annunci RSA con landing per trattamento`  [INFERRED]
  reels/essenza-oriente-massaggio-promo/BRIEF.md → essenza-oriente/campagna-ads-settembre-2026.pdf
- `Apexmedia-website README` --conceptually_related_to--> `Arabesque Busalla e-commerce (README)`  [INFERRED]
  README.md → arabesque/README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Funnel acquisto Arabesque** — arabesque_donna, arabesque_prodotto, arabesque_checkout, arabesque_ordine_completato [INFERRED 0.85]
- **Pagine legali e policy** — arabesque_privacy, arabesque_cookie_policy, arabesque_resi_spedizioni [INFERRED 0.85]
- **Catena prompt di sviluppo** — arabesque_prompt_base, arabesque_prompt_v2_chiaro, arabesque_prompt_dinamico, arabesque_prompt_migliora_design_conversione [INFERRED 0.85]
- **Essenza d'Oriente treatment landing pages** — essenza_oriente_trattamenti_coppettazione, essenza_oriente_trattamenti_gua_sha, essenza_oriente_trattamenti_massaggio_oli_essenziali, essenza_oriente_trattamenti_massaggio_spa, essenza_oriente_trattamenti_pedicure, essenza_oriente_trattamenti_pulizia_orecchie, essenza_oriente_trattamenti_riflessologia_plantare, essenza_oriente_trattamenti_tuina_shiatsu [EXTRACTED 1.00]
- **Fioreria purchase funnel (account, checkout, admin stock)** — fioreria_account, fioreria_checkout, fioreria_admin, fioreria_checkout_funnel_steps [INFERRED 0.75]
- **Funnel acquisto Fioreria: collezione, prodotto, carrello, ordine** — fioreria_collezione, fioreria_prodotto, fioreria_carrello_checkout, fioreria_ordine_completato, fioreria_traccia_ordine [INFERRED 0.85]
- **Elementi di fiducia e conversione home Fioreria** — fioreria_index_blocco_fiducia, fioreria_index_recensioni, fioreria_index_spedizione_reso, fioreria_index_benvenuto10, fioreria_index_saldi_estivi [INFERRED 0.75]
- **Promo massaggio Essenza d'Oriente: reel, brief, campagna ads** — reels_essenza_oriente_massaggio_promo_brief, reels_essenza_oriente_massaggio_promo_index, essenza_oriente_campagna_ads_settembre_2026_pdf, reels_essenza_oriente_massaggio_promo_brief_offerta [INFERRED 0.85]

## Communities (54 total, 9 thin omitted)

### Community 0 - "Arabesque Admin API"
Cohesion: 0.07
Nodes (35): confrontoSicuro(), crypto, { sessioneValida }, { sql, assicuraSchema }, impostaCookieSessione(), impronta(), leggiCookie(), { impostaCookieSessione, confrontoSicuro } (+27 more)

### Community 1 - "Audit Gratuito UI (Next.js)"
Cohesion: 0.10
Nodes (29): Home(), CtaButton(), CONTATTI, Footer(), FormSection(), Hero(), base, IconArrowRight() (+21 more)

### Community 2 - "Fioreria Ads e Collezione"
Cohesion: 0.07
Nodes (34): Campagna Google Ads Fioreria set-ott 2026 (Shopping + Ricerca, 270 euro), Carrello e Procedi all'ordine (checkout), Cookie Policy (Fioreria), Guida fotografie home Fioreria (19 foto), Antica Fioreria - Home, Codice BENVENUTO10 (-10% primo ordine), Blocco fiducia (4,9/5, 2.500+ vendute, 48/72h, pagamenti sicuri), Sezione Come nascono (artigianalita, bottega dal 1953) (+26 more)

### Community 3 - "Arabesque Storefront JS"
Cohesion: 0.12
Nodes (32): aggiornaPallino(), aggiungiAlCarrello(), aggiungiGiorniLavorativi(), allineaTestiSenzaWhatsapp(), applicaConfig(), apriCarrello(), apriRicerca(), avvia() (+24 more)

### Community 4 - "Audit Gratuito Dipendenze"
Cohesion: 0.06
Nodes (30): dependencies, next, react, react-dom, description, devDependencies, autoprefixer, postcss (+22 more)

### Community 5 - "Arabesque Checkout Stripe"
Cohesion: 0.09
Nodes (12): { ARB_PRODOTTI, arbPrezzoFinale }, prezzoUfficiale(), SPEDIZIONE, Stripe, prezzoUfficiale(), arbDisponibile(), arbFiltra(), arbPrezzoFinale() (+4 more)

### Community 6 - "Fioreria Admin Dashboard"
Cohesion: 0.11
Nodes (20): caricaDati(), disegnaOrdini(), disegnaScorte(), disegnaVisite(), euro(), nomeProdotto(), toast(), Campagna Google Ads Antica Fioreria (15 set - 14 ott 2026, EUR 270) (+12 more)

### Community 7 - "Arabesque Prompt e Design"
Cohesion: 0.10
Nodes (22): Pannello interno admin, PROMPT-DINAMICO: passerella e testo colorato, Passerella a scorrimento automatico (vetrina viva), Prompt migliora design e conversione, Revisione critica di secondo livello, PROMPT-V2-CHIARO: dieci interventi Galleria chiara, Arabesque Busalla e-commerce (README), Arabesque Abbigliamento (cliente, Via Vittorio Veneto 154 Busalla) (+14 more)

### Community 8 - "Essenza Ads e Cookie"
Cohesion: 0.15
Nodes (23): Campagna Google Ads Essenza d'Oriente (3 set - 3 ott 2026, EUR 450), KPI campagna: CPA target <= EUR 18, 25-45 prenotazioni/mese, Strategia Google Ads Ricerca locale (EUR 15/giorno, 6 gruppi annunci), aggiornaConsensoGtag(), caricaGTM(), crea(), imposta(), nascondi() (+15 more)

### Community 9 - "Fioreria Movimento UI"
Cohesion: 0.13
Nodes (15): accendi(), accensioni(), alloScoperto(), avanzamento(), avvia(), inclina(), parallasse(), avvia() (+7 more)

### Community 10 - "Fioreria Account e Coupon"
Cohesion: 0.26
Nodes (20): accedi(), aggiorna(), couponValido(), disiscriviNewsletter(), emailValida(), generaReset(), inWishlist(), iscriviNewsletter() (+12 more)

### Community 11 - "Audit Admin e Email"
Cohesion: 0.19
Nodes (17): BADGE_TEMPERATURA, StatoPagina, datiLeadHtml(), emailNotificaInterna(), rigaTabella(), LABEL_BUDGET, LABEL_HA_SITO, LABEL_SETTORE (+9 more)

### Community 12 - "Fioreria Email Ordini"
Cohesion: 0.14
Nodes (15): inviaEmail(), emailConfermaOrdine(), euro(), rigaArticolo(), rigaExtra(), { inviaEmail }, { afcProdotto }, { emailConfermaOrdine, rigaArticolo, rigaExtra } (+7 more)

### Community 13 - "Audit Config TypeScript"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 14 - "fioreria/main.js"
Cohesion: 0.16
Nodes (10): add(), cardProdotto(), checkout(), couponAttivo(), euro(), render(), salva(), spedizioneCorrente() (+2 more)

### Community 15 - "admin/layout.tsx"
Cohesion: 0.18
Nodes (11): metadata, POST(), POST(), contentType, size, adminConfigurato(), cancellaCookieSessione(), impostaCookieSessione() (+3 more)

### Community 16 - "arabesque/checkout.js"
Cohesion: 0.25
Nodes (15): aggiornaConsegna(), aggiornaPagamento(), aggiornaRiepiloghiBrevi(), apriPasso(), conti(), invia(), chiudi(), demo() (+7 more)

### Community 17 - "script.js"
Cohesion: 0.17
Nodes (7): aggiornaContiOfferta(), azzeraScelta(), decodifica(), messaggioWa(), offertaResiduo(), scegliTrattamento(), traccia()

### Community 18 - "admin-scorte.js"
Cohesion: 0.20
Nodes (10): { sessioneValida }, { sql, assicuraSchema }, { sql, assicuraSchema }, Stripe, assicuraSchema(), { neon }, SCORTE_INIZIALI, sql (+2 more)

### Community 19 - "fioreria/api/_admin.js"
Cohesion: 0.19
Nodes (11): crypto, { sessioneValida }, { sql, assicuraSchema }, impostaCookieSessione(), impronta(), leggiCookie(), { impostaCookieSessione }, { sessioneValida } (+3 more)

### Community 20 - "essenza-oriente/animazioni.js"
Cohesion: 0.23
Nodes (10): allaVista(), animaEtichetta(), animaTesto(), animaTitolo(), liberaHero(), osserva(), prendi(), ripristina() (+2 more)

### Community 21 - "account.js"
Cohesion: 0.21
Nodes (9): apriDashboard(), collegaBlur(), disegnaCoupon(), disegnaIndirizzi(), disegnaOrdini(), disegnaWishlist(), erroreCampo(), mostra() (+1 more)

### Community 22 - "lead/route.ts"
Cohesion: 0.23
Nodes (10): dynamic, POST(), inviaEmail(), emailRingraziamentoLead(), segnaEmailInviata(), LeadInput, BUDGET_VALIDI, HA_SITO_VALIDI (+2 more)

### Community 23 - "fallback-storage.ts"
Cohesion: 0.31
Nodes (10): aggiornaStatoSuFile(), FILE_PATH, leggiFile(), leggiLeadDaFile(), salvaLeadSuFile(), scriviFile(), calcolaPunteggio(), classificaTemperatura() (+2 more)

### Community 24 - "fioreria/animazioni.js"
Cohesion: 0.29
Nodes (9): allaVista(), animaEyebrow(), animaTitolo(), dopoPagina(), entra(), osserva(), prendi(), svuota() (+1 more)

### Community 25 - "Catalogo Donna"
Cohesion: 0.20
Nodes (4): Catalogo Donna, colonna(), voce(), prodotti.js catalogo unica fonte dati

### Community 26 - "essenza-oriente-massaggio-promo/package."
Cohesion: 0.17
Nodes (11): devDependencies, @hyperframes/core, name, private, scripts, check, dev, publish (+3 more)

### Community 27 - "Catalogo Accessori"
Cohesion: 0.22
Nodes (11): Catalogo Accessori, Cookie policy, Home, Pagina Negozio Busalla, Ordine confermato, Pagamento annullato, Privacy policy, Misurazione GA4/Meta dopo consenso cookie (+3 more)

### Community 28 - "[id]/route.ts"
Cohesion: 0.31
Nodes (9): PATCH(), STATI_VALIDI, dynamic, GET(), sessioneValida(), adminConfigurato(), aggiornaStatoLead(), elencaLead() (+1 more)

### Community 29 - "Campagna Google Ads Essenza d'Oriente se"
Cohesion: 0.25
Nodes (10): Campagna Google Ads Essenza d'Oriente set-ott 2026 (450 euro, Ricerca locale), 6 gruppi annunci RSA con landing per trattamento, Social proof 5,0 stelle Google, 106 recensioni, AGENTS.md progetto HyperFrames reel, BRIEF Reel Essenza d'Oriente (Meta Ads 9:16, 20s), Promo massaggio 40 min / 40 euro + 10 euro sul prossimo trattamento, Timeline reel in 9 scene (hook, social proof, CTA1, CTA2), CLAUDE.md progetto HyperFrames reel (+2 more)

### Community 30 - "assistente.js"
Cohesion: 0.22
Nodes (6): { AFC_PRODOTTI }, assicuraTabellaLimiti(), catalogoPerPrompt(), costruisciSystemPrompt(), DOMINI_CONSENTITI, { sql, assicuraSchema }

### Community 31 - "fioreria/api/traccia-ordine.js"
Cohesion: 0.24
Nodes (5): { afcProdotto }, { sql, assicuraSchema }, afcProdotto(), afcSpedizioneCosto(), afcSpedizioneTier()

### Community 32 - "arabesque/package.json"
Cohesion: 0.22
Nodes (8): dependencies, @neondatabase/serverless, stripe, description, @neondatabase/serverless, stripe, name, private

### Community 33 - "genera-trattamenti.js"
Cohesion: 0.25
Nodes (6): fs, MENU_TRATTAMENTI, menuDrawer(), pagina(), path, TRATTAMENTI

### Community 34 - "fioreria/package.json"
Cohesion: 0.22
Nodes (8): dependencies, @neondatabase/serverless, stripe, description, @neondatabase/serverless, stripe, name, private

### Community 35 - "hyperframes.json"
Cohesion: 0.22
Nodes (8): media, autoProxy, paths, assets, blocks, components, registry, $schema

### Community 36 - "Arabesque robots.txt"
Cohesion: 0.29
Nodes (8): Arabesque robots.txt, Arabesque - Termini e condizioni di vendita, Offerta primo ordine -10% con BENVENUTO10 e spedizione gratuita sopra 79 EUR, Diritto di recesso 14 giorni e garanzia legale 2 anni, Arabesque - Traccia il tuo ordine, Form tracciamento ordine (numero ordine + email), Arabesque - Abbigliamento uomo (Collezione 02), CTA Camerino a distanza: consiglio taglia su WhatsApp

### Community 37 - "arabesque/catalogo.js"
Cohesion: 0.52
Nodes (6): applica(), insieme(), render(), renderFiltri(), scheletri(), url()

### Community 38 - "audit_gratuito_app_globals"
Cohesion: 0.29
Nodes (4): metadata, plusJakarta, spaceGrotesk, viewport

### Community 39 - "APEXMEDIA landing page"
Cohesion: 0.29
Nodes (7): APEXMEDIA landing page, CTA Richiedi una consulenza, Form consulenza gratuita con invio su WhatsApp, Perche APEXMEDIA (trasparenza, metodo, un referente), Risultati: 8.7x ROI, 150+ aziende, 24M+ reach, Servizi APEXMEDIA (Social, Meta/TikTok Ads, Lead Gen, Branding, Siti e Funnel), Guida immagini landing APEXMEDIA (5 file)

### Community 41 - "fioreria/cookie.js"
Cohesion: 0.53
Nodes (4): caricaGTM(), crea(), imposta(), nascondi()

### Community 42 - "main.js"
Cohesion: 0.53
Nodes (4): apply(), computeTargets(), smootherstep(), tick()

### Community 43 - "Pagina Curvy XL-6XL"
Cohesion: 0.40
Nodes (5): Pagina Curvy XL-6XL, PROMPT-BASE: master prompt e-commerce v1 nero couture, Riferimento tecnico fioreria/ (tema opposto), Posizionamento: boutique che veste ogni corporatura XS-6XL, Differenziatore taglie XS-6XL / curvy

### Community 44 - "AdminPage()"
Cohesion: 0.50
Nodes (4): AdminPage(), caricaLead(), handleLogin(), formattaData()

### Community 45 - "arabesque/vercel.json"
Cohesion: 0.50
Nodes (3): cleanUrls, headers, rewrites

## Knowledge Gaps
- **210 isolated node(s):** `crypto`, `{ neon }`, `{ sql, assicuraSchema }`, `{ sessioneValida }`, `{ impostaCookieSessione, confrontoSicuro }` (+205 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 304 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `admin/layout.tsx` to `audit_gratuito_app_globals`, `[id]/route.ts`, `Audit Gratuito Dipendenze`, `lead/route.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `react` connect `Audit Gratuito UI (Next.js)` to `Audit Admin e Email`, `Audit Gratuito Dipendenze`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `sql` connect `admin-scorte.js` to `fioreria/api/_admin.js`, `Fioreria Email Ordini`, `assistente.js`, `fioreria/api/traccia-ordine.js`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Arabesque Busalla e-commerce (README)` (e.g. with `PROMPT-BASE: master prompt e-commerce v1 nero couture` and `PROMPT-DINAMICO: passerella e testo colorato`) actually correct?**
  _`Arabesque Busalla e-commerce (README)` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `crypto`, `{ neon }`, `{ sql, assicuraSchema }` to the rest of the system?**
  _210 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Arabesque Admin API` be split into smaller, more focused modules?**
  _Cohesion score 0.07215686274509804 - nodes in this community are weakly interconnected._
- **Should `Audit Gratuito UI (Next.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.10202020202020202 - nodes in this community are weakly interconnected._