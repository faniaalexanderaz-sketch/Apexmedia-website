#!/usr/bin/env python3
"""Seconda passata: scarta i falsi positivi e raccoglie le email dai siti vivi."""
import json, re, time, socket, urllib.request, urllib.error, pathlib
from concurrent.futures import ThreadPoolExecutor

UAS = [
 "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
 "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]
SCARTA_MAIL = re.compile(r'(sentry|wixpress|example\.|godaddy|\.png|\.jpg|\.jpeg|\.webp|\.gif|@sentry|jquery|@2x|domain\.com|email\.com|yoursite|tuosito|nome@|mail@mail)', re.I)

def prova(url, ua, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept-Language": "it-IT,it;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read(2_000_000).decode("utf-8","ignore"), None
    except urllib.error.HTTPError as e:
        return e.code, "", f"HTTP {e.code}"
    except Exception as e:
        return None, "", f"{type(e).__name__}: {e}"

def dns_ok(url):
    host = re.sub(r"^https?://", "", url).split("/")[0]
    try:
        socket.getaddrinfo(host, 443); return True
    except Exception:
        return False

def mail_da(h):
    out = set()
    for e in re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', h):
        if not SCARTA_MAIL.search(e) and len(e) < 60:
            out.add(e.lower().strip('.'))
    return out

def controlla(r):
    url = r["sito"]
    if r["verdetto"] == "senza_sito":
        return r

    # DNS: è il segnale più affidabile che il sito non esiste più
    if not dns_ok(url):
        r["verdetto"] = "sito_down"; r["certezza"] = "alta"
        r["problemi"] = ["Il dominio non risolve più: digitando l'indirizzo il browser dice che il sito non esiste"]
        return r

    # riprova con due user-agent prima di dichiararlo rotto
    testi = []
    for ua in UAS:
        st, h, err = prova(url, ua)
        if h: testi.append(h)
        if st == 200 and h: break
        time.sleep(0.8)

    if not testi:
        # nessuna delle due prove ha dato contenuto: probabile blocco anti-bot, non certezza
        r["certezza"] = "bassa"
        r["verdetto"] = "da_verificare_a_mano"
        r["nota_verifica"] = f"Ultimo stato {r.get('stato_http')}: può essere un blocco anti-bot, va aperto a mano"
        return r

    h = max(testi, key=len)
    r["certezza"] = "alta"
    r["email_sito"] = sorted(mail_da(h))

    # cerca anche una pagina contatti, lì sta quasi sempre la mail buona
    if not r["email_sito"]:
        base = url.rstrip("/")
        for p in ["/contatti", "/contatti.html", "/contatti.php", "/contact", "/chi-siamo", "/dove-siamo"]:
            st, hc, _ = prova(base + p, UAS[1], timeout=12)
            if hc:
                m = mail_da(hc)
                if m: r["email_sito"] = sorted(m); r["pagina_email"] = base + p; break
            time.sleep(0.4)

    # ricalcola i problemi sul contenuto buono
    t = h.lower(); probs = []
    if 'name="viewport"' not in t and "name='viewport'" not in t:
        probs.append("Il sito non ha le impostazioni per il telefono: da mobile la pagina esce fuori dallo schermo e bisogna zoomare per leggere")
    if "tel:" not in t:
        probs.append("Il numero di telefono non è cliccabile da telefono: per chiamarvi bisogna segnarselo a mano")
    anni = [int(a) for a in re.findall(r'(?:©|&copy;|copyright)[^0-9]{0,20}(20[0-2][0-9])', h, re.I)]
    if anni and max(anni) <= 2023:
        probs.append(f"In fondo alle pagine c'è ancora scritto «{max(anni)}»: chi capita sul sito non capisce se siete ancora aperti")
    if len(re.sub(r'<[^>]+>', ' ', h).split()) < 120:
        probs.append("La home ha pochissimo testo: Google non ha quasi niente da leggere e fatica a mostrarvi nelle ricerche")
    if re.search(r'\.swf|shockwave', t):
        probs.append("Il sito usa Flash, spento dal 2020: quelle parti oggi sono invisibili a tutti")

    r["problemi"] = probs
    r["verdetto"] = ("sito_lento_mobile" if any("telefono" in p or "zoomare" in p for p in probs)
                     else "sito_vecchio" if probs else "ok")
    return r

audit = json.loads(pathlib.Path("/tmp/out/audit.json").read_text(encoding="utf-8"))
# dedup per sito
visti = {}
for a in audit:
    k = re.sub(r'^https?://(www\.)?', '', a["sito"]).rstrip('/').lower() or a["nome"]
    visti.setdefault(k, a)
audit = list(visti.values())
print(f"{len(audit)} siti unici da verificare\n")

with ThreadPoolExecutor(max_workers=5) as ex:
    res = list(ex.map(controlla, audit))

pathlib.Path("/tmp/out/verificati.json").write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
from collections import Counter
print(Counter(r["verdetto"] for r in res).most_common())
mail = [r for r in res if r.get("email_sito") or r.get("email_pg")]
print(f"\ncon email: {len(mail)} / {len(res)}")
