/* =============================================================
   ARABESQUE BUSALLA — catalogo (fonte dati unica)
   Usato da index.html, donna/uomo/curvy.html, prodotto.html,
   checkout.js e, lato server, da api/stripe-webhook.js.

   TODO-CLIENTE: nomi, prezzi e marchi vanno sostituiti con il
   listino reale del negozio. Il campo "brand" è volutamente
   impostato su "Selezione Arabesque": inserire i marchi trattati
   solo quando confermati dal cliente.

   FOTO: ogni prodotto cerca foto/<slug>-1.webp, -2.webp, -3.webp.
   Finché il file non esiste, la card mostra automaticamente il
   riquadro editoriale di cortesia (nessuna immagine rotta).
   ============================================================= */

/* scala taglie completa della boutique: dalla XS alla 6XL */
var ARB_SCALA = ['XS','S','M','L','XL','2XL','3XL','4XL','5XL','6XL'];

/* costruisce l'elenco taglie: T([['S',4],['M',2]]) */
function T(lista) {
  return lista.map(function (x) { return { id: x[0], stock: x[1] }; });
}

/* spedizione: gratuita sopra soglia, altrimenti tariffa unica.
   Il ritiro in negozio a Busalla è sempre gratuito. */
var ARB_SPEDIZIONE = { costo: 6.9, soglia: 79, contrassegno: 4 };

