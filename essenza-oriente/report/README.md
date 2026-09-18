# Report Apex Media — Essenza d'Oriente

Report semestrale (marzo–agosto 2026) + piano di crescita settembre–ottobre 2026,
in italiano e in cinese semplificato, nel design system Apex Media (versione chiara,
allineata al report mensile di agosto 2026).

## File

| File | Contenuto |
|---|---|
| `Apex-Media-Essenza-dOriente-Report-6-mesi-IT.pdf` | Versione italiana, 18 pagine A4 |
| `Apex-Media-Essenza-dOriente-Report-6-mesi-CN.pdf` | Versione 简体中文 in linguaggio semplice, 19 pagine A4 |
| `content_it.py` / `content_cn.py` | Contenuti e numeri, una pagina per blocco |
| `assets/report.css` | Design system del documento |
| `assets/icons.py` | Icone dei canali |
| `build.py` | Generatore HTML → PDF |

## Rigenerare i PDF

```bash
./fetch-fonts.sh        # solo la prima volta (font CJK, non versionati)
python3 build.py
```

Richiede Chromium headless (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
modificabile in `build.py`).

## Nota sulla versione cinese

La versione CN **non è una traduzione riga per riga della IT**: è riscritta in
linguaggio semplice per una lettrice anziana e non tecnica. Nessun termine inglese
di marketing lasciato non spiegato (geo-targeting, remarketing, conversioni, CPA,
POV, Meta, organic…): ogni concetto è reso in cinese corrente e spiegato dove
compare. In più ha una pagina in più rispetto alla IT — **sezione 16, glossario**
(名词解释) — che spiega in una riga ciascuno i nomi delle piattaforme, le cose che
facciamo e come si leggono i numeri, così la cliente non deve chiedere.

Se si modifica il contenuto IT, la corrispondente modifica CN va riscritta in
linguaggio semplice, non tradotta letteralmente.

## Fonte dei dati

**Dati misurati.** I numeri per canale di agosto vengono dal report mensile Apex Media
del periodo **27 luglio – 27 agosto 2026**: Google 55 clienti, Instagram 4,
Facebook 1–2 (stima), TikTok 0, totale ≈ 61.

**Fatturato tracciato.** Dal report vendite Treatwell (screenshot del gestionale,
generato il 18 settembre 2026): **€1.275 su 33 trattamenti nel periodo 7 luglio –
19 settembre 2026** — 11 massaggi con oli €420, 8 riflessologie €275, 8 pedicure €280,
2 spa €150, 2 shiatsu €100, 1 coppettazione €25, 1 pulizia orecchie €25.
Sottoperiodo **29 agosto – 19 settembre: €400**, da cui si ricava 7 luglio – 28 agosto
= €875. Ritmo giornaliero €16,5 → €18,2 (+10%). Google (≈ €420 ad agosto) e Instagram
(≈ €60) restano stime, perché quelle prenotazioni arrivano per telefono e WhatsApp e non
passano dal gestionale: il documento lo dichiara esplicitamente.

**Aspettative (sezione 15).** Tre scenari a sei mesi — A tenere la rotta (≈95 clienti/mese,
≈€1.500), B scalata misurata e consigliata (≈162, ≈€2.700), C spinta forte (≈240, ≈€4.200) —
con la conversione di ogni obiettivo di fatturato in trattamenti al giorno allo scontrino
medio di €38,6, e il punto in cui il collo di bottiglia passa dalla pubblicità alla
capacità operativa del centro.

**Mesi marzo–luglio 2026.** Il tracciamento automatico è stato installato a luglio:
i numeri di quei mesi (13 → 16 → 20 → 25 → 32 clienti) sono una **ricostruzione** da
agenda, chiamate e prenotazioni, ed è scritto nel documento che lo sono.

**Proiezione settembre 2026 – febbraio 2027.** Google +15%/mese; Instagram accelerato
dal piano contenuti (8 clienti già da ottobre); Facebook riattivato da ottobre nel nuovo
ruolo di remarketing Meta e cross-posting (6 clienti da ottobre); TikTok in pausa.
Da ≈ 61 a ≈ 162 clienti/mese. È dichiarata come proiezione, non come garanzia.
