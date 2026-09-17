#!/usr/bin/env python3
"""Da una lista di attività con sito a prospect pronti: audit + email dal sito.

   python3 7-qualifica.py /tmp/out/pg.json

Tiene solo chi ha, insieme:
  - un'email trovata sul suo sito (mai indovinata)
  - almeno un problema verificato e citabile
"""
import json, re, sys, time, socket, urllib.request, urllib.error, pathlib, datetime
from concurrent.futures import ThreadPoolExecutor

UA_MOB = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
          "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
UA_PC  = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
SOCIAL = re.compile(r'(facebook\.com|instagram\.com|linktr\.ee|wa\.me|business\.site|tiktok\.com)', re.I)
CATENE = re.compile(r'(yves rocher|stroili|piadineria|original marines|mcdonald|burger king|'
    r'old wild west|roadhouse|autogrill|carrefour|conad|coop|lidl|eurospin|pandora|swarovski|'
    r'douglas|kiko|calzedonia|intimissimi|tezenis|ovs|upim|benetton|geox|scarpe&scarpe)', re.I)
SCARTA_MAIL = re.compile(r'(sentry|wixpress|example|godaddy|\.png|\.jpg|\.jpeg|\.webp|\.gif|\.svg|'
    r'jquery|@2x|domain\.com|yoursite|tuosito|noreply|no-reply|privacy@|dpo@|abuse@|postmaster@|'
    r'pixelarity|html5up|templatemo|bootstrap|wordpress|@sentry|webmaster@|hostinger|aruba\.it|'
    r'register\.it|siteground|cloudflare)', re.I)

def scarica(url, ua, timeout=18):
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept-Language": "it-IT,it;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read(3_000_000)
            return r.status, raw.decode("utf-8", "ignore"), round(time.time()-t0, 2), len(raw)
    except urllib.error.HTTPError as e:
        return e.code, "", round(time.time()-t0, 2), 0
    except Exception:
        return None, "", round(time.time()-t0, 2), 0

def dns_ok(url):
    try:
        socket.getaddrinfo(re.sub(r"^https?://", "", url).split("/")[0], 443); return True
    except Exception:
        return False

def mail_da(h):
    out = set()
    for e in re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}', h):
        e = e.lower().strip('.')
        if not SCARTA_MAIL.search(e) and 6 < len(e) < 55:
            out.add(e)
    return out

