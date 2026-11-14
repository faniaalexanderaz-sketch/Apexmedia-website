# Prompt riutilizzabile — video motion design Apex Media

Copia il blocco qui sotto in Claude Code (in questo repo) e cambia solo le parti tra [PARENTESI].
La parte del brand resta sempre uguale, così ogni video esce coerente.

```text
/hyperframes Crea un video motion design verticale 9:16 (1080x1920, 30 fps, [20] secondi)
per Apex Media, agenzia di performance marketing. Lingua: italiano.

ARGOMENTO: [es. "come un funnel trasforma il traffico in fatturato"]
MESSAGGIO UNICO (ciò che deve restare a fine video): [es. "Il fatturato non cresce con più traffico, ma con un funnel che converte"]
CTA FINALE: [es. "Richiedi l'audit gratuito →" + "link in bio"]

STILE (riferimento: showreel motion design veloce, tipo "Claude con 1 prompt"):
- cambio di scena ogni 3-4 s, qualcosa di nuovo ogni 2 s
- tipografia cinetica: parole che entrano una alla volta con blur 10px→0, mai fade+slide-up uguale ovunque
- i dati si muovono: griglie di punti, contatori che salgono, curve e barre che crescono
- transizioni con una causa (zoom dentro un oggetto, whip verso l'alto, l'oggetto diventa il logo)
- chiusura con il logo che "sbatte" sullo schermo + scintille

BRAND APEX MEDIA (non cambiare):
- sfondo #06080F con alone radiale viola #5A2EE6 al 20% in alto a destra
- testo #F5F5F7, secondario #AFAFBC
- oro #E7C568 / #F5E3A8 per numeri chiave, logo e CTA
- arancio #FF8A3C solo per "il problema" (es. "non sale")
- blu #1E4FD8 e viola #5A2EE6 per masse di dati (punti, barre)
- titoli: Inter 900; parola accento: Playfair Display italic 800 in oro
- logo: triangolo oro con triangolo pieno interno (SVG in /index.html) + wordmark APEXMEDIA

REGOLE:
- frame 0 = gancio già leggibile (è la copertina del Reel)
- testo solo tra y 168 e 1330 px (fuori dall'interfaccia di Instagram/TikTok)
- numeri dichiarati come "simulazione" se non sono dati reali di un cliente
- musica di sottofondo energica + whoosh sui tagli + impatto sul logo

Vai diretto senza storyboard, poi renderizza l'MP4.
```

## Struttura che funziona (usata in questo video)

| Tempo | Scena | Ruolo nel funnel del video |
| --- | --- | --- |
| 0–3 s | Gancio: domanda + problema visivo | ferma lo scroll |
| 3–7 s | Situazione: il dato che tutti guardano | identificazione |
| 7–12 s | Meccanismo: come funziona la soluzione | credibilità |
| 12–16 s | Risultato: numero che sale | desiderio |
| 16–21 s | Brand + promessa + CTA (tenuta ≥2 s) | azione |

## Varianti da testare (A/B sui Reels)

1. **Gancio**: "Il tuo fatturato è fermo?" vs "10.000 visite, 0 clienti?"
2. **CTA**: "Richiedi l'audit gratuito" vs "Scrivici AUDIT in DM"
3. **Durata**: 21 s vs 15 s (tagliando la scena "traffico")
