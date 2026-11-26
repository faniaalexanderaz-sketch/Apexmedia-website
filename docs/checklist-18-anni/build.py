import html, json, sys

# (titolo, sottotitolo, [(voce, dettaglio)])
SEZIONI = [
("Identità digitale e documenti", "Le chiavi per fare quasi tutto online, senza file allo sportello.", [
 ("Attiva lo SPID", "Scegli un gestore con riconoscimento via app o con la CIE: in genere è gratuito e lo ottieni in giornata."),
 ("Trova PIN e PUK della carta d'identità elettronica", "Stanno tra la ricevuta e la lettera di consegna. Se li hai persi, puoi chiederne la ristampa in Comune."),
 ("Installa CieID e collega la tua CIE", "Ti fa entrare nei servizi pubblici con la carta d'identità, anche senza SPID."),
 ("Scarica l'app IO", "Lì arrivano avvisi, scadenze, multe, pagamenti pagoPA e i documenti digitali."),
 ("Controlla la scadenza della carta d'identità", "Se scade entro sei mesi prenota subito il rinnovo in Comune: i tempi d'attesa possono essere lunghi."),
 ("Chiedi il passaporto se pensi di uscire dall'UE", "Si prenota sull'agenda online della Polizia di Stato. Da adulto dura 10 anni."),
 ("Controlla la tessera sanitaria", "Vale come codice fiscale e, sul retro, come tessera europea per le cure nell'UE. Dura 6 anni."),
 ("Entra nel Fascicolo Sanitario Elettronico", "Ci trovi referti, ricette e vaccinazioni. Dai i consensi alla consultazione."),
 ("Accedi all'area riservata dell'Agenzia delle Entrate", "Ti servirà per il 730 precompilato e per controllare cosa risulta a tuo nome."),
 ("Accedi a MyINPS", "Se hai già lavorato, anche solo d'estate, controlla che i contributi risultino nell'estratto conto."),
 ("Registra un domicilio digitale gratuito su INAD", "Si fa su domiciliodigitale.gov.it con SPID o CIE: le comunicazioni ufficiali ti arrivano online."),
 ("Valuta una PEC personale", "Costa pochi euro l'anno e vale come raccomandata con ricevuta di ritorno: comoda per disdette, reclami e università."),
 ("Valuta la firma digitale", "Ti serve per firmare contratti e domande a distanza. Per molti documenti della pubblica amministrazione basta la firma con l'app IO."),
 ("Salva una copia digitale dei documenti", "Carta d'identità, tessera sanitaria e patente in una cartella protetta, non solo nella galleria del telefono."),
]),
("Bonus e agevolazioni per i 18 anni", "Cosa vale davvero per chi compie 18 anni a fine 2026 o nel 2027.", [
 ("Segui la Carta Valore", "Dal 2027 sostituisce Carta Cultura Giovani e Carta del Merito, che si sono chiuse con le domande del 30 giugno 2026. Spetta a chi prende il diploma entro l'anno in cui compie 19 anni. Importo e modalità li fissa un decreto atteso entro fine 2026: tieni d'occhio cultura.gov.it."),
 ("Candidati a DiscoverEU", "Programma europeo che regala a dei diciottenni estratti un pass ferroviario per viaggiare in Europa. Due round all'anno, di solito in primavera e in autunno, su youth.europa.eu."),
 ("Attiva la Carta Giovani Nazionale", "Gratuita dai 18 ai 35 anni, dentro l'app IO: sconti su cultura, sport, viaggi e formazione."),
 ("Usa il biglietto ridotto nei musei statali", "Dai 18 ai 25 anni l'ingresso nei musei e parchi archeologici statali costa poco: porta sempre un documento."),
 ("Cerca le offerte giovani per i treni", "Trenitalia e Italo hanno tariffe dedicate agli under 30: confrontale prima di comprare a prezzo pieno."),
 ("Chiedi l'abbonamento studenti per i mezzi pubblici", "Regioni e Comuni hanno abbonamenti scontati, spesso legati all'ISEE: chiedi all'azienda di trasporto locale."),
 ("Controlla le borse di studio per l'università", "L'ente regionale per il diritto allo studio dà borse, alloggi e mensa in base all'ISEE. Il bando esce in estate: non perderlo."),
 ("Approfitta degli sconti software per studenti", "Molti programmi e servizi cloud sono gratuiti o scontati con la mail della scuola o dell'università."),
 ("Informati su Erasmus+ e Corpo europeo di solidarietà", "Studio, tirocini e volontariato all'estero dai 18 ai 30 anni, con viaggio e alloggio coperti."),
 ("Fai calcolare l'ISEE della tua famiglia", "Quasi tutte le agevolazioni lo chiedono. Si fa gratis al CAF o online con la DSU precompilata dell'INPS."),
]),
("Conto corrente, bancomat e carte", "Il primo strumento di autonomia: sceglilo bene e proteggilo.", [
 ("Apri un conto corrente a tuo nome", "Molte banche, anche online, hanno conti a canone zero per gli under 30."),
 ("Confronta i costi veri, non solo il canone", "Prelievi da altre banche, bonifici istantanei, carta, invio dell'estratto conto."),
 ("Richiedi la carta di debito (bancomat)", "Paghi e prelevi con i soldi che hai sul conto: è la carta giusta per iniziare."),
 ("Capisci la differenza tra debito, prepagata e credito", "La carta di credito sposta l'addebito al mese dopo: comoda, ma ti fa perdere facilmente il conto."),
 ("Impara a trovare e condividere il tuo IBAN", "È quello che dai a chi deve pagarti: datore di lavoro, rimborsi, amici."),
 ("Attiva le notifiche per ogni movimento", "Vedi subito un addebito strano e puoi bloccare la carta in tempo."),
 ("Imposta limiti di spesa e prelievo", "Dall'app della banca: se ti rubano la carta, il danno resta limitato."),
 ("Non dare mai PIN, codici o OTP a nessuno", "Nessuna banca te li chiede per SMS, mail o telefono. Se succede è una truffa: chiudi e chiama tu la banca."),
 ("Salva il numero per bloccare le carte", "Mettilo in rubrica e tienilo anche fuori dal telefono."),
 ("Usa Apple Pay o Google Pay", "Al negozio non mostri il numero della carta: è più sicuro della carta fisica."),
 ("Attenzione ai pagamenti a rate", "\"Paga in 3 rate\" sembra gratis, ma più rate insieme diventano un debito vero. Usalo solo se puoi pagare tutto subito."),
 ("Per un prestito guarda il TAEG, non il TAN", "Il TAEG comprende tutte le spese: è il numero per confrontare le offerte."),
 ("Paga tutto puntuale", "Rate e finanziamenti saltati finiscono nelle banche dati del credito e ti complicano mutuo e affitti per anni."),
 ("Non fare da garante a cuor leggero", "Se l'altro non paga, la banca chiede i soldi a te."),
]),
("Risparmio e investimenti", "Il tempo è il tuo vantaggio più grande: anche cifre piccole crescono.", [
 ("Fai un budget mensile", "Un metodo semplice: 50% spese necessarie, 30% desideri, 20% risparmio. Adattalo, ma scrivilo."),
 ("Costruisci un fondo emergenze", "L'obiettivo sono 3–6 mesi di spese su un conto separato, prima di investire."),
 ("Apri un conto risparmio (conto deposito)", "Tieni i risparmi lontani dalla carta e guadagni un interesse. Fino a 100.000 euro per banca sono protetti dal Fondo interbancario."),
 ("Ricorda l'imposta di bollo", "Sul conto corrente sono 34,20 euro l'anno se la giacenza media supera 5.000 euro. Sui conti deposito e sugli investimenti è lo 0,20%."),
 ("Studia le basi prima di investire", "Cos'è un ETF, cosa vuol dire diversificare, perché i costi contano. Il sito Consob e Quello che conta (Banca d'Italia) sono gratuiti e affidabili."),
 ("Valuta un PAC su ETF", "Un piano di accumulo investe una cifra fissa ogni mese, anche 25–50 euro, in un ETF azionario globale ben diversificato."),
 ("Scegli un intermediario autorizzato", "Banca o broker vigilati da Consob o Banca d'Italia. Il regime amministrato è il più semplice: le tasse le paga lui per te."),
 ("Confronta i costi", "TER dell'ETF, commissioni d'acquisto, costi del deposito. Su 30 anni fanno una differenza enorme."),
 ("Leggi il KID prima di comprare", "È il foglio di 3 pagine con rischi e costi del prodotto: se non lo capisci, non comprare."),
 ("Conosci le tasse", "Sui guadagni da investimenti si paga il 26%, sui titoli di Stato il 12,5%."),
 ("Pensa a lungo termine", "Le azioni crescono negli anni ma possono perdere molto in pochi mesi. Investi solo soldi che non ti servono per almeno 5–10 anni e non vendere per paura."),
 ("Stai alla larga da guru, trading e promesse facili", "\"Rendimenti garantiti\", gruppi Telegram, cripto con leva. Controlla sempre gli abusivi sul sito Consob."),
]),
("Fondo pensione", "Aprirlo da giovane ti dà anni di vantaggio fiscale.", [
 ("Informati su come funziona", "Versi soldi che si investono fino alla pensione. I contributi si deducono dal reddito fino a 5.164,57 euro l'anno."),
 ("Puoi aprirlo anche senza reddito", "Se sei fiscalmente a carico, i genitori possono versare per te e dedurre i contributi."),
 ("Usa il bonus dei primi 5 anni di lavoro", "Chi ha iniziato a lavorare dopo il 2007 e non usa tutta la deduzione nei primi 5 anni può recuperarla dopo, con una quota in più ogni anno."),
 ("Se diventi dipendente, guarda il fondo di categoria", "Aderendo ricevi anche il contributo del datore di lavoro, che altrimenti perdi."),
 ("Confronta i costi sul sito COVIP", "L'Indicatore sintetico dei costi (ISC) dice quanto ti costa ogni fondo: piccole differenze pesano molto in 40 anni."),
 ("Scegli il comparto in base all'età", "Da giovane un comparto più azionario ha più tempo per recuperare i periodi negativi."),
 ("Ricorda la tassazione agevolata", "All'uscita si paga dal 15% al 9%, meno di quasi tutti gli altri investimenti."),
]),
("Patente, auto e assicurazione", "Guidare costa: fai le scelte giuste dall'inizio.", [
 ("Iscriviti a scuola guida o fai l'esame da privatista", "Il foglio rosa vale 12 mesi: organizza le guide per non farlo scadere."),
 ("Fai la visita medica per la patente", "Serve un certificato di un medico abilitato e la foto. Chiedi i prezzi: cambiano molto."),
 ("Se ti piace la moto, valuta la A2", "Dai 18 anni puoi guidare moto fino a 35 kW. Dopo 2 anni puoi passare alla A."),
 ("Conosci le regole da neopatentato", "Per 3 anni: alcol zero, limiti più bassi (100 km/h in autostrada, 90 sulle extraurbane principali) e limiti di potenza dell'auto."),
 ("Lascia il telefono lontano mentre guidi", "Con il nuovo codice della strada le multe e la perdita di punti sono pesanti, soprattutto i primi anni."),
 ("Usa la classe di merito di un familiare (RC familiare)", "Se un familiare convivente ha una classe di merito bassa puoi ereditarla sul tuo veicolo, anche se la patente l'hai appena presa. Serve lo stesso stato di famiglia e nessun incidente con colpa negli ultimi 5 anni."),
 ("Confronta i preventivi RC auto", "Usa i comparatori e Preventivass dell'IVASS. Non rinnovare in automatico senza guardare."),
 ("Valuta la scatola nera", "Spesso abbassa il premio, soprattutto per chi guida da poco."),
 ("Segna bollo, revisione e scadenza dell'assicurazione", "Il bollo dipende dalla regione, la revisione va fatta ogni 2 anni (la prima dopo 4)."),
 ("Controlla i punti patente online", "Sul Portale dell'automobilista o nell'app IO, con SPID."),
 ("Sai cosa fare dopo un incidente", "Tieni in macchina il modulo CAI (constatazione amichevole), fai foto e chiama il 112 se ci sono feriti."),
]),
("Viaggiare da solo", "A 18 anni non ti serve più l'autorizzazione dei genitori.", [
 ("Controlla che il documento valga per l'espatrio", "Nell'UE basta la carta d'identità; per molti altri Paesi serve il passaporto, spesso valido almeno 6 mesi dopo il rientro."),
 ("Verifica visti e autorizzazioni prima di prenotare", "Per esempio Regno Unito (ETA) e Stati Uniti (ESTA) chiedono un'autorizzazione online prima di partire."),
 ("Consulta Viaggiare Sicuri", "Il sito della Farnesina con le informazioni Paese per Paese. Registra il viaggio su Dove siamo nel mondo."),
 ("Fuori dall'UE fai un'assicurazione sanitaria di viaggio", "Negli Stati Uniti un pronto soccorso può costare migliaia di euro."),
 ("Porta la tessera sanitaria", "Nell'UE ti dà accesso alle cure pubbliche come ai residenti."),
 ("Controlla roaming e internet", "Nell'UE il roaming è incluso. Fuori, una eSIM locale costa molto meno della tariffa del tuo operatore."),
 ("Condividi l'itinerario con qualcuno di fiducia", "E attiva la condivisione della posizione per la durata del viaggio."),
 ("Dividi soldi e carte", "Una carta nel portafoglio, una di scorta nello zaino e un po' di contanti in valuta locale."),
 ("Prima di noleggiare un'auto leggi le condizioni", "Molti noleggi chiedono almeno 21 anni e la patente da un anno, o aggiungono un supplemento giovani."),
 ("Leggi le regole di ostelli e alloggi", "Alcuni accettano solo dai 18 anni, altri chiedono un documento o una cauzione."),
]),
("Casa, contratti e primo lavoro", "Leggi prima di firmare: vale per tutto.", [
 ("Firma solo contratti d'affitto registrati", "Ordinario (4+4), concordato (3+2), transitorio o per studenti universitari. Senza registrazione sei meno tutelato."),
 ("Ricorda che la cauzione massima è di 3 mensilità", "Fai foto e un verbale dello stato della casa quando entri."),
 ("Usa la detrazione affitto per giovani", "Tra 20 e 31 anni, con reddito fino a 15.493,71 euro, per 4 anni puoi detrarre il 20% del canone (da 991,60 fino a 2.000 euro l'anno)."),
 ("Se cambi casa, aggiorna la residenza", "Si fa online sul portale ANPR con SPID o CIE."),
 ("Confronta luce e gas sul Portale Offerte ARERA", "È il comparatore ufficiale e neutrale."),
 ("Ricorda il diritto di recesso di 14 giorni", "Per contratti fatti online o al telefono puoi ripensarci entro 14 giorni, senza penali."),
 ("Tieni una lista degli abbonamenti", "Streaming, palestra, app: segna i rinnovi automatici e disdici quello che non usi."),
 ("Pretendi un contratto di lavoro scritto", "Con mansioni, orario, paga e contratto collettivo. Il lavoro in nero non ti dà contributi, malattia né tutele."),
 ("Impara a leggere la busta paga", "Lordo, netto, contributi, ferie maturate. Conserva tutte le buste paga e la Certificazione Unica."),
 ("Se sei a carico, guarda il limite di reddito", "Fino a 24 anni resti a carico dei genitori se guadagni al massimo 4.000 euro l'anno: oltre, loro perdono le detrazioni."),
 ("Fai il 730 quando serve", "Con il precompilato dell'Agenzia delle Entrate puoi farlo da solo o gratis al CAF, e recuperare spese mediche, affitto e università."),
 ("Iscriviti al Centro per l'impiego", "Accedi a offerte, tirocini, corsi gratuiti e al percorso per chi cerca il primo lavoro."),
 ("Prepara un curriculum e un profilo LinkedIn", "Una pagina, chiaro, con esperienze reali, lingue e competenze."),
 ("Guarda il mutuo con garanzia statale per under 36", "Il Fondo prima casa Consap garantisce fino all'80% del mutuo. Oggi è attivo fino al 31 dicembre 2027 e la manovra in discussione vorrebbe estenderlo."),
]),
("Cittadinanza attiva", "Da oggi hai voce: usala.", [
 ("Vota", "A 18 anni voti per Camera, Senato, Parlamento europeo, Regione, Comune e referendum."),
 ("Ritira la tessera elettorale", "Te la consegna il Comune. Controlla che ci siano spazi liberi per i timbri."),
 ("Iscriviti all'albo degli scrutatori", "La domanda va fatta in Comune, di solito entro il 30 novembre di ogni anno. Fare lo scrutatore è pagato."),
 ("Con il diploma, valuta l'albo dei presidenti di seggio", "Domanda entro il 31 ottobre, in Comune o in Corte d'appello."),
 ("Firma referendum e proposte di legge online", "Sulla piattaforma pubblica per le firme, con SPID o CIE."),
 ("Informati sul voto per studenti fuori sede", "Quando è previsto, chi studia lontano può votare dove vive senza tornare a casa."),
 ("Valuta il servizio civile universale", "Dai 18 ai 28 anni, da 8 a 12 mesi, 25 ore a settimana, con un assegno di 519,47 euro al mese esentasse. Il bando principale esce di solito in primavera."),
 ("Fai volontariato", "Anche poche ore al mese: competenze vere, contatti e un'esperienza da mettere nel curriculum."),
 ("Se ti trasferisci all'estero per più di 12 mesi, iscriviti all'AIRE", "È obbligatorio e ti fa votare e ottenere i documenti dal consolato."),
]),
("Salute e donazioni", "Gesti che costano poco e possono salvare una vita.", [
 ("Diventa donatore di sangue", "Dai 18 anni, con un colloquio e degli esami gratuiti, tramite AVIS, FIDAS o il centro trasfusionale."),
 ("Iscriviti al registro dei donatori di midollo osseo", "Dai 18 ai 35 anni, con un prelievo di saliva o di sangue (registro IBMDR, ADMO)."),
 ("Esprimi la tua scelta sulla donazione degli organi", "Puoi farlo quando rinnovi la carta d'identità in Comune, con l'AIDO o all'ASL."),
 ("Controlla il libretto delle vaccinazioni", "Il richiamo di difterite e tetano va fatto ogni 10 anni. Chiedi al medico cosa ti manca."),
 ("Verifica di avere un medico di base", "Se sei ancora con il pediatra o ti sei trasferito, sceglilo all'ASL o online."),
 ("Fai un controllo dal dentista ogni anno", "Prevenire costa molto meno che curare."),
 ("Ricorda che i consultori sono gratuiti", "Salute sessuale, contraccezione, supporto psicologico: senza ricetta e in modo riservato."),
 ("Se ti serve, chiedi aiuto per la salute mentale", "Parla con il medico o con il consultorio. Verifica anche il bonus psicologo dell'INPS, che dipende dall'ISEE e dai fondi dell'anno."),
 ("Valuta le DAT (testamento biologico)", "Da maggiorenne puoi scrivere le tue volontà sulle cure, in Comune o dal notaio."),
]),
("Cose da iniziare a fare", "Piccole abitudini che tra 10 anni fanno una grande differenza.", [
 ("Usa un password manager e la verifica in due passaggi", "Soprattutto su mail, banca e social: sono le chiavi di tutto il resto."),
 ("Tieni un calendario delle scadenze", "Documenti, assicurazioni, bollo, abbonamenti, bandi."),
 ("Segna le spese ogni settimana", "Bastano 5 minuti per sapere dove vanno i tuoi soldi."),
 ("Risparmia in automatico", "Un bonifico automatico verso il conto risparmio il giorno in cui ti arrivano i soldi."),
 ("Impara le basi di casa", "Lavatrice, 10 piatti che sai cucinare, come leggere una bolletta."),
 ("Prendi una certificazione di lingua", "Inglese B2 o C1: ti apre università, lavoro ed Erasmus."),
 ("Cura la tua reputazione online", "Quello che pubblichi oggi lo leggono i datori di lavoro domani."),
 ("Coltiva relazioni e contatti", "Professori, ex colleghi, amici di amici: molte opportunità passano dalle persone."),
 ("Muoviti con regolarità", "Sport, palestra o camminate: l'abitudine conta più dell'intensità."),
 ("Scrivi i tuoi obiettivi per l'anno", "Tre obiettivi concreti, riletti ogni tre mesi."),
]),
]

