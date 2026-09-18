# Report Apex Media — Essenza d'Oriente

Report semestrale (marzo–agosto 2026) + piano di crescita settembre–ottobre 2026,
in italiano e in cinese semplificato, nel design system Apex Media (versione chiara,
allineata al report mensile di agosto 2026).

## File

| File | Contenuto |
|---|---|
| `Apex-Media-Essenza-dOriente-Report-6-mesi-IT.pdf` | Versione italiana, 17 pagine A4 |
| `Apex-Media-Essenza-dOriente-Report-6-mesi-CN.pdf` | Versione 简体中文, 17 pagine A4 |
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

## Fonte dei dati

**Dati misurati.** I numeri per canale di agosto vengono dal report mensile Apex Media
del periodo **27 luglio – 27 agosto 2026**: Google 55 clienti, Instagram 4,
Facebook 1–2 (stima), TikTok 0, totale ≈ 61.

**Fatturato tracciato.** Treatwell è un dato esatto dal gestionale: luglio €290,
agosto €585 (14 trattamenti — 7 massaggi con oli, 2 spa, 2 riflessologie, 2 pedicure,
1 coppettazione), 1–18 settembre €290. Google (luglio ≈ €150–200, agosto ≈ €420) e
Instagram (agosto ≈ €60) sono stime, perché quelle prenotazioni arrivano per telefono
e WhatsApp e non passano da un gestionale. Il documento lo dichiara esplicitamente.

**Mesi marzo–luglio 2026.** Il tracciamento automatico è stato installato a luglio:
i numeri di quei mesi (13 → 16 → 20 → 25 → 32 clienti) sono una **ricostruzione** da
agenda, chiamate e prenotazioni, ed è scritto nel documento che lo sono.

**Proiezione settembre 2026 – febbraio 2027.** Google +15%/mese; Instagram accelerato
dal piano contenuti (8 clienti già da ottobre); Facebook riattivato da ottobre nel nuovo
ruolo di remarketing Meta e cross-posting (6 clienti da ottobre); TikTok in pausa.
Da ≈ 61 a ≈ 162 clienti/mese. È dichiarata come proiezione, non come garanzia.
