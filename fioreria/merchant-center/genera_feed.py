#!/usr/bin/env python3
"""
Feed Google Merchant Center — Antica Fioreria del Centro
=========================================================
Genera il feed dai dati di prodotti.js (fonte unica): prezzi, foto e link
del feed sono sempre uguali a quelli delle pagine prodotto.

Uso (dalla cartella fioreria/):
    python3 merchant-center/genera_feed.py

Scrive:
    merchant-center/feed-google.xml   -> da collegare in Merchant Center come
                                         "recupero pianificato" (URL sotto)
    merchant-center/feed-prodotti-merchant-center.xlsx  -> stessa cosa in tabella

Regole:
- price = prezzo della taglia più economica; il link apre la scheda con quella
  taglia già selezionata (&taglia=...), così il prezzo all'arrivo è identico.
- sale_price solo se il prodotto ha un campo "sconto" vero in prodotti.js.
- Foto di Natale: se esiste foto/natale-<slug>.jpg diventa la foto principale
  del feed (le foto attuali restano come foto aggiuntive).
- I prodotti in FUORI_STAGIONE restano sul sito ma escono dal feed.
"""
import json
import os
import subprocess
from xml.sax.saxutils import escape

BASE = 'https://anticafioreriadelcentro.it/'
QUI = os.path.dirname(os.path.abspath(__file__))
SITO = os.path.dirname(QUI)
SOGLIA_SPEDIZIONE_GRATIS = 99

# primavera/estate/autunno: fuori dal feed durante la campagna di Natale
FUORI_STAGIONE = {
    'provenza', 'cesta-primavera', 'cesta-maggio', 'orto', 'sole-campagna',
    'sole-agrumi', 'cappello-fiorito', 'girasoli-cannella', 'autunno-in-tavola',
    'casetta-welcome', 'malva-lavanda', 'dame-fiorite', 'borsa-lavanda',
    'anfora-sole', 'anfora-girasoli', 'trionfo-agrumi', 'nuvola-di-petali',
    'coroncina-autunno', 'brocca-maggio', 'nodo-girasoli', 'brezza-conchiglie',
}
DECORAZIONI_NON_FLOREALI = {'orto', 'gatto-giardiniere', 'pinguino-panda'}


def catalogo():
    js = ("const c=require(process.argv[1]);"
          "process.stdout.write(JSON.stringify({p:c.AFC_PRODOTTI,t:c.AFC_TAGLIE}))")
    out = subprocess.check_output(['node', '-e', js, os.path.join(SITO, 'prodotti.js')])
    d = json.loads(out)
    return d['p'], d['t']


def prezzi_taglie(p, taglie_std):
    """[(id_taglia, prezzo pieno)] — stessa logica di prodotto.js"""
    if p.get('tagliaUnica'):
        return [(None, p['prezzo'])]
    lista = p.get('taglie') or taglie_std
    out = []
    for t in lista:
        prezzo = t['prezzo'] if t.get('prezzo') is not None else round(p['prezzo'] * t['fattore'] + 1e-9)
        out.append((t['id'], prezzo))
    return out


def scontato(prezzo, p):
    s = p.get('sconto')
    return round(prezzo * (1 - s / 100) + 1e-9) if s else prezzo


def spedizione(p, taglia_id, prezzo_finale):
    if p.get('spedizioneFissa'):
        return p['spedizioneFissa']
    if prezzo_finale >= SOGLIA_SPEDIZIONE_GRATIS:
        return 0
    if taglia_id in ('L', 'XL', '2') or (taglia_id is None and p.get('spedizioneTier') == 'lxl'):
        return 15
    return 12


def taglia_corta(testo, n):
    if len(testo) <= n:
        return testo
    return testo[:n].rsplit(' ', 1)[0].rstrip(',;:—- ')


def righe():
    prodotti, taglie_std = catalogo()
    out = []
    for p in prodotti:
        if p['slug'] in FUORI_STAGIONE:
            continue
        tp = prezzi_taglie(p, taglie_std)
        tid, pieno = min(tp, key=lambda x: scontato(x[1], p))
        finale = scontato(pieno, p)
        link = BASE + 'prodotto.html?p=' + p['slug']
        if tid is not None and len(tp) > 1:
            link += '&taglia=' + tid
        natale = 'natale' in p['cat']
        tipo = 'Decorazione artificiale' if p['slug'] in DECORAZIONI_NON_FLOREALI else 'Composizione floreale artificiale fatta a mano'
        if natale:
            frase = p.get('seoNatale') or 'composizione floreale natalizia fatta a mano'
            titolo = p['nome'] + ' — ' + frase[0].upper() + frase[1:]
            if p['slug'] not in DECORAZIONI_NON_FLOREALI:
                titolo += ', fiori artificiali'
            if 'regalo' not in frase:
                titolo += ', idea regalo di Natale'
        else:
            titolo = p['nome'] + ' — ' + tipo
        completo = titolo + ' | ' + p['desc'].rstrip('.')
        # la descrizione breve entra nel titolo solo se ci sta tutta (niente frasi tronche)
        titolo = completo if len(completo) <= 150 else taglia_corta(titolo, 150)
        foto = [p['foto']] + [f for f in (p.get('galleria') or []) if f != p['foto']]
        foto_natale = 'foto/natale-' + p['slug'] + '.jpg'
        if os.path.exists(os.path.join(SITO, foto_natale)):
            foto = [foto_natale] + foto
        out.append({
            'id': p['slug'],
            'title': titolo,
            'description': p['descLunga'] + (' Composizione natalizia fatta a mano, perfetta come addobbo di Natale o idea regalo: confezione regalo natalizia e biglietto scritto a mano in omaggio.' if natale else ''),
            'link': link,
            'image_link': BASE + foto[0],
            'additional_image_link': ','.join(BASE + f for f in foto[1:10]),
            'availability': 'in stock',
            'price': '%d.00 EUR' % pieno,
            'sale_price': ('%d.00 EUR' % finale) if finale != pieno else '',
            'brand': 'Antica Fioreria del Centro',
            'condition': 'new',
            'identifier_exists': 'no',
            'google_product_category': 'Casa e giardino > Decorazioni > Fiori artificiali',
            'product_type': ('Addobbi natalizi > Composizioni floreali natalizie > ' if natale else 'Decorazioni per la casa > ') + p['nome'],
            'shipping': 'IT:::%d.00 EUR' % spedizione(p, tid, finale),
            'custom_label_0': 'natale' if natale else 'tutto-l-anno',
            'custom_label_1': 'sopra-99' if finale >= SOGLIA_SPEDIZIONE_GRATIS else 'sotto-99',
        })
    return out


