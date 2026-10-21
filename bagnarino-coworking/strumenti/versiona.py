#!/usr/bin/env python3
"""Aggiunge ?v=<impronta> ai file CSS e JS del sito nelle pagine HTML.

Perché: i browser tengono in memoria CSS e JS fino a un giorno. Senza
versione, dopo un aggiornamento il telefono può mostrare la pagina nuova
con lo stile vecchio (scrivanie nere, testi fuori posto).
L'impronta cambia solo quando cambia il file. Da lanciare prima di ogni
pubblicazione:  python3 strumenti/versiona.py
"""
import glob, hashlib, os, re

CARTELLA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def impronta(percorso):
    with open(os.path.join(CARTELLA, percorso.lstrip('/')), 'rb') as f:
        return hashlib.sha1(f.read()).hexdigest()[:8]

def sostituisci(m):
    attr, percorso = m.group(1), m.group(2)
    if not os.path.exists(os.path.join(CARTELLA, percorso.lstrip('/'))):
        return m.group(0)
    return '%s="%s?v=%s"' % (attr, percorso, impronta(percorso))

for pagina in glob.glob(os.path.join(CARTELLA, '*.html')):
    testo = open(pagina, encoding='utf-8').read()
    nuovo = re.sub(r'(href|src)="(/[\w\-/]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"', sostituisci, testo)
    if nuovo != testo:
        open(pagina, 'w', encoding='utf-8').write(nuovo)
        print('aggiornata', os.path.basename(pagina))
