#!/usr/bin/env python3
"""Caccia all'email dei prospect qualificati, su piu' fonti."""
import json, re, time, urllib.request, urllib.parse, urllib.error, pathlib
from concurrent.futures import ThreadPoolExecutor

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
SCARTA = re.compile(r'(sentry|wixpress|example\.|godaddy|\.png|\.jpg|\.webp|\.gif|jquery|@2x|domain\.com|'
                    r'privacy@|dpo@|abuse@|postmaster@|noreply|no-reply|paginegialle|italiaonline|iubenda|duckduckgo|error-lite|bing\.|microsoft|google\.|mojeek|'
                    r'facebook|support@|@sentry|wordpress|\.js$|@example)', re.I)

def get(url, timeout=18, ref=None):
    hh = {"User-Agent": UA, "Accept-Language": "it-IT,it;q=0.9",
          "Accept": "text/html,application/xhtml+xml,*/*;q=0.8"}
    if ref: hh["Referer"] = ref
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=hh), timeout=timeout) as r:
            return r.read(1_500_000).decode("utf-8", "ignore")
    except Exception:
        return ""

def mails(h):
    out = set()
    h = urllib.parse.unquote(h)
    for e in re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}', h):
        e = e.lower().strip('.')
        if not SCARTA.search(e) and 6 < len(e) < 55:
            out.add(e)
    return out

def ddg(q):
    h = get("https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(q))
    return h

def cerca(p):
    trovate = set()
    if p.get("email_pg"): trovate.add(p["email_pg"].lower())
    for e in p.get("email_sito", []): trovate.add(e.lower())

    nome = p["nome"]

    # 1) scheda PagineGialle dell'attivita'
    if p.get("pg_url"):
        trovate |= mails(get(p["pg_url"]))
        time.sleep(0.5)

    # 2) pagina Facebook indicata come sito (spesso l'email e' pubblica)
    if p.get("sito") and "facebook.com" in p["sito"]:
        trovate |= mails(get(p["sito"]))
        time.sleep(0.5)

    # 3) ricerca aperta
    if not trovate:
        for q in [f'"{nome}" Alessandria email', f'"{nome}" Alessandria contatti mail']:
            trovate |= mails(ddg(q))
            time.sleep(1.5)
            if trovate: break

    p["email_trovate"] = sorted(trovate)
    return p

# ricompone i prospect qualificati con il loro pg_url
aziende = {a["nome"]: a for a in json.loads(pathlib.Path("/tmp/out/aziende.json").read_text(encoding="utf-8"))}
ver = json.loads(pathlib.Path("/tmp/out/verificati.json").read_text(encoding="utf-8"))
qual = [v for v in ver if v["verdetto"] in ("senza_sito", "sito_down", "sito_lento_mobile", "sito_vecchio")]
for v in qual:
    a = aziende.get(v["nome"], {})
    v["pg_url"] = a.get("pg_url", ""); v["email_pg"] = a.get("email", "") or v.get("email_pg", "")

print(f"caccia email su {len(qual)} prospect qualificati...\n")
with ThreadPoolExecutor(max_workers=4) as ex:
    out = list(ex.map(cerca, qual))

pathlib.Path("/tmp/out/prospect.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
con = [o for o in out if o["email_trovate"]]
print(f"con email: {len(con)} / {len(out)}\n")
for o in con:
    print(f"  {o['verdetto']:18} {o['nome'][:38]:40} {', '.join(o['email_trovate'][:2])}")
