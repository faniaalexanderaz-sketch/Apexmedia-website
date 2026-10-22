# Tredicesimo giro – 22/10/2026: solo Alessandria città. 50 attività mai contattate (controllo Gmail e registro).
# Problemi verificati con Playwright (iPhone 13), curl e DNS. Dati: tredicesimo_giro_dati.json
# Formato M: (i, nome, email, tu, oggetto, titolo, saluto, apertura, frase_personalizzata, scena, tre_cose)
import json,os,re
H=os.path.dirname(os.path.abspath(__file__))
T=json.load(open(os.path.join(H,'tre_cose_per_categoria.json')))
T.update({
 'coop':"Le cooperative che lavorano meglio stanno facendo tre cose: servizi spiegati in modo semplice dal telefono, una richiesta di informazioni in pochi tocchi, e i progetti realizzati raccontati con foto e numeri.",
 'vino':"Le cantine che lavorano meglio stanno facendo tre cose: vini e degustazioni presentati con foto leggere e veloci dal telefono, la prenotazione della visita in pochi tocchi, e lo shop online con la spedizione chiara.",
 'cinema':"I cinema che lavorano meglio stanno facendo tre cose: la programmazione aggiornata e leggibile dal telefono, l'acquisto del biglietto in pochi tocchi, e un sito sicuro, senza avvisi del browser.",
 'trasp':"Le aziende di trasporto e logistica che lavorano meglio stanno facendo tre cose: servizi e zone coperte chiari dal telefono, la richiesta di preventivo in pochi tocchi, e la chiamata diretta con un solo tocco.",
 'scuolag':"Le autoscuole che lavorano meglio in zona stanno facendo tre cose: patenti, corsi e costi chiari dal telefono, l'iscrizione o la richiesta di informazioni in pochi tocchi, e le recensioni degli allievi in evidenza.",
 'giochi':"I negozi di giochi e fumetti che lavorano meglio stanno facendo tre cose: novità e disponibilità aggiornate dal telefono, la prenotazione di un articolo via WhatsApp, e gli eventi del negozio in evidenza.",
 'nautica':"Chi vende imbarcazioni con successo sta facendo tre cose: schede delle barche veloci da sfogliare dal telefono, la richiesta di informazioni su un'imbarcazione in un tocco, e la chiamata diretta al broker.",
 'tipo':"Le tipografie che lavorano meglio stanno facendo tre cose: prodotti e lavorazioni chiari dal telefono, la richiesta di preventivo con il file allegato in pochi tocchi, e i lavori realizzati in evidenza.",
 'sicur':"Le aziende di sicurezza che lavorano meglio in zona stanno facendo tre cose: un sito protetto e veloce dal telefono, la richiesta di sopralluogo in pochi tocchi, e i lavori realizzati in evidenza.",
 'caffe':"Le torrefazioni e i negozi di caffè che lavorano meglio stanno facendo tre cose: uno shop leggero e veloce dal telefono, il riordino delle capsule in pochi tocchi, e le recensioni dei clienti in evidenza.",
 'eventi':"Chi organizza matrimoni ed eventi con successo sta facendo tre cose: un portfolio leggibile dal telefono, la richiesta di disponibilità per una data in pochi tocchi, e le recensioni delle coppie in evidenza.",
 'tecno':"Le aziende tecniche che lavorano meglio stanno facendo tre cose: un sito veloce e protetto con i servizi chiari dal telefono, la richiesta di assistenza in pochi tocchi, e la chiamata diretta con un solo tocco.",
})
APP="Per attività come la vostra prepariamo anche un'app di prenotazione: chi vi sceglie prenota giorno e ora dal telefono, anche a negozio chiuso, e riceve il promemoria in automatico."
TOWN={'alessandria':'Alessandria','tortona':'Tortona','novi-ligure':'Novi Ligure','valenza':'Valenza','sale':'Sale','castellazzo-bormida':'Castellazzo Bormida','bosco-marengo':'Bosco Marengo','lu-e-cuccaro-monferrato':'Lu e Cuccaro Monferrato','solero':'Solero','cassine':'Cassine','san-salvatore-monferrato':'San Salvatore Monferrato','quattordio':'Quattordio','pietra-marazzi':'Pietra Marazzi','occimiano':'Occimiano','alluvioni-piovera':'Alluvioni Piovera','fubine-monferrato':'Fubine Monferrato','sezzadio':'Sezzadio','pecetto-di-valenza':'Pecetto di Valenza','conzano':'Conzano','pomaro-monferrato':'Pomaro Monferrato','oviglio':'Oviglio','frugarolo':'Frugarolo','masio':'Masio','bassignana':'Bassignana','quargnento':'Quargnento','bergamasco':'Bergamasco','castelnuovo-bormida':'Castelnuovo Bormida','casal-cermelli':'Casal Cermelli'}
N=["ho cercato e non ho trovato un vostro sito: negli elenchi online ci sono solo indirizzo e telefono.",
   "ho cercato con attenzione e un vostro sito non c'è: online risultano solo indirizzo e numero."]
