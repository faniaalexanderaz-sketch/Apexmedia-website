# Report Apex Media — Essenza d'Oriente

Report semestrale (marzo–agosto 2026) + piano di crescita settembre–ottobre 2026,
in italiano e in cinese semplificato, nel design system Apex Media (versione chiara,
allineata al report mensile di agosto 2026).

## File

| File | Contenuto |
|---|---|
| `Apex-Media-Essenza-dOriente-Report-6-mesi-IT.pdf` | Versione italiana, 14 pagine A4 |
| `Apex-Media-Essenza-dOriente-Report-6-mesi-CN.pdf` | Versione 简体中文, 14 pagine A4 |
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

Tutti i numeri per canale vengono dal report mensile Apex Media del periodo
**27 luglio – 27 agosto 2026**: Google 55 clienti, Instagram 4, Facebook 1–2 (stima),
TikTok 0, totale ≈ 61. Per i mesi marzo–giugno 2026 non esistono dati per canale
(il tracciamento è stato installato a luglio) e il documento lo dichiara esplicitamente
invece di stimarli.

La proiezione settembre 2026 – febbraio 2027 usa le ipotesi del file
`Essenza_dOriente_Scalata.xlsx`: Google +15%/mese, Instagram +25%/mese,
Facebook+TikTok −30%/mese. È dichiarata come proiezione, non come garanzia.
