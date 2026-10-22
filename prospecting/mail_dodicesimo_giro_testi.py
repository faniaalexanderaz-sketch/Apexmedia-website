# Dodicesimo giro – 22/10/2026: Alessandria e provincia vicina (Valenza, Tortona, Novi Ligure e comuni entro ~25 km).
# Problemi verificati con Playwright (iPhone 13), curl (https/http/certificato) e DNS. Dati: scratchpad w/final14.json
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
TOWN={'tortona':'Tortona','novi-ligure':'Novi Ligure','valenza':'Valenza','sale':'Sale','castellazzo-bormida':'Castellazzo Bormida','bosco-marengo':'Bosco Marengo','lu-e-cuccaro-monferrato':'Lu e Cuccaro Monferrato','solero':'Solero','cassine':'Cassine','san-salvatore-monferrato':'San Salvatore Monferrato','quattordio':'Quattordio','pietra-marazzi':'Pietra Marazzi','occimiano':'Occimiano','alluvioni-piovera':'Alluvioni Piovera','fubine-monferrato':'Fubine Monferrato','sezzadio':'Sezzadio','pecetto-di-valenza':'Pecetto di Valenza','conzano':'Conzano','pomaro-monferrato':'Pomaro Monferrato','oviglio':'Oviglio','frugarolo':'Frugarolo','masio':'Masio','bassignana':'Bassignana','quargnento':'Quargnento','bergamasco':'Bergamasco','castelnuovo-bormida':'Castelnuovo Bormida','casal-cermelli':'Casal Cermelli'}
N=["ho cercato e non ho trovato un vostro sito: negli elenchi online ci sono solo indirizzo e telefono.",
   "ho cercato con attenzione e un vostro sito non c'è: online risultano solo indirizzo e numero."]