def qualifica(az):
    nome, url = az["nome"], az.get("sito_dichiarato", "")
    r = {"nome": nome, "citta": az.get("citta", ""), "telefono": az.get("telefono", ""),
         "indirizzo": az.get("indirizzo", ""), "categoria": az.get("categoria", ""),
         "sito": url, "email": "", "problemi": [], "scenario": "", "scarto": ""}

    if CATENE.search(nome):      r["scarto"] = "catena nazionale"; return r
    if not url:                  r["scarto"] = "nessun sito dichiarato"; return r
    if SOCIAL.search(url):       r["scarto"] = "solo pagina social (canale WhatsApp/visita)"; return r
    if not dns_ok(url):
        r["scenario"] = "sito_down"; r["scarto"] = "dominio morto, ma senza email non si scrive"
        r["problemi"] = ["Il dominio non risolve più: digitando l'indirizzo il browser dice che il sito non esiste"]
        return r

    testi = []
    for ua in (UA_MOB, UA_PC):
        st, h, sec, byte = scarica(url, ua)
        if h:
            testi.append((h, sec, byte))
            if st == 200: break
        time.sleep(0.6)
    if not testi:
        r["scarto"] = "non risponde: probabile anti-bot, va aperto a mano"; return r

    h, sec, byte = max(testi, key=lambda x: len(x[0]))
    t = h.lower()

    # --- email: prima la home, poi le pagine contatti ---
    mail = mail_da(h)
    if not mail:
        for p in ("/contatti", "/contatti.html", "/contatti.php", "/contact", "/chi-siamo",
                  "/dove-siamo", "/info", "/contatto", "/about"):
            st2, h2, _, _ = scarica(url.rstrip("/") + p, UA_PC, timeout=11)
            if h2:
                mail = mail_da(h2)
                if mail: break
            time.sleep(0.3)
    if not mail:
        r["scarto"] = "nessuna email sul sito"; return r

    dom = re.sub(r'^https?://(www\.)?', '', url).split('/')[0].lower()
    # preferenza: (1) casella sul dominio del sito, (2) casella che contiene il nome
    # dell'attivita', (3) prefisso da azienda. Mai la piu' corta a caso: su un sito
    # ci finisce anche la mail di chi l'ha fatto.
    chiavi = [w for w in re.split(r'[^a-z0-9]+', nome.lower()) if len(w) > 3]
    AZIENDALI = ("info", "contatti", "posta", "amministrazione", "prenotazioni",
                 "ristorante", "negozio", "segreteria", "ufficio", "commerciale")
    def rango(e):
        loc, host = e.split("@")
        return (0 if dom.endswith(host) else 1,
                0 if any(k in loc.replace(".", "") or k in host for k in chiavi) else 1,
                0 if loc.split(".")[0] in AZIENDALI else 1,
                len(e))
    ordinate = sorted(mail, key=rango)
    r["email"] = ordinate[0]
    r["email_alt"] = ordinate[1:4]

    # --- problemi verificati ---
    probs = []
    if not re.search(r'name=["\']viewport', t):
        probs.append("Il sito non ha l'impostazione per il telefono: da cellulare la pagina si apre in "
                     "versione da computer e bisogna allargare con le dita per leggere")
    if 'href="tel:' not in t:
        probs.append("Sul sito nessun numero è cliccabile: da telefono, per chiamarvi, il cliente deve "
                     "uscire dal sito e ricopiarlo a mano")
    if len(re.findall(r'@media', h)) == 0 and re.search(r'name=["\']viewport', t):
        probs.append("Il sito dichiara di adattarsi al telefono ma non ha nessuna regola per farlo: "
                     "sul cellulare resta la stessa pagina del computer, rimpicciolita")
    anni = [int(a) for a in re.findall(r'(?:©|&copy;|copyright)[^0-9]{0,25}(20[0-2][0-9])', h, re.I)]
    if anni and max(anni) <= datetime.date.today().year - 2:
        probs.append(f"In fondo alle pagine c'è ancora scritto «© {max(anni)}»: chi vi trova oggi "
                     f"si chiede se siete ancora aperti")
    if byte > 2_500_000:
        probs.append(f"La home pesa {round(byte/1024/1024,1)} MB: su rete mobile si carica a pezzi")
    elif sec > 5:
        probs.append(f"La home impiega {sec} secondi ad aprirsi da rete mobile")
    n_parole = len(re.sub(r'<[^>]+>', ' ', h).split())
    if n_parole < 130:
        probs.append(f"La home ha {n_parole} parole in tutto: non dice gli orari, non dice come "
                     f"prenotare, e Google non ha quasi niente da leggere")
    if re.search(r'\.swf|shockwave', t):
        probs.append("Il sito usa Flash, spento dal 2020: quelle parti oggi sono invisibili a tutti")

    r["problemi"] = probs
    r["peso_kb"] = round(byte/1024); r["secondi"] = sec; r["parole"] = n_parole
    if not probs:
        r["scarto"] = "sito sano: non abbiamo niente di vero da dirgli"; return r
    r["scenario"] = ("sito_lento_mobile" if any("telefono" in p or "dita" in p or "MB" in p or "secondi" in p
                                                for p in probs) else "sito_vecchio")
    return r

src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/out/pg.json")
aziende = json.loads(src.read_text(encoding="utf-8"))
con_sito = [a for a in aziende if a.get("sito_dichiarato")]
# dedup per dominio
visti = {}
for a in con_sito:
    k = re.sub(r'^https?://(www\.)?', '', a["sito_dichiarato"]).rstrip('/').lower()
    visti.setdefault(k, a)
con_sito = list(visti.values())
print(f"qualifico {len(con_sito)} siti unici...\n")

with ThreadPoolExecutor(max_workers=5) as ex:
    res = list(ex.map(qualifica, con_sito))

pronti = [r for r in res if r["email"] and r["problemi"] and not r["scarto"]]
pathlib.Path("/tmp/out/qualificati.json").write_text(
    json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")

from collections import Counter
print("SCARTI:", Counter(r["scarto"] for r in res if r["scarto"]).most_common(), "\n")
print(f"PRONTI: {len(pronti)}\n")
for p in sorted(pronti, key=lambda x: -len(x["problemi"])):
    print(f"  [{p['scenario']:17}] {p['citta'][:12]:14}{p['nome'][:30]:32} {p['email'][:34]:36} {len(p['problemi'])} problemi")
