#!/usr/bin/env python3
"""Raccoglie attività da TuttoCittà, che a differenza di PagineGialle pubblica l'email.

   python3 1b-tuttocitta.py ristoranti,parrucchieri,estetisti  [citta]
"""
import json, re, sys, time, urllib.request, pathlib

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
FUORI = pathlib.Path("/tmp/out"); FUORI.mkdir(parents=True, exist_ok=True)

def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "it-IT,it;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "ignore")

def campo(piatto, rec, chiave):
    """Risolve un campo del record, seguendo il riferimento per indice."""
    i = rec.get(chiave)
    if not isinstance(i, int) or i < 0 or i >= len(piatto): return None
    v = piatto[i]
    if isinstance(v, list):
        return [piatto[x] for x in v if isinstance(x, int) and 0 <= x < len(piatto)
                and isinstance(piatto[x], (str, int, float))]
    return v if isinstance(v, (str, int, float)) else None

def schede(html):
    m = re.search(r'id="__NUXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    if not m: return []
    p = json.loads(m.group(1))
    out, visti = [], set()
    for rec in p:
        if not isinstance(rec, dict) or "ds_ragsoc" not in rec or "ds_cap" not in rec:
            continue
        nome = campo(p, rec, "ds_ragsoc")
        if not nome or nome in visti: continue
        visti.add(nome)
        mail = campo(p, rec, "ds_ls_email") or []
        tel  = campo(p, rec, "ds_ls_telefoni") or []
        out.append({
            "nome": nome,
            "citta": campo(p, rec, "ds_comune_ita") or "",
            "indirizzo": campo(p, rec, "addr") or "",
            "cap": campo(p, rec, "ds_cap") or "",
            "email": (mail[0] if isinstance(mail, list) and mail else mail) or "",
            "telefono": (str(tel[0]) if isinstance(tel, list) and tel else str(tel or "")),
            "sito_dichiarato": campo(p, rec, "ds_url_sito") or campo(p, rec, "ds_url_minisito") or "",
            "categoria": campo(p, rec, "ds_cat") or "",
            "piva": campo(p, rec, "ds_pi") or "",
        })
    return out

CATEGORIE = sys.argv[1].split(",")
CITTA = sys.argv[2] if len(sys.argv) > 2 else "alessandria"
PAGINE = int(sys.argv[3]) if len(sys.argv) > 3 else 4

f = FUORI / "tuttocitta.json"
tutti = {x["nome"]: x for x in json.loads(f.read_text(encoding="utf-8"))} if f.exists() else {}

for cat in CATEGORIE:
    tot = nuovi = mail = 0
    for pagina in range(1, PAGINE + 1):
        url = f"https://www.tuttocitta.it/{cat}/{CITTA}" + (f"?page={pagina}" if pagina > 1 else "")
        try:
            h = get(url)
        except Exception as e:
            print(f"  ! {cat} p{pagina}: {e}", file=sys.stderr); break
        got = schede(h)
        if not got: break
        tot += len(got); mail += sum(1 for s in got if s["email"])
        for s in got:
            if s["citta"].strip().lower() != CITTA.replace("-", " ").lower(): continue
            if s["nome"] not in tutti:
                tutti[s["nome"]] = s; nuovi += 1
        time.sleep(1.8)
    print(f"  {cat:26} {tot:3} schede · {nuovi:3} nuove · {mail:2} con email", file=sys.stderr)

f.write_text(json.dumps(list(tutti.values()), ensure_ascii=False, indent=1), encoding="utf-8")
v = list(tutti.values())
print(f"\nTOTALE {CITTA}: {len(v)} · con email: {sum(1 for x in v if x['email'])} "
      f"· con sito: {sum(1 for x in v if x['sito_dichiarato'])}", file=sys.stderr)