# email -> (nome mostrato, chiave categoria, attore della scena, frase personale o None)
T.update({
 'legal':"Gli studi legali che lavorano meglio in città stanno facendo tre cose: aree di competenza spiegate in modo semplice dal telefono, la richiesta di un primo appuntamento in pochi tocchi, e un sito veloce che trasmette serietà fin dal primo secondo.",
 'hifi':"I negozi di alta fedeltà che lavorano meglio stanno facendo tre cose: un catalogo leggero e veloce da sfogliare dal telefono, la prenotazione di un ascolto in negozio in pochi tocchi, e le recensioni degli appassionati in evidenza.",
 'rsa':"Le residenze per anziani che lavorano meglio stanno facendo tre cose: un sito con il proprio nome ben visibile su Google, foto vere degli ambienti e dei servizi leggibili dal telefono, e la richiesta di una visita in pochi tocchi.",
 'trasl':"Le ditte di traslochi che lavorano meglio stanno facendo tre cose: un sito veloce dal telefono con i servizi chiari, la richiesta di sopralluogo o di preventivo con qualche foto, e le recensioni dei clienti in evidenza.",
 'infanzia':"Chi offre servizi per l'infanzia con successo sta facendo tre cose: centri estivi, orari e costi chiari dal telefono, l'iscrizione o la richiesta di informazioni in pochi tocchi, e le foto e le recensioni dei genitori in evidenza.",
 'spediz':"I centri spedizioni che lavorano meglio stanno facendo tre cose: servizi e tariffe chiari dal telefono, il preventivo di una spedizione in pochi tocchi, e orari e indirizzo sempre in evidenza.",
 'teatro':"I teatri che lavorano meglio stanno facendo tre cose: il cartellone sempre aggiornato e leggibile dal telefono, l'acquisto del biglietto in pochi tocchi, e il numero della biglietteria da toccare per chiamare.",
})
PB2={
 'legal':"Chi ha un problema legale cerca uno studio di cui fidarsi, e la prima impressione oggi nasce quasi sempre dal telefono.",
 'hifi':"Un appassionato di vinile e alta fedeltà confronta a lungo prima di scegliere, e sfoglia tutto dal telefono.",
 'rsa':"La scelta di una residenza per un genitore è una delle decisioni più delicate per una famiglia, e comincia quasi sempre da una ricerca su Google.",
 'trasl':"Un trasloco si organizza con poco preavviso, e chi lo cerca chiede preventivi a più ditte dal telefono.",
 'infanzia':"I genitori scelgono a chi affidare i figli con grande attenzione, e confrontano tutto dal telefono.",
 'spediz':"Chi deve spedire un pacco vuole sapere in fretta quanto costa e quando può passare.",
 'teatro':"Un teatro vive del pubblico della città, che oggi sceglie lo spettacolo e prenota dal telefono.",
 'bar':"Un locale si sceglie spesso all'ultimo momento, dal telefono, guardando foto e proposte.",
 'rev':"La revisione ha una scadenza precisa, e chi la deve fare cerca un centro vicino e prenota dal telefono.",
 'formaz':"Chi sceglie un corso confronta programmi e costi dal telefono, spesso la sera.",
}
D={
'info@spedisci24.it':("Spedisci24",'spediz',"chi deve spedire un pacco ad Alessandria e cerca dal telefono un centro spedizioni vicino",None),
'giuseppina.distefano@libero.it':("lo studio della dott.ssa Giuseppina Di Stefano",'medico',"chi soffre di dolori e cerca dal telefono un fisiatra o un agopuntore ad Alessandria","Agopuntura e ozonoterapia sono trattamenti che i pazienti cercano per nome, e scelgono chi sa spiegarli con chiarezza."),
'booking@hoteldiamantealessandria.it':("l'Hotel Diamante",'hotel',"chi arriva ad Alessandria per lavoro e cerca un hotel dal telefono, magari dal treno",None),
'parafarmacrova@gmail.com':("la Parafarmacia della dott.ssa Crova",'farm',"chi cerca un prodotto o un consiglio e controlla dal telefono la parafarmacia più vicina","Una parafarmacia con una farmacista sempre presente è un riferimento prezioso per il quartiere."),
'f.moscarino@centogrigio.it':("il Centogrigio Sport Village",'pal',"chi vuole prenotare un campo per la sera e apre il sito dal telefono","Campi, palestre, ristorante e centro benessere nello stesso posto: un centro così vive di prenotazioni fatte dal telefono."),
'info@labicoop.it':("Labì",'coop',"un'azienda che cerca dal telefono una cooperativa per un servizio di manutenzione o di ristorazione","Il lavoro di Labì, tra inserimenti lavorativi, ristorazione e manutenzione, merita di essere raccontato bene a chi può affidarvi un servizio."),
'info@kimonoporte.it':("Kimono Casa",'arred',"chi cerca una lampada o un complemento d'arredo e sfoglia lo shop dal telefono, la sera sul divano",None),
'farmaciadattrino@tauservices.com':("la Farmacia Dattrino",'farm',"chi cerca dal telefono una farmacia aperta vicino a casa",None),
'audiofidelity@audiofidelity.it':("Audio Fidelity",'hifi',"un appassionato che cerca un giradischi e sfoglia il catalogo dal telefono",None),
'info@duca-s.it':("Duca's",'parr',"chi cerca un parrucchiere ad Alessandria e vuole fissare un appuntamento dal telefono",None),
'info@officinamandirola.it':("l'Officina Mandirola",'auto',"chi ha l'auto ferma, o deve noleggiarne una, e cerca un'officina dal telefono","Dal 1981 tra ricambi, revisioni, carburatori e noleggio: un'esperienza così va resa facile da contattare."),
'gatto.sabrina@gmail.com':("la Cooperativa Sociale Bios",'coop',"una famiglia che cerca dal telefono un servizio socio-sanitario per un parente",None),
'didattica@modaalessandria.it':("l'Accademia Moda IMA",'formaz',"chi sogna di lavorare nella moda e cerca dal telefono una scuola ad Alessandria","Una scuola di moda e design parla a ragazzi che scelgono il proprio futuro, e lo scelgono dal telefono."),
'info@centroumanistico.com':("il Centro Umanistico",'medico',"chi cerca uno psicologo o un professionista della salute ad Alessandria, spesso in un momento delicato","Chi cerca un supporto psicologico ha bisogno di sentirsi accolto fin dal primo contatto."),
'info@passioneemergenza.it':("Passione Emergenza",'formaz',"un'azienda che deve formare il personale sul primo soccorso e cerca un ente dal telefono","I corsi di primo soccorso e di emergenza servono a tutte le aziende, che cercano chi li organizza in tempi brevi."),
'info@british-centre.it':("il British Centre",'formaz',"un genitore che cerca un corso di inglese per il figlio e confronta le scuole dal telefono",None),
'natytecnico@gmail.com':("Planet PC",'tecno',"chi ha il computer bloccato e cerca un tecnico ad Alessandria dal telefono","Da oltre 25 anni nell'assistenza: chi ha un computer fermo cerca proprio un tecnico di cui fidarsi, e in fretta."),
'info@pcgold.net':("Pc Gold",'tecno',"un ufficio con un problema al sistema informatico che cerca assistenza dal telefono",None),
'info@lab121.org':("Lab121",'b2b',"un professionista che cerca uno spazio di lavoro ad Alessandria e confronta le proposte dal telefono","Uno spazio di lavoro condiviso vive di professionisti che lo scoprono online e chiedono informazioni in pochi minuti."),
'obloviaggi@obloviaggi.it':("L'Oblò Viaggi",'viaggi',"chi sogna una vacanza e cerca dal telefono un'agenzia ad Alessandria",None),
'alessandria@residenzailplatano.it':("la Residenza Il Platano",'rsa',"una figlia che cerca su Google una residenza per la madre ad Alessandria",None),
'info@buildrock.group':("Buildrock",'edil',"chi deve riqualificare un edificio e cerca un'impresa dal telefono",None),
'info@spazio360al.it':("Spazio 360",'arred',"chi deve ristrutturare casa e cerca dal telefono chi segue tutto, dal progetto all'arredamento","Edilizia, progetto e arredamento chiavi in mano: è proprio ciò che cerca chi non vuole parlare con dieci ditte diverse."),
'info@securitydirect.it':("Alessandria Sicurezza",'sicur',"chi ha appena subito un tentato furto e cerca un antifurto dal telefono",None),
'pierrotraslochi@alice.it':("Pierro Traslochi",'trasl',"chi deve traslocare tra due settimane e chiede preventivi dal telefono","Dal 1969 ad Alessandria: un'esperienza così è un argomento fortissimo, se arriva in fretta a chi cerca."),
'preventivi@ecosismacostruzioni.it':("Eco Sisma",'edil',"chi vuole ristrutturare casa o mettere il fotovoltaico e cerca un'impresa dal telefono",None),
'info@alficodindiaalessandria.it':("Al Fico d'India",'rist',"chi ha voglia di cucina siciliana e cerca un ristorante ad Alessandria dal telefono",None),
'info@gehometrie.com':("Gehometrie",'edil',"chi deve ristrutturare o sistemare una pratica edilizia e cerca un riferimento dal telefono",None),
'info@matrelax.it':("Matrelax",'arred',"chi dorme male e cerca un materasso su misura ad Alessandria dal telefono","Un materasso progettato e realizzato su misura è un prodotto che si sceglie con calma, ma la ricerca parte sempre dal telefono."),
'info@ilgabbiano.coop':("la Cooperativa Il Gabbiano",'coop',"un ente o una famiglia che cerca dal telefono informazioni sulle vostre comunità",None),
'info@happychildrenservizi.com':("Happy Children",'infanzia',"un genitore che cerca un centro estivo o una babysitter ad Alessandria dal telefono",None),
'info@studiolegalegatti.com':("lo Studio Legale Gatti",'legal',"chi ha appena ricevuto un atto e cerca un avvocato ad Alessandria dal telefono",None),
'elettrautoboccaccio@hotmail.com':("l'Elettrauto Boccaccio",'auto',"chi ha la spia accesa sul cruscotto e cerca un elettrauto ad Alessandria dal telefono",None),
'centrorevisioned3@gmail.com':("il Centro Revisione D3",'rev',"chi ha la revisione in scadenza e cerca dal telefono un centro ad Alessandria",None),
'info@grassilinoleum.it':("Grassi Linoleum",'edil',"chi deve rifare un pavimento e cerca dal telefono una ditta specializzata","Dal 1951 nei pavimenti: una specializzazione così è un valore, se chi la cerca la trova in fretta."),
'info@venetaarredi.it':("Veneta Arredi",'arred',"chi sta progettando la cucina nuova e sfoglia i lavori dal telefono",None),
'autorimessamarengo@gmail.com':("la Nuova Autorimessa Marengo",'socc',"chi resta in panne in tangenziale e cerca un soccorso stradale dal telefono",None),
'info@lasartoriadeiviaggi.it':("La Sartoria dei Viaggi",'viaggi',"chi sogna un viaggio su misura e cerca un'agenzia ad Alessandria dal telefono","Un viaggio su misura si vende raccontandolo bene, e il racconto oggi comincia dal telefono."),
'info@autoplus24.it':("AutoPlus24",'conc',"chi cerca un'auto usata e sfoglia le offerte dal telefono la sera",None),
'info@rolandiauto.it':("Rolandi Auto",'conc',"chi sta valutando una BMW o una MINI e sfoglia le offerte dal telefono",None),
'info@movefitness.it':("Move Fitness",'pal',"chi vuole iniziare ad allenarsi e cerca una palestra ad Alessandria dal telefono",None),
'alrockcafe@tim.it':("l'Al Rock Café",'rist',"un gruppo di amici che decide dove andare a cena e cerca un locale dal telefono",None),
'cristina.guizzardi@outlook.com':("La Maison Esthétique",'est',"chi cerca un centro estetico ad Alessandria e vuole prenotare un trattamento dal telefono",None),
'leformestudio@gmail.com':("Le Forme Studio Estetico",'est',"chi cerca un centro estetico ad Alessandria e vuole prenotare un trattamento dal telefono",None),
'info@stranalandiaviaggi.it':("Stranalandia Viaggi",'viaggi',"chi sogna una vacanza e cerca dal telefono un'agenzia ad Alessandria",None),
'info@fotolagreca.com':("Foto La Greca",'foto',"una coppia che cerca un fotografo per il matrimonio e confronta i portfolio dal telefono",None),
'info@kitchenstreetbistro.it':("il Kitchen Street Bistrò",'rist',"chi cerca dove pranzare in centro ad Alessandria e apre il sito dal telefono",None),
'marconibistrot@gmail.com':("il Marconi Bistrot",'rist',"chi vuole prenotare un tavolo per la sera e apre il sito dal telefono",None),
'info@tivoliarredamenti.com':("Tivoli Arredi Design",'arred',"chi sta arredando casa e sfoglia i progetti dal telefono",None),
'marketing@teatroalessandrino.it':("il Teatro Alessandrino",'teatro',"chi vuole prenotare un posto per lo spettacolo di sabato e apre il sito dal telefono",None),
}

