#!/usr/bin/env python3
"""Per ogni attività con email: trova il sito vero, o conferma che non esiste.

Il dominio dell'email lo rivela nella metà dei casi (info@nomeattivita.it).
Per gmail/libero/hotmail si cerca, e se non si trova nulla di credibile
il prospect diventa uno scenario 'senza_sito' — che va comunque confermato,
mai dato per scontato.
"""
import json, re, sys, time, urllib.request, urllib.parse, pathlib
from concurrent.futures import ThreadPoolExecutor

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
# caselle generiche: il dominio NON e' il sito dell'attivita'
LIBERE = re.compile(r'@(gmail|googlemail|yahoo|ymail|libero|hotmail|outlook|live|msn|alice|virgilio|'
    r'tiscali|qq|163|126|icloud|me|mac|aol|gmx|web|mail|email|inwind|iol|blu|tin|teletu|'
    r'fastwebnet|vodafone|tim|wind|infinito|katamail|supereva|inbox|protonmail|proton|'
    r'pec|legalmail|pecimprese|arubapec|postecert|cert)\.', re.I)
# portali e directory: non sono MAI il sito dell'attività
PORTALI = re.compile(r'(paginegialle|paginebianche|tuttocitta|virgilio|cylex|misterimprese|infoisinfo|'
    r'firmania|trova-aperto|oraridiapertura|sluurpy|tripadvisor|thefork|glovo|justeat|deliveroo|'
    r'facebook|instagram|linkedin|youtube|tiktok|booking|expedia|trivago|airbnb|yelp|google|'
    r'restaurantguru|piatti\.menu|menupizza|leggimenu|guida-aziende|europages|infobel|polomap|'
    r'wikipedia|touringclub|michelin|gustoegusti|ristoranti|subito|indeed|prontopro|'
    r'bing|duckduckgo|amazon|wordpress\.com|wixsite|blogspot|altervista)', re.I)

def get(u, t=18):
    try:
        r = urllib.request.Request(u, headers={"User-Agent": UA, "Accept-Language": "it-IT,it;q=0.9"})
        x = urllib.request.urlopen(r, timeout=t)
        return x.status, x.read(1_800_000).decode("utf-8", "ignore"), x.geturl()
    except Exception as e:
        return None, f"{type(e).__name__}: {e}", u

def vivo(dom):
    for u in (f"https://www.{dom}", f"https://{dom}"):
        st, h, fin = get(u)
        if st == 200 and len(h) > 400:
            return u, h
    return None, None

def parole(nome):
    return [w for w in re.split(r'[^a-z0-9]+', nome.lower())
            if len(w) > 3 and w not in ("ristorante","pizzeria","trattoria","osteria","bar","hotel",
                                        "albergo","parrucchiere","parrucchieri","centro","estetico",
                                        "della","delle","degli")]

def cerca_bing(nome, citta):
    q = f'"{nome}" {citta} sito ufficiale'
    st, h, _ = get("https://www.bing.com/search?q=" + urllib.parse.quote(q), t=20)
    if not h or st != 200: return []
    domini = []
    for u in re.findall(r'href="(https?://[^"]+)"', h):
        d = re.sub(r'^https?://(www\.)?', '', u).split('/')[0].lower()
        if PORTALI.search(d) or d.endswith(('.gov.it','.edu')) or len(d) < 5: continue
        if d not in domini: domini.append(d)
    return domini[:12]

def risolvi(az):
    nome, citta, mail = az["nome"], az["citta"], az["email"]
    az["sito"] = ""; az["come"] = ""

    if mail and not LIBERE.search(mail):
        dom = mail.split("@")[1].lower()
        if not PORTALI.search(dom):
            u, h = vivo(dom)
            if u:
                az["sito"] = u; az["come"] = "dominio dell'email"; az["_html"] = h
                return az

    chiavi = parole(nome)
    for d in cerca_bing(nome, citta):
        # accetta solo domini che contengono una parola del nome: niente accostamenti a caso
        if not any(k in d.replace("-", "") for k in chiavi): continue
        u, h = vivo(d)
        if u:
            az["sito"] = u; az["come"] = "ricerca"; az["_html"] = h
            return az
    az["come"] = "nessun sito trovato"
    time.sleep(0.5)
    return az

f = pathlib.Path("/tmp/out/tuttocitta.json")
aziende = [x for x in json.loads(f.read_text(encoding="utf-8")) if x.get("email")]
print(f"risolvo il sito per {len(aziende)} attività con email...\n")
with ThreadPoolExecutor(max_workers=4) as ex:
    out = list(ex.map(risolvi, aziende))

for o in out:
    o.pop("_html", None)
pathlib.Path("/tmp/out/con-sito.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
from collections import Counter
print(Counter(o["come"] for o in out).most_common())
for o in out:
    print(f"  {o['citta'][:14]:16}{o['nome'][:30]:32} {o['sito'][:42]:44} {o['come']}")