PRIME_MOSSE = [
 ("Settimana 1", "Identità", ["Attiva SPID e CieID", "Scarica l'app IO", "Controlla le scadenze di carta d'identità e tessera sanitaria"]),
 ("Settimana 2", "Soldi", ["Apri il conto corrente a tuo nome", "Richiedi il bancomat e attiva le notifiche", "Scrivi il tuo primo budget mensile"]),
 ("Settimana 3", "Opportunità", ["Attiva la Carta Giovani Nazionale", "Iscriviti all'albo degli scrutatori", "Segna le date di DiscoverEU e della Carta Valore"]),
 ("Settimana 4", "Futuro", ["Apri un conto risparmio per il fondo emergenze", "Studia le basi di ETF e fondo pensione", "Iscriviti a scuola guida se non l'hai ancora fatto"]),
]

e = html.escape
totale = sum(len(s[2]) for s in SEZIONI)
print("voci:", totale, file=sys.stderr)

parti = []
n = 0
for i, (tit, sub, voci) in enumerate(SEZIONI, 1):
    righe = []
    for v, d in voci:
        n += 1
        righe.append(f'<li><span class="box"></span><div><span class="num">{n:03d}</span><b>{e(v)}</b><p>{e(d)}</p></div></li>')
    parti.append(f'''<section><header><span class="sez">{i:02d}</span><div><h2>{e(tit)}</h2><p class="sub">{e(sub)}</p></div><span class="cnt">{len(voci)} voci</span></header><ul>{"".join(righe)}</ul></section>''')