# email -> (nome mostrato, chiave categoria, attore della scena, frase personale o None)
D={
'info@centro-polispecialistico.it':("Studio Omodeo Zorini, centro polispecialistico",'medico',"chi deve prenotare una visita specialistica e cerca dal telefono un centro a Tortona",None),
'motorsport.jeep@libero.it':("l'officina di Samuele Mantoan",'auto',"chi ha la Jeep con la spia accesa e cerca un'officina specializzata dal telefono","Un'officina specializzata su Jeep e Chrysler ha un pubblico preciso, di appassionati che cercano proprio quella competenza."),
'akiracomicsnovi@gmail.com':("Akira, negozio di fumetti e giochi",'giochi',"un ragazzo che cerca un manga appena uscito e vuole sapere se lo trova in negozio","Un negozio di fumetti e giochi ha un pubblico fedele di appassionati, che cerca le novità prima ancora che arrivino."),
'termocasainfo@gmail.com':("Termocasa",'idra',"chi ha la caldaia ferma e cerca un tecnico a Tortona dal telefono",None),
'info@gencartortona.it':("la Carrozzeria Gen.Car",'auto',"chi ha appena avuto un piccolo incidente e cerca una carrozzeria dal telefono",None),
'rosannasalashop@gmail.com':("Rosanna Sala Accessori Moda",'abb',"chi cerca un accessorio da regalare e vuole vedere le novità prima di uscire",None),
'malaspinagourmet@gmail.com':("Malaspina Gourmet",'rist',"chi vuole prenotare una cena speciale in piazza Malaspina e cerca il menu dal telefono","Un locale in piazza Malaspina, nel cuore di Tortona, ha una posizione che parla da sola."),
'officina@frenauto.com':("Frenauto",'auto',"chi deve sostituire i freni e cerca un'officina a Tortona dal telefono",None),
'tortona@laviaggeria.biz':("La Viaggeria",'viaggi',"chi sogna un viaggio e cerca un'agenzia a Tortona dal telefono",None),
'arat.tortona@virgilio.it':("A.R.A.T. Auto Ricambi Accessori Tortona",'auto',"un meccanico che cerca un ricambio e vuole sapere subito se c'è",None),
'oasiviaggi.tortona@gmail.com':("Oasi Viaggi",'viaggi',"chi vuole prenotare le vacanze di Natale e cerca un'agenzia vicino a casa",None),
'madia.milone@libero.it':("Madia Style Studio",'parr',"una cliente che la sera vuole fissare un appuntamento per il colore",None),
'annadeligio@gmail.com':("la Polleria Moderna",'alim',"chi vuole ordinare un pollo arrosto per la domenica e cerca il numero dal telefono",None),
'vetreria-artigiana@cheapnet.it':("la Vetreria Artigiana",'vetro',"chi deve sostituire un vetro rotto e cerca una vetreria a Tortona",None),
'paola.autonord@libero.it':("Nuova Autonord Tortona",'auto',"chi cerca un'officina o un'auto sulla statale per Alessandria",None),
'info@pasticceriaelvezia.it':("la Pasticceria Elvezia",'pastic',"chi deve ordinare una torta per domenica e cerca la pasticceria dal telefono",None),
'officinazuccotti@gmail.com':("le Autoriparazioni Zuccotti",'auto',"chi deve fare il tagliando e cerca un'officina di fiducia a Tortona",None),
'anticatabaccheria@gmail.com':("l'Antica Tabaccheria",'neg',"chi cerca un articolo da regalo e vuole sapere se lo trova in via Girardengo",None),
'sivarservice@libero.it':("Nuova Sivar",'auto',"chi ha l'auto ferma sulla statale dei Giovi e cerca assistenza dal telefono",None),
'vincenzolorito30@gmail.com':("La Rotonda Farinata",'pizza',"chi ha voglia di farinata stasera e cerca il locale dal telefono","Una farinata fatta bene è un piccolo rito, e chi la ama torna sempre nello stesso posto."),
'kasmeneor.c@gmail.com':("Kasmeneo",'edil',"chi deve ristrutturare casa e cerca un'impresa a Tortona dal telefono",None),
'lessismore9591@gmail.com':("Civico 4",'rist',"chi vuole prenotare un tavolo per stasera e cerca il ristorante dal telefono",None),
'abkstudio.tortona@gmail.com':("A.B.K. Studio",'pal',"chi vuole iniziare un corso e cerca orari e prezzi dal telefono",None),
'balostrosamuel@gmail.com':("l'Autolavaggio 5 Stelle",'auto',"chi vuole far lavare l'auto sabato mattina e cerca orari e prezzi",None),
'amministrazione@provalle.it':("Ponta",'idra',"chi ha un guasto all'impianto e cerca un tecnico a Novi Ligure",None),
'lafilottica.tortona@libero.it':("La Filottica",'ott',"chi deve rifare gli occhiali e cerca un'ottica a Tortona dal telefono",None),
'morenagiordano1981@gmail.com':("Ar Castè, ristorante pizzeria",'pizza',"chi vuole prenotare una pizza per stasera e cerca il locale dal telefono",None),
'itec.tortona@libero.it':("I.T.E.C.",'idra',"chi cerca un impiantista a Tortona per un preventivo",None),
'agenziacaimmobiliare@gmail.com':("Ca' Immobiliare",'imm',"chi cerca casa a Novi Ligure e vuole vedere le proposte dell'agenzia",None),
'maccagno.snc@libero.it':("l'Officina Maccagno",'auto',"chi deve fare il tagliando e cerca un'officina in via Pernigotti",None),
'matteo.bagnasco1994@gmail.com':("Xenia Properties",'bnb',"un viaggiatore che cerca un alloggio in centro a Tortona",None),
'nicolo.civeriati@outlook.it':("Agrigiardino",'giard',"chi vuole sistemare il giardino in autunno e cerca un vivaio a Sale",None),
'info@demariapaolo.com':("Paolo Demaria Make-up Artist",'eventi',"una sposa che cerca un truccatore per il matrimonio e vuole vedere i lavori","Il trucco per un matrimonio si sceglie guardando i lavori fatti: è il portfolio a convincere."),
'geoluca@cappellettosrl.it':("Cappelletto",'edil',"chi deve ristrutturare e cerca un'impresa a Bosco Marengo",None),
'info@pancotfratelli.it':("Pancot Fratelli",'edil',"chi deve rifare il tetto e cerca un'impresa vicino a San Salvatore",None),
'web@energycar.it':("Energy Car",'conc',"chi cerca un'auto a Novi Ligure e vuole vedere il parco auto dal telefono",None),
'sportlinepneus@libero.it':("Sportline Pneus",'gomme',"chi deve montare le gomme invernali e cerca un gommista a Novi",None),
'cia@ciadisinfestazioni.it':("Progetto CIA Disinfestazioni",'pulizie',"il gestore di un ristorante che ha bisogno di una disinfestazione urgente",None),
'info@labussolaviaggi.it':("La Bussola Viaggi",'viaggi',"chi vuole prenotare un viaggio e cerca un'agenzia a Novi Ligure",None),
'info@ianustortona.it':("Ianus",'edil',"chi deve ristrutturare e cerca un'impresa sulla statale per Voghera",None),
'info@berninirally.com':("Bernini Rally",'moto',"un appassionato di rally che cerca chi prepara le auto da gara","Preparare auto da rally è un lavoro per veri specialisti, e gli appassionati sanno riconoscerli."),
'edilciambarella@gmail.com':("Edil Ciambarella",'edil',"chi deve ristrutturare e cerca un'impresa a Quattordio",None),
'info@emme2antifurti.it':("Emme 2 Antifurti",'sicur',"chi ha appena subito un furto e cerca un installatore di allarmi",None),
'info@mb5mobili.it':("M.B.5 Mobili",'arred',"chi sta arredando casa e vuole vedere le proposte prima di passare in negozio",None),
'info@agostinobernardini.it':("l'impresa di Agostino Bernardini",'edil',"chi deve ristrutturare e cerca un'impresa vicino a Pomaro",None),
'info@donatellabistrot.it':("Donatella Bistrot",'rist',"chi vuole prenotare un pranzo in piazza a Oviglio e cerca il menu",None),
'info@letterbit.org':("Letterbit",'tipo',"chi deve stampare dei biglietti da visita e cerca una tipografia a Tortona",None),
'info@ilbanco.it':("Il Banco",'rist',"chi vuole prenotare una cena in centro a Novi Ligure",None),
'info@megaplex-stardust.com':("il Megaplex Stardust",'cinema',"una famiglia che vuole vedere gli orari del film di stasera","Un multisala come il vostro vive di decisioni prese all'ultimo, spesso dal telefono, mezz'ora prima dello spettacolo."),
'info@immobiliaretraverso.it':("l'Immobiliare Traverso",'imm',"chi cerca casa a Novi Ligure e apre il sito dell'agenzia la sera",None),
'eco@bonomocostruzioni.it':("Bonomo Costruzioni",'edil',"chi cerca un'impresa a Novi Ligure per una ristrutturazione",None),
'info@ristorantemontecarlo.it':("il Ristorante Montecarlo",'rist',"chi vuole prenotare una cena a Tortona e cerca il menu dal telefono",None),
'info@globalsafetysrl.com':("Global Safety",'pulizie',"un'azienda che cerca un fornitore per sanificazioni e sicurezza",None),
'progettiscuola@equazione.it':("Equazione, cooperativa sociale",'coop',"una scuola che cerca un partner per un progetto educativo",None),
'dappertutto@mediacomm.it':("Dappertutto Tours",'viaggi',"chi cerca un tour organizzato e vuole vedere le proposte",None),
'info@fattore.it':("Il Fattore",'rist',"chi vuole prenotare un pranzo in campagna, sulla strada per Cassano",None),
'tubipress@tubipress.com':("Tubi Press",'auto',"un'officina che cerca un fornitore di tubi idraulici e raccordi",None),
'info@range-id.it':("Pastorelli Ottico Optometrista",'ott',"chi deve fare un controllo della vista e cerca un'ottica in corso Marenco",None),
'info@giorgiolombardigelaterie.it':("Giorgio Lombardi Gelaterie",'pastic',"chi vuole ordinare una torta gelato e cerca la gelateria dal telefono",None),
'info@callegher.biz':("Callegher",'idra',"chi cerca un impiantista a Valenza per un preventivo",None),
'info@tabaccheriadellapiazzetta.it':("la Tabaccheria della Piazzetta",'neg',"chi vuole sapere se trova un articolo prima di passare in piazza Verdi",None),
'supercarvalenza@tin.it':("Supercar, carrozzeria ed elettrauto",'auto',"chi ha un guasto elettrico all'auto e cerca un elettrauto a Valenza",None),
'info@francogalluccio.it':("Franco Galluccio Costruzioni",'edil',"chi deve costruire o ristrutturare e cerca un'impresa vicino a Frugarolo",None),
'info@resina-design.it':("RD Resina Design",'edil',"chi vuole un pavimento in resina e cerca esempi di lavori fatti","I pavimenti in resina si scelgono con gli occhi: le foto dei lavori fanno tutto il lavoro di vendita."),
'info@noviauto.it':("Novi Auto",'conc',"chi cerca un'auto usata a Novi Ligure e sfoglia i modelli dal telefono",None),
'info@maggifoto.it':("lo Studio Fotografico Maggi",'foto',"una coppia che cerca un fotografo per il matrimonio",None),
'costruzioniprimavera23@gmail.com':("Costruzioni Primavera 23",'edil',"chi cerca un'impresa a Tortona per una ristrutturazione",None),
'paolo_buscaglia@fastwebnet.it':("Cookery Tortona",'alim',"chi cerca una gastronomia per una cena già pronta",None),
'amicoforno227@gmail.com':("L'Amico Forno",'alim',"chi vuole ordinare pane e focaccia per una festa",None),
'info@dolceacquaimpianti.it':("Dolce Acqua Impianti",'idra',"chi ha un guasto all'impianto e cerca un idraulico a Novi Ligure",None),
'gelateria@soban.it':("la Gelateria Soban",'pastic',"un turista che cerca una gelateria storica a Valenza dal telefono","Una gelateria fondata nel 1924 a Valenza, con sedi anche ad Alessandria, come si legge sul vostro sito, è un pezzo di storia della zona."),
'info@brizzolarigiardinaggio.com':("Brizzolari Giardinaggio",'giard',"chi cerca un decespugliatore Stihl e vuole vedere i prezzi dal telefono","Un negozio con marchi come Stihl e Weibang e uno shop online già attivo ha fatto un passo che molti non hanno fatto."),
'info@ilparticolare.com':("Il Particolare Arti Grafiche",'tipo',"un'azienda che cerca un fornitore per serigrafia e stampa digitale","Serigrafia, stampa digitale e sistemi espositivi nello stesso posto sono un servizio completo per le aziende."),
'sardimasio@gmail.com':("Sardi Pellet e Stufe",'casa',"chi deve ordinare il pellet per l'inverno e cerca prezzi e consegna","Pellet austriaco e altoatesino di qualità, con consegna rapida, è proprio ciò che si cerca all'arrivo del freddo."),
'info@hotelmotelflower.it':("l'Hotel Motel Flower",'hotel',"un viaggiatore che cerca una camera per stanotte lungo la statale dei Giovi",None),
'info@sanguglielmo.it':("Sanguglielmo Europa Truck Service",'auto',"un autotrasportatore con il mezzo fermo che cerca un'officina Iveco","Assistenza Iveco, revisioni e prenotazione online sul vostro sito sono servizi preziosi per chi lavora con i mezzi pesanti."),
'commerciale.energeo@gmail.com':("EnerGeo Clima",'idra',"chi vuole un preventivo per la pompa di calore e cerca un installatore a Tortona","Oltre trent'anni nel riscaldamento e nella climatizzazione, come si legge sul vostro sito, sono un argomento di fiducia forte."),
'info@smriparazioniautogru.it':("SM Riparazioni Autogru",'auto',"un'impresa con l'autogru ferma che cerca un'officina specializzata",None),
'francoziliani@yahoo.it':("Vino al Vino",'vino',"chi cerca un'enoteca a Novi Ligure per scegliere una bottiglia da regalare","Un'enoteca vive del consiglio di chi sa scegliere il vino giusto, ed è proprio ciò che manca a chi compra al supermercato."),
'assistenza@bftel.it':("B.F. Telecomunicazioni",'tecno',"un'azienda che cerca chi le rinnovi il centralino e la rete","Le tecnologie per il lavoro ibrido, al centro del vostro sito, sono proprio ciò che oggi cercano le aziende."),
'immaginecasa93@gmail.com':("Immagine Casa",'arred',"chi sta progettando la nuova cucina e vuole vedere le vostre proposte dal telefono",None),
'info@cogelme.com':("Cogelme",'tecno',"un responsabile acquisti italiano che cerca separatori a correnti indotte","I separatori a correnti indotte per il riciclo sono una specializzazione che vi rende un riferimento nel settore."),
'info@gelaterialasala.it':("La Sala, laboratorio di gelateria",'pastic',"chi vuole ordinare una torta gelato per una festa","Un laboratorio artigianale di gelateria e pasticceria fredda, aperto dal martedì alla domenica con orario continuato, è una comodità che si apprezza."),
'me@ericaspigariol.it':("Erica Spigariol Fotografa",'foto',"un'azienda che cerca un fotografo per le immagini del proprio brand","La fotografia aziendale per il brand online, come racconta il vostro sito, è un servizio sempre più richiesto."),
'montevalenzaterme@tiscali.it':("le Terme di Monte Valenza",'hotel',"una famiglia che cerca dove passare la domenica tra piscine e parco",None),
'lamodadelcolore@virgilio.it':("La Moda del Colore",'ferr',"chi deve ridipingere casa e cerca un colorificio a Valenza",None),
'info@lacommediadellapentola.it':("La Commedia della Pentola",'rist',"chi vuole prenotare una cena con pernottamento nel Monferrato","Una cucina tradizionale e fantasiosa, con le camere per fermarsi a dormire, è una proposta che si ricorda."),
'info@marcoelettronica.com':("Marco Elettronica",'elet',"un radioamatore che cerca assistenza per i propri apparati","Passione ed esperienza nelle radiocomunicazioni sono una specializzazione rara, che gli appassionati cercano apposta."),
'amministrazione@perassoroberto.it':("gli Studi Odontoiatrici Imelio Perasso",'dent',"un paziente che vuole fissare una visita e cerca lo studio dal telefono","\"Il sorriso è un gioco di squadra\", e la sponsorizzazione del Derthona Basket, raccontano uno studio legato alla città."),
'pasticceriavercesi@libero.it':("la Pasticceria Vercesi",'pastic',"chi vuole regalare una scatola di Baci Dorati e cerca la pasticceria dal telefono","I Baci Dorati, specialità esclusiva della casa, sono il tipo di prodotto che fa conoscere una pasticceria oltre la città."),
'diego.ferrini@acosi.it':("Acosì",'idra',"un amministratore di condominio che cerca chi gestisca l'impianto termico",None),
'photoagency.al@libero.it':("PhotoAgency di Andrea Amato",'foto',"chi cerca un fotografo per un book o un evento e apre il sito dal telefono","Il listino dei servizi con prezzi chiari, come il book fotografico, è una scelta trasparente che i clienti apprezzano."),
'info@guitar-tortona.it':("Guitar Tortona",'musica',"un musicista che cerca una chitarra e sfoglia il catalogo dal telefono","Centinaia di chitarre, bassi e amplificatori a catalogo fanno del vostro negozio un riferimento per i musicisti."),
'nickpage@live.it':("PagettoArte",'galleria',"un collezionista che cerca un dipinto antico e apre il sito dal telefono","Arte, antiquariato, dipinti di ogni epoca e ambienti completi in via Girardengo sono una proposta rara."),
'info@emmemotoritortona.it':("Emme Motori",'conc',"chi cerca un'auto e sfoglia l'autosalone dal telefono la sera",None),
'info@artigiancaffe.it':("Artigian Caffè",'caffe',"chi vuole riordinare le capsule compatibili dal telefono","Una miscela propria come 7 Rosso Passione, anche in capsule compostabili, è un prodotto che fidelizza."),
'info@styleceramiche.it':("Styleceramiche",'edil',"chi deve rifare i pavimenti e cerca esempi di posa dal telefono","Oltre cinquant'anni di pavimenti, rivestimenti e resine, come racconta il vostro sito, sono un'esperienza che rassicura."),
'negozio.unia.carlo@alice.it':("Unia Carlo",'ferr',"chi cerca un regalo per una lista nozze e apre il sito dal telefono","Ferramenta, casalinghi, illuminazione e liste nozze nello stesso negozio di Occimiano sono una proposta completa."),
'office@tenutasanlorenzo.com':("la Tenuta San Lorenzo",'vino',"un appassionato che vuole prenotare una degustazione dal telefono","Oltre cento anni di vino tramandati in famiglia, come racconta il vostro sito, sono una storia che vende da sola."),
'info@casaseteriasironi.it':("La Casa della Seteria Sironi",'bnb',"un viaggiatore che cerca un soggiorno particolare vicino a Tortona","\"Un nuovo senso di ospitalità\" in una casa storica è una proposta che si distingue dai soliti alberghi."),
'ilsognodinilde@gmail.com':("Il Sogno di Nilde",'coop',"una figlia o un figlio che cerca una casa famiglia per un genitore anziano","Una casa famiglia nata nel 2018 dall'idea di mettere insieme amore e cura è una storia che rassicura le famiglie."),
'info@unitagamma.it':("Unità Gamma",'sicur',"il responsabile di un'azienda che cerca un system integrator per la videosorveglianza","Il revamping della videosorveglianza per il Comune di Tortona è una referenza che pochi possono vantare."),
'vittorio@marinayachtsales.it':("Marina Yacht Sales",'nautica',"un cliente che sfoglia le barche usate dal telefono la sera",None),
'info@pasticcerialapieve.it':("la Pasticceria La Pieve",'pastic',"chi vuole ordinare un catering per una festa e apre il sito dal telefono",None),
'info@edilmutti.com':("Edilmutti",'serr',"chi vuole cambiare le finestre e cerca un rivenditore Finstral","Un rivenditore con 12.500 metri quadrati di strutture e il marchio Finstral ha un'offerta che pochi in zona possono dare."),
'ristorantegolfmargara@gmail.com':("il Ristorante del Golf Club Margara",'rist',"un golfista che vuole prenotare il pranzo dopo la partita","Trentasei buche nel cuore del Monferrato Patrimonio UNESCO sono una cornice unica per un ristorante."),
'euronovi@boggeri.it':("Euronovi",'edil',"chi cerca un'impresa edile a Novi Ligure e apre il sito dal telefono",None),
'info@palestratortona.it':("Body & Ginny",'pal',"chi vuole iscriversi in palestra e guarda orari e abbonamenti dal telefono","Milleseicento metri quadrati di centro fitness, aperti anche la domenica, sono un argomento forte per chi cerca una palestra. "+APP),
'info@lapievesrl.com':("La Pieve",'imm',"chi cerca casa a Tortona e guarda gli immobili dal telefono","Agenzia, fotografia immobiliare e ristrutturazioni in un unico studio sono un servizio completo per chi vende."),
'info@ti-at.it':("T.I. & A.T.",'tecno',"chi cerca un tecnico per l'impianto elettrico o domotico",None),
'basto@edilcentrodibasto.it':("Edilcentro di Basto",'edil',"chi sta progettando una ristrutturazione e cerca chi la segua dall'inizio","\"Portiamo le idee alla luce\": il vostro sito parte proprio da ciò che chi ristruttura sta immaginando."),
'maspam64@virgilio.it':("lo Studio Odontoiatrico Spampinato",'dent',"un paziente che vuole prenotare un appuntamento dal telefono","Oltre trent'anni e migliaia di pazienti, come si legge sul vostro sito, sono la migliore garanzia per chi sceglie un dentista."),
'info@nuovaotticavalenza.it':("la Nuova Ottica Valenza",'ott',"chi deve scegliere una nuova montatura e guarda le collezioni dal telefono",None),
'latelierartandco76.lfp@gmail.com':("L'Atelier Art & Co",'neg',"chi cerca un regalo originale e sfoglia il concept store dal telefono","Un concept store tra arte e bellezza, con idee regalo uniche, ha una proposta che la grande distribuzione non ha."),
'farm.gigante@libero.it':("la Farmacia Re",'farm',"chi vuole sapere se un prodotto è disponibile prima di passare in farmacia",None),
'kenyalaviaggi@libero.it':("Kenyala Viaggi",'viaggi',"chi sogna una crociera e sfoglia le offerte dal telefono in pausa pranzo",None),
'riola@fratelliriola.191.it':("Riola",'edil',"chi cerca un'impresa per una nuova costruzione nel Novese","Oltre sessant'anni di edilizia nel Novese e in Liguria, come racconta il vostro sito, sono una garanzia rara."),
'info@autoscuolagramsci.it':("l'Autoscuola Gramsci",'scuolag',"un ragazzo che vuole iscriversi per la patente e guarda i corsi dal telefono","Quarantasei anni di attività e quasi cinquemila patenti, come si legge sul vostro sito, sono numeri che convincono."),
'puntomobili@gmail.com':("Il Punto Mobili",'arred',"chi sta arredando casa e sfoglia cucine e soggiorni dal telefono","Duemila metri quadrati di showroom dal 1994 fanno di voi un riferimento per l'arredamento in provincia."),
'info@oroeoro.it':("Oro e Oro",'gioi',"chi cerca un gioiello da regalare e guarda le collezioni dal telefono","Quasi cinquant'anni nel settore orafo a Valenza sono una storia che pochi negozi possono raccontare."),
'info@lithocommerciale.com':("Litho Commerciale",'tipo',"un'azienda che cerca un fornitore di etichette e packaging","\"Stampiamo dal 1920\": una tipografia con più di cento anni di storia ha un argomento che nessuno può copiare."),
'info@centrocucineoltrepo.it':("Davio Mobili",'arred',"chi sta progettando la cucina e sfoglia le proposte dal telefono","Dal primo mobilificio di Tortona a riferimento per Alessandria e Pavia: è una storia che rassicura chi arreda casa."),
'info@galleriarinocosta.it':("la Galleria Lara e Rino Costa",'galleria',"un collezionista che apre il sito per vedere le opere in galleria","Una galleria nata nel 1990 e specializzata nel Nuclearismo e nello Spazialismo ha un'identità precisa."),
'info@geasistemi.it':("GEA Tecnologie",'sicur',"chi ha appena subito un furto e cerca un installatore di antifurti",None),
'naclerio.costruzioni@yahoo.it':("Naclerio Costruzioni",'edil',"chi deve rifare il tetto e cerca un'impresa a Quattordio",None),
'info@inaclerio.it':("I Naclerio",'parr',"una cliente che vuole prenotare una consulenza per i capelli","Esperienza, creatività e professionalità dal 1964, con la tricoanalisi al microscopio, sono un servizio che pochi saloni offrono. "+APP),
'info@immobiliareilperimetro.com':("l'Immobiliare Il Perimetro",'imm',"chi cerca casa a Novi Ligure e guarda gli annunci dal telefono",None),
'info@dt-servicestech.it':("DT Services & Tech",'idra',"un'azienda che cerca chi le progetti e mantenga gli impianti",None),
'info@ilcapricciocreazioni.it':("Il Capriccio Creazioni",'gioi',"chi cerca un gioiello originale e sfoglia lo shop dal telefono","Lo speciale di Halloween con i gioielli \"da un altro pianeta\" mostra una creatività che si fa notare."),
'info@ortopediamg4.it':("Sanitas MG 4",'sanit',"chi deve acquistare un ausilio ortopedico per un familiare",None),
'info@verde-commerce.it':("Fior di Loto by Verde-Commerce",'fiori',"chi vuole ordinare una siepe con il codice sconto del mese","La promozione sulle siepi con il codice sconto è proprio il tipo di offerta che fa comprare online."),
'info@lesposedierika.com':("Le Spose di Erika",'eventi',"una coppia che cerca bomboniere e confettata per il matrimonio","Bomboniere, confettate, fiori e tableau de mariage in un unico posto semplificano la vita a chi organizza un matrimonio."),
'contatto@dinamicar.it':("Dinamicar",'conc',"chi cerca un'auto usata e sfoglia la vetrina dal telefono",None),
'carrozzeria.abagnale@gmail.com':("la Carrozzeria Abagnale",'auto',"chi ha appena avuto un piccolo incidente e cerca una carrozzeria a Valenza",None),
'info@latuacasaonline.it':("La Tua Casa Immobiliare",'imm',"chi cerca casa alle porte del Monferrato e guarda gli annunci dal telefono",None),
'info@mslogistica.it':("M&S Logistica",'trasp',"un'azienda che cerca un partner per la logistica e apre il sito dal telefono",None),
'info@castellodipiovera.it':("il Castello di Piovera",'event',"una famiglia che vuole acquistare i biglietti per una visita al castello","Un castello sorto nel Trecento, passato dai Visconti ai Balbi, ha una storia che merita di essere scoperta."),
'impresacampana@alice.it':("l'Impresa Edile Campana",'edil',"chi deve rifare il tetto e cerca un'impresa vicino a Sezzadio",None),
'info@labottegadelsanconiglio.it':("La Bottega del Sanconiglio",'libr',"un genitore che cerca un libro per bambini e sfoglia lo shop dal telefono","Una libreria creativa per bambini curiosi, nata da una storia di famiglia, è un luogo che si ricorda."),
'futurafitnessclub@gmail.com':("la Palestra Futura",'pal',"chi vuole provare una lezione e guarda corsi e orari dal telefono","\"Siate affamati, siate folli\": la #RivoluzioneFutura racconta una palestra con un'identità precisa. "+APP),
'info@ilcarrettino.com':("Il Carrettino",'hotel',"chi vuole prenotare una cena in campagna e una camera per la notte",None),
'info@biomedicatortonese.it':("Biomedica Tortonese",'medico',"un paziente che vuole prenotare un esame e cerca il centro dal telefono","Un centro medico nel cuore di Tortona dal 1988 è un punto di riferimento anche per chi arriva da Pavia e dalla Liguria."),
'absolutm.store@gmail.com':("Absolut M",'calz',"chi vuole personalizzare un paio di sneakers e guarda lo shop dal telefono","Scarpe fatte a mano in vera pelle, personalizzate e numerate una per una, sono un prodotto che si fa notare."),
'sorelleodone@fastwebnet.it':("Sorelle Odone",'casa',"chi cerca cuscini artigianali per la casa e sfoglia la collezione","Una bottega attiva dai primi anni del Novecento, con i cuscini di Giò, ha una storia che vale la pena raccontare."),
'info@marcomototecnica.it':("Marco Mototecnica",'moto',"un motociclista che cerca un'officina di fiducia a Bosco Marengo","Una passione per le moto nata nel 1980, come racconta il vostro sito, è un'esperienza che i motociclisti riconoscono."),
'info@libertydogs.it':("Liberty Dogs",'cane',"chi ha appena adottato un cucciolo e cerca un educatore cinofilo","La consulenza prima dell'adozione e l'approccio cognitivo zooantropologico sono un servizio che fa la differenza."),
'randycoffeetortona@gmail.com':("Randy Coffee Tortona",'caffe',"chi vuole riordinare le capsule e sceglie il ritiro in negozio",None),
'info@autosoccorsoderthona.it':("Autosoccorso Derthona",'socc',"un automobilista in panne che cerca un soccorso stradale dal telefono",None),
'studio@ab-immobiliare.it':("AB Immobiliare",'imm',"chi cerca una casa vicino al golf e guarda gli annunci dal telefono",None),
'studiodentisticodrfranke@gmail.com':("il Dr. Franke Dental Clinic",'dent',"un paziente che vuole chiedere la disponibilità per un appuntamento","Più di trent'anni di esperienza, come si legge sul vostro sito, sono la garanzia che cerca chi sceglie un dentista."),
'info@creartvalenza.com':("Creart",'gioi',"un marchio che cerca un laboratorio di progettazione orafa","Lavorare dal 2007 per i più importanti marchi internazionali del lusso è una referenza di grande prestigio."),
'info@codelfa.com':("Codelfa",'edil',"un committente che cerca un general contractor e apre il sito dal telefono",None),
'info@mondobrico.com':("MondoBrico",'ferr',"chi vuole comprare una stufa a pellet e guarda il volantino dal telefono",None),
'info@novoufficio.it':("Novoufficio",'cart',"un genitore che cerca materiale per la scuola e guarda il sito dal telefono","\"Il più grande self-service della provincia\" per scuola, ufficio e belle arti è un primato che vale la pena far vedere."),
'info@fabrizioremotti.eu':("i Centri Odontoiatrici Remotti",'dent',"un genitore che vuole prenotare una visita per tutta la famiglia",None),
'info@cristianoraffaldi.com':("lo studio dell'architetto Cristiano Raffaldi",'geom',"chi vuole ristrutturare casa e guarda i progetti dello studio","\"La casa è il nostro astuccio\", sartoriale come un abito: è un'idea di progetto che resta in mente."),
'zulian.costruzioni@alice.it':("Zulian Costruzioni",'edil',"chi cerca un'impresa a Valenza per una nuova costruzione","Un'impresa attiva a Valenza dal 1958 ha una storia che rassicura chi deve affidare la propria casa."),
'shop@cogni.it':("Cogni Calzature",'calz',"chi cerca un paio di sneakers e sfoglia lo shop dal telefono","Calzature dal 1920 a Tortona: è una storia che pochi negozi possono raccontare."),
'info@anticomonastero.it':("il Ristorante Antico Monastero",'rist',"chi vuole prenotare una cena a Lu e guarda il sito dal telefono","Un palazzo del Quattrocento, antica dimora dei Marchesi del Monferrato, è una cornice che si ricorda."),
'info@mobilidelpassato.com':("Mobili del Passato",'galleria',"un appassionato di antiquariato che sfoglia il catalogo dal telefono",None),
'info@piedmonthouses.eu':("Piedmont Houses",'imm',"un acquirente straniero che sfoglia le ville del Monferrato dal telefono",None),
'dimensione@dimensionefuturoviaggi.it':("Dimensione Futuro Viaggi",'viaggi',"chi vuole scaricare il programma \"Giro in Giro\" dal telefono","Il programma \"Giro in Giro\", con l'Europa in pullman o in aereo, è una proposta che i clienti affezionati aspettano."),
'nuovanovitracksrls@gmail.com':("Nuova Novi Track",'auto',"un autotrasportatore con il mezzo fermo che cerca un'officina per mezzi pesanti",None),
'info@robertorizzogioielli.com':("la Gioielleria Roberto Rizzo",'gioi',"chi cerca un gioiello Giovanni Raspini e sfoglia lo shop dal telefono",None),
'info@centroedilegamondio.it':("il Centro Edile Gamondio",'ferr',"un'impresa che cerca materiale edile a Castellazzo e apre lo shop dal telefono",None),
'assibar@assibar.it':("Assibar",'b2b',"il titolare di un bar con la macchina del caffè ferma","Un'officina nata nel 1985 per le macchine e le attrezzature da bar è proprio chi si cerca quando il caffè non esce."),
'info@immobiliareprogettovendita.it':("l'Immobiliare Progetto Vendita",'imm',"chi vuole vendere casa a Castellazzo e cerca un'agenzia",None),
'emiliapietranera@hotmail.it':("la Locanda Cannon d'Oro",'rist',"chi vuole ordinare la trippa del martedì da asporto","La trippa del martedì e la polenta e merluzzo del venerdì sono appuntamenti che i clienti affezionati aspettano."),
'info@sandrinofiori.it':("Sandrinofiori",'fiori',"chi vuole ordinare un mazzo per un anniversario dal telefono",None),
'info@raffaellaferrari.com':("Raffaella Ferrari Wedding Planner",'eventi',"una coppia che ha appena fissato la data e cerca una wedding planner",None),
'info@gottacostruzioni.it':("Fratelli Gotta",'edil',"chi deve costruire casa e cerca un'impresa a Cassine",None),
'info@checchinsas.it':("Checchin",'casa',"chi deve sostituire la stufa prima dell'inverno","Una ditta nata negli anni Sessanta dalla passione per il riscaldamento ha un'esperienza che rassicura."),
'commerciale@bigliaserramenti.it':("Marco Biglia Serramenti",'serr',"chi vuole cambiare le finestre e cerca un preventivo dal telefono",None),
'valenzauto@libero.it':("la Carrozzeria Valenzauto",'auto',"chi ha un'ammaccatura sull'auto e cerca un levabolli a Valenza",None),
'info@termoclimaimpianti.com':("Termoclima Impianti",'idra',"chi vuole rifare il bagno chiavi in mano e cerca un preventivo","\"La boutique della termoidraulica\" dal 2001 è un modo efficace di raccontarsi."),
'matilde_zacchia@libero.it':("la Farmacia Zacchia",'farm',"chi vuole prenotare un holter o un ECG in farmacia",None),
'ilristorodilu@gmail.com':("Il Ristoro di Lu",'rist',"chi vuole prenotare un tavolo per la domenica nel Monferrato",None),
'info@campanellaauto.it':("Campanella Santi",'conc',"chi cerca un'auto a Valenza e vuole chiamare il concessionario",None),
'info@degusteriaforlino.com':("la Degusteria Forlino",'rist',"chi vuole prenotare una cena nel cuore di Tortona","Una cucina mai banale, fatta di materie prime selezionate, come si legge sul vostro sito, è il motivo per cui si torna."),
'carferraridaniele@gmail.com':("la Carrozzeria Ferrari",'auto',"chi ha il parabrezza scheggiato e cerca chi lo sostituisca",None),
'novi@carattoimmobiliare.it':("l'Immobiliare Caratto",'imm',"chi cerca un immobile di prestigio a Novi Ligure dal telefono",None),
'agostiautoricambi@alice.it':("Agosti Ricambi Auto & Moto",'auto',"un motociclista che cerca un ricambio o una rettifica",None),
'info@roadrunnergarage.com':("Roadrunner Garage",'moto',"un motociclista con una Honda che cerca uno specialista","Uno specialista Honda nato nel 2017 dalla passione è proprio ciò che un motociclista cerca."),
'vascelloveloce@gmail.com':("Il Vascello Veloce",'giochi',"un genitore che cerca un regalo per un bambino e sfoglia i nuovi arrivi",None),
'pasticceriariccimerella@gmail.com':("la Pasticceria Ricci Merella",'pastic',"chi vuole ordinare una torta per un compleanno","Oltre quarant'anni di pasticceria tradizionale novese sono un'esperienza che si sente."),
'info@controlucefoto.it':("lo Studio Controluce",'foto',"una coppia che cerca un fotografo per il matrimonio","Un fotografo professionista dal 1987, con lo studio aperto dal 1993, ha un'esperienza che rassicura."),
'info@centrootticobianchi.com':("il Centro Ottico Bianchi",'ott',"chi deve prenotare un controllo della vista in via Girardengo",None),
'info@davicosport.com':("Davico Sport",'abb',"chi vuole sapere se è arrivata la nuova collezione Saint Barth",None),
'indellidavide@gmail.com':("Davide il Calzolaio",'calz',"chi deve risuolare un paio di scarpe e cerca un calzolaio in centro","Una bottega in piazza Roma aperta dal 2012 è un servizio di quartiere prezioso."),
'newlinesas@tiscali.it':("il Centro Estetico New Line",'est',"una cliente che la sera vuole prenotare un trattamento",None),
'info@autoscuolacanto.it':("l'Autoscuola Canto",'scuolag',"un ragazzo che vuole iscriversi per la patente e guarda i corsi dal telefono",None),
'termomaxgm@yahoo.it':("Termomax",'idra',"chi ha la caldaia ferma e cerca un tecnico a Quattordio",None),
'elettro-gas@libero.it':("Elettro-Gas",'idra',"chi cerca un tecnico per l'impianto del gas vicino a Castelnuovo Bormida",None),
'calorclimaimpianti@gmail.com':("Calorclima",'idra',"chi vuole un preventivo per il climatizzatore e cerca un installatore a Solero",None),
'flormadonnar@gmail.com':("La Floreria",'fiori',"chi vuole ordinare un mazzo di fiori a Fubine",None),
'albergatto@gmail.com':("Albergatto",'anim',"chi parte per le vacanze e cerca una pensione per il proprio gatto",None),
'nonsoloidro@hotmail.it':("Nonsoloidro di Massimo Lacava",'idra',"chi ha un guasto all'impianto e cerca un idraulico a Bosco Marengo",None),
'danielacermelli@gmail.com':("Aghera Photostudio",'foto',"una famiglia che cerca un fotografo per un servizio di ritratti",None),
'fabioalessandrini18@alice.it':("Climal Impianti",'idra',"chi vuole installare un climatizzatore e cerca un tecnico a Sale",None),
'tosetti.andrea@gmail.com':("l'impresa di Andrea Tosetti",'edil',"chi deve ristrutturare e cerca un'impresa a San Salvatore",None),
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
    if c=='NOTEL': return (f"su {s} il numero è scritto come semplice testo: toccandolo non parte la chiamata. L'ho verificato da smartphone.", f"{s}: il numero non si tocca","Il numero non si può toccare per chiamare")
    if c=='NOSITE':
        o=d.get('other'); extra=(f" Ho provato anche {o}: è un'altra attività." if o else "")
        return (N[0]+extra, None,"La vostra attività non ha un sito")
END={'DEAD':"Pensa che abbiate chiuso, e si rivolge altrove.",'BROKEN':"Pensa a un'attività ferma, e si rivolge altrove.",'DOWN':"Pensa a un'attività ferma, e si rivolge altrove.",
     'CERT':"Davanti a quell'avviso quasi tutti tornano indietro, e scelgono un altro risultato.",'HTTPONLY':"Davanti a quella scritta molti tornano indietro, e scelgono un altro risultato.",
     'SW':"Proprio quando sta per contattarvi perde il filo, e rimanda.",'OLD':"Si chiede se l'attività sia ancora quella, e sceglie chi mostra le novità.",
     'WIP':"Pensa a un'attività ferma, e si rivolge altrove.",'BET':"Pensa di aver sbagliato indirizzo, o peggio, e chiude la pagina.",
     'KB':"Chi aspetta più di qualche secondo torna indietro e sceglie il risultato successivo.",'NOTEL':"Deve copiarlo a mano, e spesso a quel punto chiama qualcun altro.",'NOSITE':"Non vede foto né informazioni, e sceglie chi le mostra."}
def cap(s): return s[0].upper()+s[1:]
def prep(a):
    for k,v in (("il ","al "),("la ","alla "),("lo ","allo "),("l'","all'"),("i ","ai "),("gli ","agli "),("le ","alle ")):
        if a.startswith(k): return v+a[len(k):]
    return "a "+a
R=[];X=json.load(open(os.path.join(H,'dodicesimo_giro_dati.json')))
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
        op=f"{nome} a {town} è negli elenchi delle attività della zona di Alessandria."
        subj=f"{nome[0].upper()+nome[1:]}, {town}"
    else:
        op=f"{nome} a {town}"+(f", in {via}," if via and len(via)<60 else ",")+f" è negli elenchi della zona di Alessandria, con il sito {site}."
    pers=fact or PB[key]
    sc=f"Pensi {prep(actor)}. "+("Vi trova, ma "+p if x['code']=='NOSITE' else cap(p.split(': ',1)[0] if False else p))+" "+END[x['code']]
    nd=re.sub(r"^(l'|il |la |lo |le |i |gli )","",nome); nd=nd[0].upper()+nd[1:]
    R.append((nd,x['email'],subj,title,cap(op),pers,sc,key))
M=[(i+1,n,e,False,s,t,"Buongiorno,",o,pe,sc,T[k]) for i,(n,e,s,t,o,pe,sc,k) in enumerate(R)]
