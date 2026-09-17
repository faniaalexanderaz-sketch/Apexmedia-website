#!/usr/bin/env python3
"""Attivita' di Alessandria da PagineGialle: anagrafica (JSON-LD) + sito (CTA 'sito web')."""
import json, re, sys, time, html as htmlmod, urllib.request, pathlib

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "it-IT,it;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "ignore")

def siti_da_pagina(h):
    """{nome attivita' -> url dichiarato come 'sito web'}"""
    mappa = {}
    for m in re.finditer(r'<a[^>]*title="sito web - ([^"]+)"[^>]*href="([^"]+)"', h):
        mappa[htmlmod.unescape(m.group(1)).strip()] = htmlmod.unescape(m.group(2)).strip()
    for m in re.finditer(r'<a[^>]*href="([^"]+)"[^>]*title="sito web - ([^"]+)"', h):
        mappa.setdefault(htmlmod.unescape(m.group(2)).strip(), htmlmod.unescape(m.group(1)).strip())
    return mappa

def items_da_pagina(h):
    siti = siti_da_pagina(h)
    out = []
    for b in re.findall(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', h, re.S):
        try: d = json.loads(b)
        except Exception: continue
        if d.get("@type") != "ItemList": continue
        for el in d.get("itemListElement", []):
            it = el.get("item") or {}
            if not it.get("name"): continue
            addr = it.get("address") or {}
            cps = it.get("contactPoint") or []
            cp = cps[0] if cps else {}
            nome = it["name"].strip()
            out.append({
                "nome": nome,
                "pg_url": it.get("url", ""),
                "citta": addr.get("addressLocality", "").strip(),
                "indirizzo": addr.get("streetAddress", ""),
                "telefono": (cp.get("telephone") or it.get("telephone") or "").strip(),
                "email": (cp.get("email") or "").strip(),
                "sito_dichiarato": siti.get(nome, ""),
                "recensioni": (it.get("aggregateRating") or {}).get("reviewCount", ""),
            })
    return out

CATEGORIE = sys.argv[1].split(",")
PAGINE = int(sys.argv[2]) if len(sys.argv) > 2 else 3

tutti = {}
for cat in CATEGORIE:
    for p in range(1, PAGINE + 1):
        url = (f"https://www.paginegialle.it/piemonte/alessandria/{cat}.html" if p == 1
               else f"https://www.paginegialle.it/piemonte/alessandria/{cat}/p-{p}.html")
        try: h = get(url)
        except Exception as e:
            print(f"  ! {cat} p{p}: {e}", file=sys.stderr); continue
        got = items_da_pagina(h); nuovi = 0
        for it in got:
            if it["citta"].lower() != "alessandria": continue
            it["categoria"] = cat
            if it["pg_url"] not in tutti:
                tutti[it["pg_url"]] = it; nuovi += 1
        con_sito = sum(1 for it in got if it["sito_dichiarato"])
        print(f"  {cat} p{p}: {len(got)} schede · {nuovi} nuove AL · {con_sito} con sito", file=sys.stderr)
        time.sleep(1.2)

_f = pathlib.Path("/tmp/out/aziende.json")
prec = json.loads(_f.read_text(encoding="utf-8")) if _f.exists() else []
for _p in prec: tutti.setdefault(_p["pg_url"], _p)
_f.write_text(
    json.dumps(list(tutti.values()), ensure_ascii=False, indent=1), encoding="utf-8")
v = list(tutti.values())
print(f"\nTOTALE Alessandria: {len(v)} | con sito dichiarato: {sum(1 for x in v if x['sito_dichiarato'])}"
      f" | con email: {sum(1 for x in v if x['email'])}", file=sys.stderr)
