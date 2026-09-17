#!/usr/bin/env python3
"""Da prospect.json a prospects.csv: tiene solo chi ha email verificata e problema verificato."""
import json, csv, re, pathlib, sys

PRIORITA = {"sito_down": 0, "senza_sito": 1, "sito_lento_mobile": 2, "sito_vecchio": 3}
SCARTA_MAIL = re.compile(r'(duckduckgo|error-lite|bing\.|microsoft|google\.|mojeek|paginegialle|'
                         r'italiaonline|iubenda|sentry|wixpress|example|godaddy|pixelarity|'
                         r'noreply|no-reply|privacy@|dpo@|abuse@|postmaster@)', re.I)

def mail_buona(e, sito):
    if SCARTA_MAIL.search(e): return False
    if not re.fullmatch(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,6}', e): return False
    if re.fullmatch(r'\d+@.*', e.split('@')[0] + '@x'): return False   # es. 171691585@qq.com
    return True

def punteggio(p):
    """Piu' alto = prospect migliore: problema grave + segnali di attivita' viva."""
    s = 100 - PRIORITA.get(p["verdetto"], 9) * 10
    if p.get("telefono"): s += 5
    if len(p.get("problemi", [])) > 1: s += 5
    return s

src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/out/prospect.json")
prospect = json.loads(src.read_text(encoding="utf-8"))

righe, scartati = [], []
for p in prospect:
    mail = [e for e in p.get("email_trovate", []) if mail_buona(e, p.get("sito", ""))]
    problemi = [x for x in p.get("problemi", []) if x]
    if not mail:
        scartati.append((p["nome"], "nessuna email verificata")); continue
    if not problemi:
        scartati.append((p["nome"], "nessun problema verificato")); continue
    if p.get("certezza") == "bassa" or p["verdetto"] == "da_verificare_a_mano":
        scartati.append((p["nome"], "verifica non conclusiva")); continue

    # email preferita: quella sul dominio dell'attivita', altrimenti la prima
    dom = re.sub(r'^https?://(www\.)?', '', p.get("sito", "")).split('/')[0].lower()
    mail.sort(key=lambda e: (0 if dom and dom.endswith(e.split('@')[1]) else 1, len(e)))

    righe.append({
        "attivita": p["nome"], "citta": "Alessandria", "referente": "",
        "email": mail[0], "telefono": p.get("telefono", ""),
        "sito": re.sub(r'^https?://', '', p.get("sito", "")).rstrip('/'),
        "scenario": p["verdetto"], "dettaglio": problemi[0],
        "fonte": "PagineGialle + audit tecnico", "stato": "pronto",
        "data_invio": "", "note": " | ".join(problemi[1:3]),
        "_punteggio": punteggio(p),
    })

righe.sort(key=lambda r: -r["_punteggio"])
campi = ["attivita","citta","referente","email","telefono","sito","scenario",
         "dettaglio","fonte","stato","data_invio","note"]
out = pathlib.Path(__file__).resolve().parent.parent / "prospects.csv"
with out.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=campi, quoting=csv.QUOTE_ALL)
    w.writeheader()
    for r in righe:
        r.pop("_punteggio"); w.writerow(r)

print(f"PRONTI: {len(righe)}  |  scartati: {len(scartati)}")
for n, m in scartati[:40]: print(f"  - {n[:40]:42} {m}")
print()
for r in righe: print(f"  [{r['scenario']:18}] {r['attivita'][:34]:36} {r['email']}")