PB={  # frase personale di ripiego per categoria
 'edil':"Chi ristruttura sceglie l'impresa guardando i lavori già fatti, ed è lì che un'impresa seria fa la differenza.",
 'auto':"Chi ha l'auto ferma cerca qualcuno di cui fidarsi, e lo cerca quasi sempre dal telefono.",
 'idra':"Chi ha un guasto in casa cerca un tecnico in fretta, e sceglie chi riesce a contattare per primo.",
 'rist':"Un ristorante si sceglie spesso all'ultimo momento, dal telefono, guardando foto e menu.",
 'pizza':"Una pizza si sceglie spesso all'ultimo momento, dal telefono, mezz'ora prima di cena.",
 'viaggi':"Un viaggio si sogna a lungo, e la scelta dell'agenzia parte quasi sempre da uno sguardo al sito.",
 'imm':"Chi cerca casa guarda decine di annunci dal telefono, e contatta per prima l'agenzia che si legge meglio.",
 'conc':"Chi cerca un'auto sfoglia i modelli dal telefono per giorni, prima di passare in concessionaria.",
 'parr':"Chi sceglie un salone cerca qualcuno di cui fidarsi, e torna sempre dove si è trovato bene. "+APP,
 'est':"Chi sceglie un centro estetico cerca cura e attenzione, e torna sempre dove si è trovato bene. "+APP,
 'pal':"Chi inizia un corso decide spesso la sera, dal telefono, guardando orari e prezzi. "+APP,
 'ott':"Un paio di occhiali si sceglie con fiducia, e spesso la scelta del negozio parte dal telefono.",
 'pastic':"Una torta per un'occasione speciale si ordina spesso dal telefono, all'ultimo momento.",
 'alim':"Una bottega di quartiere vive dei clienti affezionati, e oggi anche loro cercano orari e novità dal telefono.",
 'foto':"Un fotografo si sceglie in pochi secondi, guardando le prime immagini: è la vetrina più diretta che esista.",
 'arred':"Un arredamento si sceglie con gli occhi: chi rinnova casa vuole vedere ambienti e materiali prima di entrare.",
 'gioi':"Un gioiello si sceglie con gli occhi e con la fiducia, e la scelta oggi parte spesso dal telefono.",
 'neg':"Un negozio di quartiere ha clienti affezionati, che prima di uscire vogliono sapere se trovano ciò che cercano.",
 'fiori':"Un mazzo di fiori si ordina spesso all'ultimo momento, dal telefono, per un'occasione da non mancare.",
 'tipo':"Chi cerca una tipografia vuole capire in fretta cosa si può stampare e quanto costa.",
 'sicur':"Chi pensa alla sicurezza della propria casa o azienda sceglie prima di tutto qualcuno di cui fidarsi.",
 'pulizie':"Pulizie e disinfestazioni si cercano spesso con urgenza, e chi risponde per primo vince.",
 'farm':"Una farmacia di fiducia è un punto di riferimento per tutto il quartiere.",
 'medico':"Chi deve prenotare una visita sceglie un centro di cui fidarsi, e lo cerca quasi sempre dal telefono.",
 'dent':"Chi cerca un dentista cerca prima di tutto fiducia, e la scelta parte spesso dal sito.",
 'gomme':"Il cambio gomme si prenota tutti nello stesso periodo, e chi risponde per primo lavora di più.",
 'moto':"Un motociclista sceglie l'officina con la stessa cura con cui sceglie la moto.",
 'coop':"Il lavoro di una cooperativa sociale merita di essere raccontato bene, a famiglie, scuole ed enti.",
 'giard':"Un giardino curato si sceglie guardando i lavori fatti, e la scelta parte spesso dal telefono.",
 'vetro':"Un vetro rotto è un'urgenza, e chi la ha cerca la vetreria più vicina dal telefono.",
 'bnb':"Chi viaggia sceglie dove dormire dal telefono, spesso all'ultimo momento.",
 'eventi':"Un evento importante si organizza con chi ispira fiducia fin dal primo sguardo.",
 'hotel':"Chi viaggia sceglie dove dormire dal telefono, e prenota dove riesce a farlo in fretta.",
 'tecno':"Un'azienda sceglie un fornitore tecnico dopo un primo contatto rapido e sicuro.",
 'cinema':"Il cinema si decide spesso all'ultimo momento, dal telefono.",
 'vino':"Un buon vino si sceglie anche dalla storia di chi lo produce.",
 'caffe':"Chi trova il proprio caffè lo riordina sempre, e vuole farlo in pochi tocchi.",
 'casa':"Chi sceglie per la propria casa vuole vedere bene prodotti e prezzi prima di uscire.",
 'ferr':"Chi ha un lavoro da fare in casa vuole sapere subito se trova ciò che gli serve.",
 'galleria':"Un collezionista sceglie con gli occhi, e oggi sfoglia le opere prima di tutto dal telefono.",
 'musica':"Un musicista sceglie lo strumento con passione, e confronta modelli e prezzi dal telefono.",
 'scuolag':"Chi deve prendere la patente sceglie l'autoscuola confrontando corsi e costi dal telefono.",
 'giochi':"Un negozio di giochi ha un pubblico appassionato, che cerca novità e disponibilità prima di uscire.",
 'nautica':"Una barca si sceglie con il cuore, ma la ricerca parte sempre dalle schede online.",
 'abb':"Un negozio di abbigliamento vive del consiglio personale, che nessun sito di vendita online può dare.",
 'calz':"Un buon paio di scarpe si sceglie con cura, e la ricerca oggi parte dal telefono.",
 'trasp':"Un'azienda sceglie un partner logistico dopo un primo contatto rapido e chiaro.",
 'socc':"Chi resta in panne cerca aiuto dal telefono, e chiama il primo numero che riesce a toccare.",
 'cane':"Chi ha un cane cerca qualcuno di cui fidarsi, e torna sempre dove l'animale si è trovato bene.",
 'anim':"Chi affida il proprio animale cerca qualcuno di cui fidarsi, e torna sempre dove si è trovato bene.",
 'libr':"Una libreria indipendente è un luogo che si sceglie con il cuore, e che oggi si scopre anche online.",
 'cart':"Una cartoleria di riferimento è preziosa per famiglie e uffici, soprattutto all'inizio della scuola.",
 'sanit':"Chi deve acquistare un ausilio cerca consiglio e competenza, spesso con urgenza.",
 'serr':"Le finestre nuove si scelgono guardando i lavori fatti, e con le bollette di oggi tanti le stanno valutando.",
 'b2b':"Un'azienda sceglie un fornitore dopo un primo contatto rapido e chiaro.",
 'elet':"Una competenza specifica è un vantaggio, ma solo se chi la cerca riesce a trovarla e contattarla.",
 'event':"Un luogo con una storia così si scopre spesso online, prima ancora di visitarlo.",
}
def site_of(x):
    return re.sub(r'^www\.','',(x['det'].get('site') or '').split('/')[0])