mosse = "".join(
    f'<div class="mossa"><span class="sett">{e(s)}</span><h3>{e(t)}</h3><ul>' + "".join(f'<li><span class="box sm"></span>{e(x)}</li>' for x in xs) + '</ul></div>'
    for s, t, xs in PRIME_MOSSE)

indice = "".join(f'<li><span>{i:02d}</span>{e(t)}<em>{len(v)}</em></li>' for i, (t, _, v) in enumerate(SEZIONI, 1))

HTML = f'''<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Checklist 18 anni</title>
<style>
@page {{ size: A4; margin: 16mm 16mm 18mm 16mm; }}
:root {{ --ink:#1d2329; --soft:#5b6670; --line:#dfe3e6; --acc:#2f5d62; --bg:#f4f6f5; }}
* {{ box-sizing:border-box; margin:0; padding:0; }}
body {{ font-family:'Inter',sans-serif; color:var(--ink); font-size:9.4pt; line-height:1.45; background:#fff; }}
.cover {{ height:257mm; display:flex; flex-direction:column; page-break-after:always; }}
.cover .top {{ font-size:8.5pt; letter-spacing:.18em; text-transform:uppercase; color:var(--soft); }}
.cover h1 {{ font-family:'Inter Display','Inter',sans-serif; font-size:64pt; line-height:.95; font-weight:700; letter-spacing:-.03em; margin-top:44mm; }}
.cover h1 span {{ color:var(--acc); }}
.cover .lead {{ font-size:13pt; color:var(--soft); max-width:125mm; margin-top:8mm; line-height:1.4; }}
.stats {{ display:flex; gap:10mm; margin-top:14mm; }}
.stats div b {{ display:block; font-family:'Inter Display','Inter'; font-size:24pt; font-weight:700; color:var(--acc); }}
.stats div {{ font-size:8.5pt; color:var(--soft); }}
.toc {{ margin-top:auto; columns:2; column-gap:10mm; list-style:none; border-top:1px solid var(--line); padding-top:6mm; }}
.toc li {{ display:flex; gap:3mm; padding:1.6mm 0; border-bottom:1px solid var(--line); break-inside:avoid; font-size:9pt; }}
.toc li span {{ color:var(--acc); font-weight:600; width:7mm; }}
.toc li em {{ margin-left:auto; font-style:normal; color:var(--soft); }}
.cover .nota {{ font-size:7.8pt; color:var(--soft); margin-top:5mm; }}
.intro h2 {{ font-family:'Inter Display','Inter'; font-size:22pt; letter-spacing:-.02em; }}
.intro p.sub {{ color:var(--soft); margin:2mm 0 6mm; font-size:10pt; }}
.mosse {{ display:grid; grid-template-columns:1fr 1fr; gap:4mm; margin-bottom:8mm; }}
.mossa {{ background:var(--bg); border-radius:3mm; padding:5mm; }}
.mossa .sett {{ font-size:7.5pt; letter-spacing:.14em; text-transform:uppercase; color:var(--acc); font-weight:600; }}
.mossa h3 {{ font-size:12pt; margin:1mm 0 3mm; }}
.mossa ul {{ list-style:none; }}
.mossa li {{ display:flex; gap:2.5mm; align-items:flex-start; padding:1mm 0; }}
.come {{ border:1px solid var(--line); border-radius:3mm; padding:5mm; font-size:9pt; color:var(--soft); margin-bottom:8mm; }}
.come b {{ color:var(--ink); }}
section {{ margin-bottom:7mm; }}
section header {{ display:flex; align-items:flex-end; gap:4mm; border-bottom:2px solid var(--ink); padding-bottom:2.5mm; margin-bottom:1mm; break-after:avoid; }}
.sez {{ font-family:'Inter Display','Inter'; font-size:22pt; font-weight:700; color:var(--acc); line-height:1; }}
section h2 {{ font-size:14pt; letter-spacing:-.01em; line-height:1.15; }}
.sub {{ color:var(--soft); font-size:8.8pt; }}
.cnt {{ margin-left:auto; font-size:7.8pt; color:var(--soft); white-space:nowrap; }}
section ul {{ list-style:none; }}
section li {{ display:flex; gap:3.5mm; padding:2.4mm 0; border-bottom:1px solid var(--line); break-inside:avoid; }}
.box {{ flex:0 0 auto; width:4mm; height:4mm; border:1.3px solid var(--ink); border-radius:1mm; margin-top:.6mm; }}
.box.sm {{ width:3.3mm; height:3.3mm; margin-top:.8mm; }}
.num {{ font-size:7pt; color:var(--acc); font-weight:600; margin-right:2mm; letter-spacing:.05em; }}
section li b {{ font-weight:600; font-size:9.8pt; }}
section li p {{ color:var(--soft); margin-top:.6mm; }}
.fine {{ margin-top:6mm; background:var(--bg); border-radius:3mm; padding:5mm; font-size:8.4pt; color:var(--soft); break-inside:avoid; }}
.fine b {{ color:var(--ink); }}
</style></head><body>
<div class="cover">
 <div class="top">Checklist · Edizione novembre 2026</div>
 <h1>18 anni.<br><span>Cosa fare,</span><br>passo per passo.</h1>
 <p class="lead">Documenti, soldi, bonus, patente, viaggi, casa, voto e salute: tutto quello che da maggiorenne puoi finalmente fare da solo, in ordine e senza dimenticare niente.</p>
 <div class="stats"><div><b>{totale}</b>voci da spuntare</div><div><b>{len(SEZIONI)}</b>sezioni</div><div><b>4</b>settimane per partire</div></div>
 <ul class="toc">{indice}</ul>
 <p class="nota">Informazioni aggiornate a novembre 2026. Bonus, importi e scadenze cambiano con le leggi di bilancio: prima di fare domanda controlla sempre il sito ufficiale.</p>
</div>
<div class="intro">
 <h2>Le prime mosse</h2>
 <p class="sub">Se non sai da dove partire, segui questo ordine nel primo mese.</p>
 <div class="mosse">{mosse}</div>
 <div class="come"><b>Come usarla.</b> Spunta una voce quando l'hai fatta. Non devi fare tutto subito: alcune cose servono il primo giorno, altre quando prendi la patente, inizi a lavorare o vai a vivere da solo. Qui sotto trovi tutte le {totale} voci divise per argomento.</div>
</div>
{"".join(parti)}
<div class="fine"><b>Nota.</b> Questa checklist è una guida pratica, non una consulenza legale, fiscale o finanziaria. Per investimenti e fondo pensione leggi sempre i documenti ufficiali del prodotto. Per bonus e agevolazioni fanno fede i siti ufficiali: cultura.gov.it, youth.europa.eu, inps.it, agenziaentrate.gov.it, politichegiovanili.gov.it, covip.it, consob.it.</div>
</body></html>'''
open(sys.argv[1], "w").write(HTML)