var ARB_PRODOTTI = [

  /* ---------------- DONNA ---------------- */
  {
    slug: 'cappotto-milano',
    nome: 'Cappotto doppiopetto Milano',
    categoria: 'donna', sottocategoria: 'capispalla',
    linea: ['novita'],
    prezzo: 189, sconto: 20,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Cammello', hex: '#B08D57' }],
    taglie: T([['XS',2],['S',4],['M',5],['L',4],['XL',3],['2XL',2],['3XL',1]]),
    materiali: 'Lana 70%, poliestere 25%, altre fibre 5%',
    vestibilita: 'Regolare — porta la tua taglia abituale',
    descrizione: 'Il capospalla che chiude ogni outfit. Doppiopetto classico, revers ampio, tasche a filetto e fodera interna in raso. Cade dritto sul fianco senza segnare: il taglio che sta bene davvero a tutte le corporature.'
  },
  {
    slug: 'blazer-notte',
    nome: 'Blazer sartoriale Notte',
    categoria: 'donna', sottocategoria: 'giacche',
    linea: [],
    prezzo: 129,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }],
    taglie: T([['XS',2],['S',3],['M',4],['L',3],['XL',2],['2XL',2]]),
    materiali: 'Poliestere 64%, viscosa 32%, elastan 4%',
    vestibilita: 'Aderente in vita — se sei tra due taglie, prendi la più grande',
    descrizione: 'Monopetto con un bottone, spalla morbida e pince frontali. Il nero assoluto che funziona in ufficio la mattina e a cena la sera.'
  },
  {
    slug: 'abito-plisse',
    nome: 'Abito midi plissé',
    categoria: 'donna', sottocategoria: 'abiti',
    linea: ['novita'],
    prezzo: 98, sconto: 15,
    colori: [{ nome: 'Bordeaux', hex: '#5E2028' }, { nome: 'Nero', hex: '#0B0B0C' }],
    taglie: T([['XS',1],['S',3],['M',4],['L',3],['XL',2]]),
    materiali: 'Poliestere 100%',
    vestibilita: 'Morbida, con elastico in vita',
    descrizione: 'Plissé fine che si muove a ogni passo, scollo a V e manica lunga. Lunghezza midi: quella che allunga la figura senza chiedere il tacco alto.'
  },
  {
    slug: 'dolcevita-cashmere',
    nome: 'Dolcevita misto cashmere',
    categoria: 'donna', sottocategoria: 'maglieria',
    linea: [],
    prezzo: 69,
    colori: [{ nome: 'Panna', hex: '#E8E2D5' }, { nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Grigio', hex: '#7A7A80' }],
    taglie: T([['XS',3],['S',5],['M',6],['L',5],['XL',4],['2XL',3]]),
    materiali: 'Viscosa 60%, poliammide 30%, cashmere 10%',
    vestibilita: 'Regolare, non stringe sul collo',
    descrizione: 'Il basico che si indossa da ottobre a marzo. Filato morbidissimo, collo alto che non graffia, polsini a costine.'
  },
  {
    slug: 'camicia-seta',
    nome: 'Camicia effetto seta',
    categoria: 'donna', sottocategoria: 'camicie',
    linea: [],
    prezzo: 79, sconto: 20,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Avorio', hex: '#EDE6D8' }],
    taglie: T([['XS',2],['S',4],['M',4],['L',3],['XL',3],['2XL',2],['3XL',1]]),
    materiali: 'Viscosa 100%',
    vestibilita: 'Morbida, leggermente oversize',
    descrizione: 'Colletto classico e caduta fluida. Dentro i pantaloni o fuori, cambia completamente registro: due outfit con un capo solo.'
  },
  {
    slug: 'jeans-vita-alta',
    nome: 'Jeans a vita alta',
    categoria: 'donna', sottocategoria: 'pantaloni',
    linea: [],
    prezzo: 59,
    colori: [{ nome: 'Denim scuro', hex: '#2B3A4F' }, { nome: 'Nero', hex: '#15151A' }],
    taglie: T([['XS',2],['S',4],['M',5],['L',4],['XL',3],['2XL',3],['3XL',2]]),
    materiali: 'Cotone 92%, poliestere 6%, elastan 2%',
    vestibilita: 'Elasticizzato, contiene senza stringere',
    descrizione: 'Vita alta che modella il punto vita, gamba dritta e denim pesante che tiene la forma anche dopo il lavaggio.'
  },
  {
    slug: 'gonna-pelle',
    nome: 'Gonna midi effetto pelle',
    categoria: 'donna', sottocategoria: 'gonne',
    linea: [],
    prezzo: 69,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }],
    taglie: T([['XS',1],['S',3],['M',3],['L',2],['XL',2],['2XL',1]]),
    materiali: 'Poliuretano 100%, fodera in poliestere',
    vestibilita: 'Aderente sui fianchi',
    descrizione: 'Effetto pelle opaco, spacco posteriore e vita elasticizzata nascosta. Con gli anfibi di giorno, con il tacco la sera.'
  },
  {
    slug: 'trench-levante',
    nome: 'Trench Levante',
    categoria: 'donna', sottocategoria: 'capispalla',
    linea: ['novita'],
    prezzo: 149,
    colori: [{ nome: 'Beige', hex: '#C4B49A' }, { nome: 'Nero', hex: '#0B0B0C' }],
    taglie: T([['S',2],['M',3],['L',3],['XL',2],['2XL',2]]),
    materiali: 'Cotone 65%, poliestere 35%',
    vestibilita: 'Regolare, cintura in vita regolabile',
    descrizione: 'Il classico impermeabile con doppio petto e martingala. Il capo giusto per le mezze stagioni liguri, quando piove al mattino e c\'è il sole alle quattro.'
  },
  {
    slug: 'blusa-stampa',
    nome: 'Blusa stampa floreale',
    categoria: 'donna', sottocategoria: 'camicie',
    linea: [],
    prezzo: 55, sconto: 25,
    colori: [{ nome: 'Blu notte', hex: '#1B2A47' }],
    taglie: T([['S',3],['M',4],['L',3],['XL',2],['2XL',2]]),
    materiali: 'Viscosa 95%, elastan 5%',
    vestibilita: 'Morbida',
    descrizione: 'Stampa piccola su fondo scuro, manica a tre quarti con volant discreto. Si lava in lavatrice e non chiede il ferro.'
  },
  {
    slug: 'abito-cerimonia',
    nome: 'Abito lungo da cerimonia',
    categoria: 'donna', sottocategoria: 'abiti',
    linea: ['cerimonia'],
    prezzo: 179,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Verde bosco', hex: '#28402F' }],
    taglie: T([['S',2],['M',2],['L',2],['XL',1],['2XL',1]]),
    materiali: 'Poliestere 88%, elastan 12%',
    vestibilita: 'Fascia il corpo, tessuto elasticizzato',
    descrizione: 'Lunghezza a terra, scollo a barca e drappeggio sul fianco che accompagna la figura. Per il matrimonio a cui non vuoi passare inosservata.'
  },

  /* ---------------- UOMO ---------------- */
  {
    slug: 'giubbotto-genova',
    nome: 'Giubbotto in pelle Genova',
    categoria: 'uomo', sottocategoria: 'capispalla',
    linea: ['novita'],
    prezzo: 249, sconto: 15,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Testa di moro', hex: '#3B2A20' }],
    taglie: T([['S',2],['M',3],['L',4],['XL',3],['2XL',2],['3XL',1]]),
    materiali: 'Pelle di agnello 100%, fodera in viscosa',
    vestibilita: 'Regolare, si ammorbidisce con l\'uso',
    descrizione: 'Pelle vera, zip centrale e due tasche verticali. Uno di quei capi che dopo due inverni sta meglio di quando l\'hai comprato.'
  },
  {
    slug: 'cappotto-lana-uomo',
    nome: 'Cappotto in lana monopetto',
    categoria: 'uomo', sottocategoria: 'capispalla',
    linea: [],
    prezzo: 199,
    colori: [{ nome: 'Grigio antracite', hex: '#3A3A40' }, { nome: 'Blu notte', hex: '#1B2436' }],
    taglie: T([['M',3],['L',4],['XL',3],['2XL',2],['3XL',2],['4XL',1]]),
    materiali: 'Lana 60%, poliestere 35%, altre fibre 5%',
    vestibilita: 'Regolare, sta sopra la giacca',
    descrizione: 'Lunghezza al ginocchio, revers a lancia e spacco posteriore. Il cappotto da mettere sopra il completo senza sembrare in divisa.'
  },
  {
    slug: 'camicia-oxford',
    nome: 'Camicia Oxford',
    categoria: 'uomo', sottocategoria: 'camicie',
    linea: [],
    prezzo: 59,
    colori: [{ nome: 'Bianco', hex: '#F0EDE6' }, { nome: 'Celeste', hex: '#A8C3D9' }],
    taglie: T([['S',3],['M',5],['L',6],['XL',5],['2XL',3],['3XL',2],['4XL',1]]),
    materiali: 'Cotone 100%',
    vestibilita: 'Regolare, non fascia',
    descrizione: 'Cotone Oxford pesante, collo button-down e taschino. Regge il ferro e gli anni, con la cravatta e senza.'
  },
  {
    slug: 'maglione-merino',
    nome: 'Maglione girocollo merino',
    categoria: 'uomo', sottocategoria: 'maglieria',
    linea: [],
    prezzo: 79, sconto: 20,
    colori: [{ nome: 'Blu', hex: '#22304A' }, { nome: 'Grigio', hex: '#6E6E75' }, { nome: 'Nero', hex: '#0B0B0C' }],
    taglie: T([['S',2],['M',4],['L',5],['XL',4],['2XL',3],['3XL',2]]),
    materiali: 'Lana merino 70%, acrilico 30%',
    vestibilita: 'Regolare',
    descrizione: 'Merino fine che non punge, si porta sulla camicia senza gonfiare. Il maglione che finisce in valigia ogni volta.'
  },
  {
    slug: 'chino-slim',
    nome: 'Pantalone chino',
    categoria: 'uomo', sottocategoria: 'pantaloni',
    linea: [],
    prezzo: 69,
    colori: [{ nome: 'Beige', hex: '#C2AE8E' }, { nome: 'Blu', hex: '#26334B' }, { nome: 'Nero', hex: '#15151A' }],
    taglie: T([['S',3],['M',4],['L',5],['XL',4],['2XL',3],['3XL',2]]),
    materiali: 'Cotone 97%, elastan 3%',
    vestibilita: 'Gamba dritta leggermente affusolata',
    descrizione: 'Cotone con un filo di elastan: comodo seduto, pulito in piedi. Dalla riunione all\'aperitivo senza cambiarsi.'
  },
  {
    slug: 'polo-pique',
    nome: 'Polo in piqué',
    categoria: 'uomo', sottocategoria: 'maglieria',
    linea: [],
    prezzo: 45,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Bianco', hex: '#F0EDE6' }, { nome: 'Verde', hex: '#2F4A3A' }],
    taglie: T([['S',4],['M',6],['L',6],['XL',5],['2XL',4],['3XL',3],['4XL',2]]),
    materiali: 'Cotone 100% piqué',
    vestibilita: 'Regolare',
    descrizione: 'Piqué compatto, colletto a costine che resta in piedi anche dopo il decimo lavaggio.'
  },
  {
    slug: 'giacca-destrutturata',
    nome: 'Giacca destrutturata',
    categoria: 'uomo', sottocategoria: 'giacche',
    linea: ['cerimonia'],
    prezzo: 159,
    colori: [{ nome: 'Blu notte', hex: '#1B2436' }, { nome: 'Grigio', hex: '#4A4A52' }],
    taglie: T([['M',2],['L',3],['XL',3],['2XL',2],['3XL',1]]),
    materiali: 'Lana 55%, poliestere 43%, elastan 2%',
    vestibilita: 'Regolare, spalla morbida',
    descrizione: 'Senza fodera e senza spalline: pesa la metà di una giacca classica e si porta come un cardigan.'
  },
  {
    slug: 'piumino-leggero',
    nome: 'Piumino leggero',
    categoria: 'uomo', sottocategoria: 'capispalla',
    linea: ['novita'],
    prezzo: 139, sconto: 20,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Verde militare', hex: '#3E4634' }],
    taglie: T([['M',3],['L',4],['XL',4],['2XL',3],['3XL',2],['4XL',1]]),
    materiali: 'Poliammide 100%, imbottitura in piuma riciclata',
    vestibilita: 'Regolare, si porta sotto il cappotto',
    descrizione: 'Si ripiega in una tasca, scalda come uno spesso e non fa volume sotto la giacca. Il capo da tenere in macchina tutto l\'inverno.'
  },

  /* ---------------- CURVY / TAGLIE CALIBRATE ---------------- */
  {
    slug: 'chemisier-curvy',
    nome: 'Abito chemisier curvy',
    categoria: 'donna', sottocategoria: 'abiti',
    linea: ['curvy'],
    prezzo: 89,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Blu notte', hex: '#1B2A47' }],
    taglie: T([['XL',3],['2XL',4],['3XL',4],['4XL',3],['5XL',2],['6XL',2]]),
    materiali: 'Viscosa 96%, elastan 4%',
    vestibilita: 'Morbida, cintura in vita regolabile',
    descrizione: 'Abito camicia con bottoni fino in fondo e cintura in tessuto: decidi tu dove segnare il punto vita. Tagliato sulle spalle e sui fianchi delle taglie calibrate, non è una taglia normale ingrandita.'
  },
  {
    slug: 'cardigan-lungo-curvy',
    nome: 'Cardigan lungo in maglia',
    categoria: 'donna', sottocategoria: 'maglieria',
    linea: ['curvy'],
    prezzo: 79, sconto: 15,
    colori: [{ nome: 'Grigio perla', hex: '#8C8C93' }, { nome: 'Nero', hex: '#0B0B0C' }],
    taglie: T([['XL',3],['2XL',4],['3XL',4],['4XL',3],['5XL',2],['6XL',1]]),
    materiali: 'Acrilico 70%, lana 30%',
    vestibilita: 'Oversize, si porta aperto',
    descrizione: 'Lungo fino a metà coscia, tasche applicate e maglia pesante che cade dritta. Il capo che risolve le giornate in cui non sai cosa mettere.'
  },
  {
    slug: 'camicia-oversize-curvy',
    nome: 'Camicia oversize in cotone',
    categoria: 'donna', sottocategoria: 'camicie',
    linea: ['curvy'],
    prezzo: 65,
    colori: [{ nome: 'Bianco', hex: '#F0EDE6' }, { nome: 'Celeste', hex: '#A8C3D9' }],
    taglie: T([['XL',4],['2XL',5],['3XL',4],['4XL',3],['5XL',2],['6XL',2]]),
    materiali: 'Cotone 100%',
    vestibilita: 'Oversize, spalla scesa',
    descrizione: 'Cotone pesante che non è trasparente — il dettaglio che chi porta una camicia bianca conosce bene. Spalla scesa e fondo arrotondato.'
  },
  {
    slug: 'palazzo-curvy',
    nome: 'Pantalone palazzo',
    categoria: 'donna', sottocategoria: 'pantaloni',
    linea: ['curvy'],
    prezzo: 69,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Verde bosco', hex: '#28402F' }],
    taglie: T([['XL',3],['2XL',4],['3XL',4],['4XL',3],['5XL',2],['6XL',2]]),
    materiali: 'Poliestere 92%, elastan 8%',
    vestibilita: 'Vita alta elasticizzata',
    descrizione: 'Gamba ampia che scende dritta dal fianco e vita alta completamente elasticizzata: comodo come un pantalone da casa, elegante come un capo da sera.'
  },
  {
    slug: 'cappotto-boucle-curvy',
    nome: 'Cappotto in bouclé',
    categoria: 'donna', sottocategoria: 'capispalla',
    linea: ['curvy','novita'],
    prezzo: 169,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Panna', hex: '#E8E2D5' }],
    taglie: T([['XL',2],['2XL',3],['3XL',3],['4XL',2],['5XL',1],['6XL',1]]),
    materiali: 'Poliestere 60%, acrilico 30%, lana 10%',
    vestibilita: 'Ampia, si porta sopra la maglia pesante',
    descrizione: 'Bouclé compatto, chiusura a un bottone e maniche piene. Struttura morbida che non irrigidisce la figura.'
  },
  {
    slug: 'tunica-curvy',
    nome: 'Tunica elegante',
    categoria: 'donna', sottocategoria: 'abiti',
    linea: ['curvy','cerimonia'],
    prezzo: 95,
    colori: [{ nome: 'Blu notte', hex: '#1B2A47' }, { nome: 'Nero', hex: '#0B0B0C' }],
    taglie: T([['XL',2],['2XL',3],['3XL',3],['4XL',2],['5XL',2],['6XL',1]]),
    materiali: 'Poliestere 95%, elastan 5%',
    vestibilita: 'Svasata sotto il petto',
    descrizione: 'Scollo a V profondo ma coperto, manica lunga e svasatura morbida sotto il petto. La soluzione per battesimi, comunioni e cene importanti.'
  },

  /* ---------------- ACCESSORI ---------------- */
  {
    slug: 'sciarpa-cashmere',
    nome: 'Sciarpa misto cashmere',
    categoria: 'accessori', sottocategoria: 'accessori',
    linea: [],
    prezzo: 45, tagliaUnica: true,
    colori: [{ nome: 'Grigio', hex: '#7A7A80' }, { nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Cammello', hex: '#B08D57' }],
    taglie: T([['Unica',12]]),
    materiali: 'Viscosa 70%, poliammide 20%, cashmere 10%',
    vestibilita: '180 × 60 cm',
    descrizione: 'Larga abbastanza da usarla come scialle sopra il cappotto. Il regalo che non sbaglia mai la taglia.'
  },
  {
    slug: 'borsa-spalla',
    nome: 'Borsa a spalla in pelle',
    categoria: 'accessori', sottocategoria: 'borse',
    linea: ['novita'],
    prezzo: 119, tagliaUnica: true,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Cuoio', hex: '#8A5A3B' }],
    taglie: T([['Unica',6]]),
    materiali: 'Pelle bovina 100%',
    vestibilita: '30 × 22 × 11 cm, tracolla regolabile',
    descrizione: 'Pelle vera con tre scomparti interni e tracolla regolabile: ci sta il portatile da 13 pollici senza deformarsi.'
  },
  {
    slug: 'cintura-fibbia',
    nome: 'Cintura in pelle',
    categoria: 'accessori', sottocategoria: 'accessori',
    linea: [],
    prezzo: 39, tagliaUnica: true,
    colori: [{ nome: 'Nero', hex: '#0B0B0C' }, { nome: 'Testa di moro', hex: '#3B2A20' }],
    taglie: T([['Unica',15]]),
    materiali: 'Pelle bovina 100%, fibbia in metallo',
    vestibilita: 'Accorciabile in negozio, gratis',
    descrizione: 'Pelle pieno fiore e fibbia satinata. La accorciamo noi in negozio sulla tua misura, senza costi aggiuntivi.'
  }
];

/* ---------------- funzioni di utilità ---------------- */

/* tutti i prodotti hanno lo stesso marchio finché il cliente non
   fornisce l'elenco reale dei brand trattati (TODO-CLIENTE) */
function arbBrand() { return 'Selezione Arabesque'; }

function arbProdotto(slug) {
  for (var i = 0; i < ARB_PRODOTTI.length; i++) {
    if (ARB_PRODOTTI[i].slug === slug) return ARB_PRODOTTI[i];
  }
  return null;
}

/* prezzo finale dopo lo sconto stagionale del prodotto */
function arbPrezzoFinale(prod) {
  if (!prod) return 0;
  return prod.sconto ? Math.round(prod.prezzo * (1 - prod.sconto / 100) * 100) / 100 : prod.prezzo;
}

function arbEuro(n) {
  return '€ ' + Number(n).toFixed(2).replace('.', ',').replace(',00', ',00');
}

/* disponibilità complessiva */
function arbStockTotale(prod) {
  if (!prod || !prod.taglie) return 0;
  return prod.taglie.reduce(function (t, x) { return t + (x.stock || 0); }, 0);
}
function arbDisponibile(prod) { return arbStockTotale(prod) > 0; }

/* range taglie mostrato sulla card: "XS – 3XL" */
function arbRangeTaglie(prod) {
  if (!prod || !prod.taglie || !prod.taglie.length) return '';
  if (prod.tagliaUnica) return 'Taglia unica';
  var ids = prod.taglie.map(function (t) { return t.id; });
  return ids[0] + ' – ' + ids[ids.length - 1];
}

/* percorsi foto attesi; se il file non esiste la card mostra il
   riquadro editoriale di cortesia (gestito in main.js) */
function arbFoto(prod, n) {
  return 'foto/' + prod.slug + '-' + (n || 1) + '.webp';
}

function arbFiltra(opzioni) {
  var o = opzioni || {};
  return ARB_PRODOTTI.filter(function (p) {
    if (o.categoria && p.categoria !== o.categoria) return false;
    if (o.linea && (p.linea || []).indexOf(o.linea) === -1) return false;
    if (o.sottocategoria && p.sottocategoria !== o.sottocategoria) return false;
    if (o.taglia && !p.taglie.some(function (t) { return t.id === o.taglia && t.stock > 0; })) return false;
    if (o.saldi && !p.sconto) return false;
    if (o.disponibili && !arbDisponibile(p)) return false;
    return true;
  });
}

/* usato da api/stripe-webhook.js lato server */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ARB_PRODOTTI: ARB_PRODOTTI, arbProdotto: arbProdotto, arbPrezzoFinale: arbPrezzoFinale, ARB_SPEDIZIONE: ARB_SPEDIZIONE };
}