def mb(kb): v=kb/1000; return (f"{v:.0f}" if v>=10 else f"{v:.1f}".replace('.',','))+" MB"
def problem(x):
    c=x['code'];d=x['det'];s=site_of(x);t=(d.get('title') or '')
    NT=" e il numero è scritto come semplice testo: toccandolo non parte la chiamata" if d.get('notel') and d.get('ph') else (" e non c'è un numero da toccare per chiamare" if d.get('notel') else "")
    if c=='DEAD': return ("il sito indicato negli elenchi, "+s+", non si apre più: il dominio non risponde. L'ho verificato.", f"{s} non si apre più","Il sito indicato negli elenchi non si apre")
    if c=='BROKEN':
        if 'nginx' in t: m="mostra solo la pagina di prova del server, \"Welcome to nginx!\", al posto del vostro sito"
        elif 'WordPress' in t: m="mostra il messaggio \"Si è verificato un errore critico sul tuo sito web\""
        elif '520' in t: m="restituisce un errore del server (codice 520) al posto del vostro sito"
        elif 'SITE NOT FOUND' in t.upper(): m="mostra la scritta \"Site not found\" al posto del vostro sito"
        elif 'Archived' in t: m="mostra \"Archived web site\": il provider gratuito ha archiviato il sito"
        elif 'Wix' in t: m="mostra una pagina di Wix: \"This domain isn't connected to a site\""
        elif 'business.site' in s: m="restituisce \"Error 404\": Google ha chiuso i siti creati con il suo vecchio servizio gratuito"
        else: m="restituisce \"Error 404\""
        return (f"il sito indicato negli elenchi, {s}, {m}. L'ho verificato.", f"{s}: il sito non si vede più","Il sito mostra un errore al posto della vostra attività")
    if c=='DOWN': return (f"il sito indicato negli elenchi, {s}, non si apre: risponde con un errore del server. L'ho verificato.", f"{s} non si apre","Il sito non si apre")
    if c=='CERT': return (f"chi digita {s} nel browser trova l'avviso di sicurezza \"La connessione non è privata\" al posto del sito, perché il certificato non corrisponde al dominio. L'ho verificato.", f"{s}: \"La connessione non è privata\"","Il browser mostra un avviso di sicurezza")
    if c=='HTTPONLY': return (f"il sito {s} si apre solo senza connessione protetta, e il browser lo segnala come \"Non sicuro\". L'ho verificato.", f"{s}: \"Non sicuro\"","Il sito non ha la connessione protetta")
    if c=='SW': return (f"da telefono la pagina di {s} è più larga dello schermo e scivola di lato sotto il dito"+NT.replace(' e ',', e ',1)+". L'ho verificato da smartphone.", f"{s}: da telefono la pagina scivola di lato","Da telefono il sito è più largo dello schermo")
    if c=='OLD': return (f"su {s} il copyright in fondo alla pagina è fermo al {d['year']}"+NT+". L'ho verificato.", f"{s}: il sito è fermo al {d['year']}",f"Il sito risulta fermo al {d['year']}")
    if c=='WIP': return (f"il sito indicato negli elenchi, {s}, mostra solo la scritta \"sito in costruzione\". L'ho verificato.", f"{s}: \"sito in costruzione\"","Il sito è fermo in costruzione")
    if c=='BET': return (f"il sito indicato negli elenchi, {s}, oggi mostra un sito straniero di giochi online, non la vostra attività: il dominio è passato ad altri. L'ho verificato.", f"{s} ora mostra un sito di giochi online","Il vostro vecchio dominio mostra un sito di giochi")
    if c=='KB':
        big=d['big'][0][0] if d.get('big') else 0
        ex=(f": una sola immagine pesa {mb(big)}" if big>=1000 else "")
        nt2=(" In più, il numero è scritto come semplice testo: toccandolo non parte la chiamata." if d.get('notel') and d.get('ph') else (" In più, nella pagina non c'è un numero da toccare per chiamare." if d.get('notel') else ""))
        return (f"nella mia prova da smartphone la pagina iniziale di {s} ha scaricato circa {mb(d['kb'])}{ex}. Una home ben fatta ne pesa uno o due, e con il 4G il caricamento si fa attendere."+nt2, f"{s}: {mb(d['kb'])} per aprire la home",f"La home pesa {mb(d['kb'])} da telefono")
    if c=='NOTEL' and d.get('ph'): return (f"su {s} il numero è scritto come semplice testo: toccandolo non parte la chiamata. L'ho verificato da smartphone.", f"{s}: il numero non si tocca","Il numero non si può toccare per chiamare")
    if c=='NOTEL': return (f"aprendo {s} da telefono, nella pagina iniziale non c'è un numero da toccare per chiamare: bisogna andarlo a cercare. L'ho verificato da smartphone.", f"{s}: da telefono non si può chiamare con un tocco","Dal sito non si può chiamare con un tocco")
    if c=='FRAME': return (f"il sito {s} mostra in realtà una pagina gratuita di Wix dentro una cornice: come titolo della pagina compare solo la scritta \"{s}\", senza il nome della residenza, ed è il titolo che Google mostra nei risultati. L'ho verificato.", f"{s}: il nome della residenza non compare","Il nome della residenza non compare nel sito")
    if c=='NOSITE':
        o=d.get('other'); extra=(f" Ho provato anche {o}: è un'altra attività." if o else "")
        return (N[0]+extra, None,"La vostra attività non ha un sito")
