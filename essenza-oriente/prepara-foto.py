#!/usr/bin/env python3
"""
Prepara le foto del sito a partire dai JPG originali in foto/:
  python3 prepara-foto.py
Quando arrivano le nuove foto, basta sostituire i JPG mantenendo gli
stessi nomi file e rilanciare questo script: rigenera i WebP e il
ritaglio 4:3 della foto hero per mobile. Richiede Pillow.
"""
import os
from PIL import Image

QUI = os.path.dirname(os.path.abspath(__file__))
FOTO = os.path.join(QUI, 'foto')
TRATTAMENTI = ['massaggio-oli-essenziali', 'tuina-shiatsu', 'massaggio-spa', 'riflessologia-plantare',
               'coppettazione', 'gua-sha', 'pulizia-orecchie', 'pedicure']

def salva_webp(im, nome, maxw, q=78):
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    dest = os.path.join(FOTO, nome)
    im.save(dest, 'WEBP', quality=q, method=6)
    print(f'{nome}: {im.width}x{im.height}, {os.path.getsize(dest) // 1024} KB')
    return im

def apri(nome):
    return Image.open(os.path.join(FOTO, nome)).convert('RGB')

# hero desktop (16:9 originale)
salva_webp(apri('sfondo-prenota.jpg'), 'sfondo-prenota.webp', 1376)

# hero mobile: ritaglio 4:3 della foto verticale, centrato sul soggetto
v = apri('sfondo-prenota-verticale.jpg')
h = round(v.width * 3 / 4)
top = round((v.height - h) * 0.58)   # il lettino e la candela sono nella metà bassa
m = v.crop((0, top, v.width, top + h))
m = m.resize((820, 615), Image.LANCZOS)
m.save(os.path.join(FOTO, 'sfondo-prenota-mobile.jpg'), 'JPEG', quality=82, optimize=True, progressive=True)
salva_webp(m, 'sfondo-prenota-mobile.webp', 820, 76)

# pagine trattamento
for t in TRATTAMENTI:
    salva_webp(apri(f'tratt-{t}.jpg'), f'tratt-{t}.webp', 1200)