CAMPI = ['id', 'title', 'description', 'link', 'image_link', 'additional_image_link',
         'availability', 'price', 'sale_price', 'brand', 'condition', 'identifier_exists',
         'google_product_category', 'product_type', 'shipping', 'custom_label_0', 'custom_label_1']


def scrivi_xml(rr):
    x = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">', '<channel>',
         '<title>Antica Fioreria del Centro</title>', '<link>' + BASE + '</link>',
         '<description>Composizioni floreali artificiali fatte a mano</description>']
    for r in rr:
        x.append('<item>')
        for c in CAMPI:
            v = r[c]
            if not v:
                continue
            if c == 'shipping':
                paese, _, _, prezzo = v.split(':')
                x.append('  <g:shipping><g:country>%s</g:country><g:price>%s</g:price></g:shipping>' % (paese, prezzo))
            elif c == 'additional_image_link':
                for u in v.split(','):
                    x.append('  <g:additional_image_link>%s</g:additional_image_link>' % escape(u))
            else:
                x.append('  <g:%s>%s</g:%s>' % (c, escape(v), c))
        x.append('</item>')
    x += ['</channel>', '</rss>', '']
    with open(os.path.join(QUI, 'feed-google.xml'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(x))


LEGGIMI = """Feed prodotti — Antica Fioreria del Centro (campagna di Natale 2026)

Questo file e feed-google.xml sono generati da prodotti.js con:
    python3 merchant-center/genera_feed.py
Non modificarli a mano: cambia prodotti.js e rigenera.

COLLEGAMENTO CONSIGLIATO (niente copia-incolla):
1. merchantcenter.google.com > Prodotti > Origini dati > Aggiungi origine prodotto.
2. Scegli "Aggiungi prodotti da un file" > "Inserisci un link al file".
3. URL: https://anticafioreriadelcentro.it/merchant-center/feed-google.xml
4. Frequenza: ogni giorno. Merchant Center rilegge da solo il feed aggiornato.
5. Disattiva/elimina la vecchia origine (foglio Google copiato a mano), altrimenti
   restano online anche i prodotti fuori stagione con i vecchi prezzi scontati.

COME SONO CALCOLATI I DATI
price: prezzo della taglia più economica. Il link apre la scheda con quella
   taglia già selezionata (&taglia=S ecc.), quindi il prezzo che Google vede
   sulla pagina è identico a quello del feed. Il vecchio URL senza &taglia
   continua a funzionare per gli annunci già attivi.
sale_price: vuoto. I Saldi Estivi sono stati tolti dal sito il 26/11/2026.
shipping: 12 EUR (S/M) o 15 EUR (L/XL); 0 EUR se il prodotto da solo supera
   99 EUR (spedizione gratuita sul sito); bonsai 50 EUR fissi.
custom_label_0: "natale" per la collezione di Natale, utile per dividere le
   campagne/gruppi in Google Ads. custom_label_1: sopra/sotto 99 EUR.
availability: "in stock" per tutti: verifica le scorte prima di avviare.
Prodotti fuori stagione (primavera/estate/autunno): restano sul sito ma
   non sono nel feed. L'elenco è FUORI_STAGIONE in genera_feed.py.
Foto di Natale: se in foto/ c'è natale-<slug>.jpg diventa la foto principale.
"""


def scrivi_xlsx(rr):
    import openpyxl
    from openpyxl.styles import Font
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Leggimi'
    for riga in LEGGIMI.split('\n'):
        ws.append([riga])
    ws['A1'].font = Font(bold=True, size=13)
    ws.column_dimensions['A'].width = 110
    f = wb.create_sheet('Feed')
    f.append(CAMPI)
    for c in f[1]:
        c.font = Font(bold=True)
    for r in rr:
        f.append([r[c] for c in CAMPI])
    for col, w in zip('ABCDEFGHIJKLMNOPQ', [20, 60, 60, 55, 50, 50, 10, 12, 12, 24, 9, 9, 40, 40, 16, 14, 12]):
        f.column_dimensions[col].width = w
    f.freeze_panes = 'B2'
    wb.save(os.path.join(QUI, 'feed-prodotti-merchant-center.xlsx'))


if __name__ == '__main__':
    rr = righe()
    scrivi_xml(rr)
    scrivi_xlsx(rr)
    print('%d prodotti nel feed' % len(rr))
    for r in rr:
        print('  %-22s %-10s %s' % (r['id'], r['price'], r['link'].split('?')[1]))