END={'DEAD':"Pensa che abbiate chiuso, e si rivolge altrove.",'BROKEN':"Pensa a un'attività ferma, e si rivolge altrove.",'DOWN':"Pensa a un'attività ferma, e si rivolge altrove.",
     'CERT':"Davanti a quell'avviso quasi tutti tornano indietro, e scelgono un altro risultato.",'HTTPONLY':"Davanti a quella scritta molti tornano indietro, e scelgono un altro risultato.",
     'SW':"Proprio quando sta per contattarvi perde il filo, e rimanda.",'OLD':"Si chiede se l'attività sia ancora quella, e sceglie chi mostra le novità.",
     'WIP':"Pensa a un'attività ferma, e si rivolge altrove.",'BET':"Pensa di aver sbagliato indirizzo, o peggio, e chiude la pagina.",
     'KB':"Chi aspetta più di qualche secondo torna indietro e sceglie il risultato successivo.",'NOTEL':"Deve copiarlo a mano o andarlo a cercare, e spesso a quel punto chiama qualcun altro.",'NOSITE':"Non vede foto né informazioni, e sceglie chi le mostra.",'FRAME':"Non capisce subito chi siete, e passa alla struttura successiva."}
def cap(s): return s[0].upper()+s[1:]
def prep(a):
    for k,v in (("il ","al "),("la ","alla "),("lo ","allo "),("l'","all'"),("i ","ai "),("gli ","agli "),("le ","alle ")):
        if a.startswith(k): return v+a[len(k):]
    return "a "+a
