#!/usr/bin/env python3
"""Audit tecnico dei siti: cosa è rotto, in modo verificabile e citabile in email."""
import json, re, ssl, socket, time, urllib.request, urllib.error, pathlib, datetime, html as htmlmod
from concurrent.futures import ThreadPoolExecutor

UA_MOB = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
          "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
SOCIAL = re.compile(r'(facebook\.com|instagram\.com|linktr\.ee|wa\.me|business\.site|tiktok\.com)', re.I)

def scarica(url, timeout=20):
    """Ritorna (stato, html, secondi, byte, errore, url_finale)."""
    t0 = time.time()
    req = urllib.request.Request(url, headers={"User-Agent": UA_MOB, "Accept-Language": "it-IT,it;q=0.9"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read(2_500_000)
            return r.status, raw.decode("utf-8", "ignore"), round(time.time()-t0, 2), len(raw), None, r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, "", round(time.time()-t0, 2), 0, f"HTTP {e.code}", url
    except urllib.error.URLError as e:
        return None, "", round(time.time()-t0, 2), 0, f"{type(e.reason).__name__}: {e.reason}", url
    except (socket.timeout, TimeoutError):
        return None, "", timeout, 0, "timeout: nessuna risposta entro 20s", url
    except Exception as e:
        return None, "", round(time.time()-t0, 2), 0, f"{type(e).__name__}: {e}", url

def cert_scadenza(host):
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((host, 443), timeout=10) as s:
            with ctx.wrap_socket(s, server_hostname=host) as ss:
                fine = ss.getpeercert()["notAfter"]
                return datetime.datetime.strptime(fine, "%b %d %H:%M:%S %Y %Z"), None
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"

def analizza(az):
    url = az["sito_dichiarato"]
    r = {"nome": az["nome"], "categoria": az["categoria"], "telefono": az["telefono"],
         "indirizzo": az["indirizzo"], "email_pg": az["email"], "sito": url, "problemi": [], "email_sito": []}

    if not url:
        r["verdetto"] = "senza_sito"; r["problemi"].append("Nessun sito indicato su PagineGialle")
        return r
    if SOCIAL.search(url):
        r["verdetto"] = "senza_sito"
        r["problemi"].append(f"Come sito è indicata solo una pagina social: {url}")
        return r

    host = re.sub(r"^https?://", "", url).split("/")[0]
    stato, h, sec, byte, err, finale = scarica(url)

    # --- non raggiungibile ---
    if err or not h:
        r["verdetto"] = "sito_down"
        if err and "NameError" in err or (err and "gaierror" in err):
            r["problemi"].append("Il dominio non risolve più: il sito non esiste più in rete")
        elif err and "timeout" in err.lower():
            r["problemi"].append("Il sito non risponde entro 20 secondi: per un visitatore è come se fosse spento")
        elif stato:
            r["problemi"].append(f"Il sito risponde con errore HTTP {stato}")
        else:
            r["problemi"].append(f"Il sito non si apre ({err})")
        r["errore"] = err; r["stato_http"] = stato
        return r

    r["stato_http"] = stato; r["secondi"] = sec; r["peso_kb"] = round(byte/1024)
    testo = h.lower()

    # --- email presenti sul sito ---
    r["email_sito"] = sorted({e.lower() for e in re.findall(
        r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', h)
        if not re.search(r'(sentry|wixpress|example|\.png|\.jpg|\.webp|godaddy|sentry\.io)', e, re.I)})

    # --- HTTPS ---
    if url.startswith("http://") and not finale.startswith("https://"):
        r["problemi"].append("Il sito è ancora in HTTP: Chrome lo segnala come «Non sicuro» nella barra")
    scad, _ = cert_scadenza(host)
    if scad and scad < datetime.datetime.utcnow():
        r["problemi"].append(f"Il certificato di sicurezza è scaduto il {scad:%d/%m/%Y}: il browser mostra una schermata rossa prima del sito")

    # --- mobile ---
    if "name=\"viewport\"" not in testo and "name='viewport'" not in testo:
        r["problemi"].append("Il sito non ha le impostazioni per il telefono: da mobile esce fuori dallo schermo e bisogna zoomare")
    if "tel:" not in testo:
        r["problemi"].append("Il numero di telefono non è cliccabile da telefono: per chiamare bisogna copiarlo a mano")

    # --- peso e velocita' ---
    if sec > 4:
        r["problemi"].append(f"La home impiega {sec} secondi ad aprirsi da rete mobile")
    if byte > 3_000_000:
        r["problemi"].append(f"La home pesa {round(byte/1024/1024,1)} MB: su rete mobile si carica a pezzi")

    # --- segnali di sito fermo ---
    anni = [int(a) for a in re.findall(r'(?:©|&copy;|copyright)[^0-9]{0,20}(20[0-2][0-9])', h, re.I)]
    if anni:
        r["anno_copyright"] = max(anni)
        if max(anni) <= datetime.date.today().year - 2:
            r["problemi"].append(f"In fondo alle pagine c'è ancora scritto «{max(anni)}»: chi arriva non capisce se siete ancora aperti")
    if "flash" in testo and "swf" in testo:
        r["problemi"].append("Il sito usa Flash, tecnologia spenta da anni: quelle parti sono invisibili a chiunque")
    for cms, eta in [("wix", None), ("jimdo", None), ("altervista", None), ("webnode", None)]:
        if cms in testo[:6000]:
            r["cms"] = cms

    # --- contenuto vuoto ---
    solo_testo = re.sub(r'<[^>]+>', ' ', h)
    if len(solo_testo.split()) < 120:
        r["problemi"].append("La home ha pochissimo testo: Google non ha niente da leggere e non vi posiziona")

    # --- verdetto ---
    gravi_mobile = any("telefono" in p or "zoomare" in p for p in r["problemi"])
    lento = any("secondi" in p or "MB" in p for p in r["problemi"])
    if lento or gravi_mobile:
        r["verdetto"] = "sito_lento_mobile"
    elif r["problemi"]:
        r["verdetto"] = "sito_vecchio"
    else:
        r["verdetto"] = "ok"
    return r

aziende = json.loads(pathlib.Path("/tmp/out/aziende.json").read_text(encoding="utf-8"))
con_sito = [a for a in aziende if a["sito_dichiarato"]]
print(f"Audit di {len(con_sito)} siti...\n")

with ThreadPoolExecutor(max_workers=6) as ex:
    risultati = list(ex.map(analizza, con_sito))

pathlib.Path("/tmp/out/audit.json").write_text(json.dumps(risultati, ensure_ascii=False, indent=1), encoding="utf-8")

from collections import Counter
print(Counter(r["verdetto"] for r in risultati).most_common(), "\n")
for r in sorted(risultati, key=lambda x: -len(x["problemi"])):
    if r["verdetto"] == "ok": continue
    print(f"[{r['verdetto']:18}] {r['nome'][:44]:46} {r['sito'][:42]}")
    for p in r["problemi"][:3]: print(f"      · {p}")
    if r["email_sito"]: print(f"      @ {', '.join(r['email_sito'][:3])}")