R=[];X=json.load(open(os.path.join(H,'tredicesimo_giro_dati.json')))
for x in X:
    nome,key,actor,fact=D[x['email']]
    town=TOWN.get(x.get('town'),x.get('town','').replace('-',' ').title())
    addr=(x.get('addr') or '').strip(' -.,')
    addr=re.sub(r',?\s*\d{5}\s.*$','',addr)
    addr=addr.replace(', ',' ')
    via=addr.title().replace("D'","d'").replace(" Di "," di ").replace(" Del "," del ").replace(" Della "," della ").replace(" Dei "," dei ").replace(" Per "," per ").replace(" E "," e ")
    p,subj,title=problem(x)
    site=site_of(x)
    if x['code']=='NOSITE':
        op=f"{nome} {'ad' if town[0] in 'AEIOU' else 'a'} {town} è negli elenchi delle attività della zona di Alessandria."
        subj=f"{nome[0].upper()+nome[1:]}, {town}"
    else:
        op=f"{nome} {'ad' if town[0] in 'AEIOU' else 'a'} {town}"+(f", in {via}," if via and len(via)<60 else ",")+f" è negli elenchi della zona di Alessandria, con il sito {site}."
    if town=='Alessandria': op=op.replace(' della zona di Alessandria',' delle attività della città')
    pers=fact or PB.get(key) or PB2[key]
    sc=f"Pensi {prep(actor)}. "+("Vi trova, ma "+p if x['code']=='NOSITE' else cap(p.split(': ',1)[0] if False else p))+" "+END[x['code']]
    nd=re.sub(r"^(l'|il |la |lo |le |i |gli )","",nome); nd=nd[0].upper()+nd[1:]
    R.append((nd,x['email'],subj,title,cap(op),pers,sc,key))
M=[(i+1,n,e,False,s,t,"Buongiorno,",o,pe,sc,T[k]) for i,(n,e,s,t,o,pe,sc,k) in enumerate(R)]
