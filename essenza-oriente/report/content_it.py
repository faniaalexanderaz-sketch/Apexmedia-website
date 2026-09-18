# -*- coding: utf-8 -*-
import icons as I

STRINGS = {
    "title": "Apex Media — Essenza d'Oriente · Report 6 mesi e piano di crescita",
    "tag": "Performance Marketing Agency",
    "foot_l": "Apex Media · Essenza d'Oriente · Report semestrale",
    "foot_r": "Settembre 2026",
}

def chip(ic, cls, label):
    return f'<div class="chip"><span class="ico {cls}">{ic}</span><span class="lb">{label}</span></div>'

def row(ic, cls, title, body, extra=""):
    return (f'<div class="row"><span class="ico {cls}">{ic}</span><div class="bd">'
            f'<h3>{title}</h3><p>{body}</p>{extra}</div></div>')

def numbox(n, title, body, arrow="", cls=""):
    a = f'<div class="arrowline">&rarr; {arrow}</div>' if arrow else ''
    return (f'<div class="card" style="margin-bottom:4mm"><div class="numbox">'
            f'<span class="nb {cls}">{n}</span><div style="flex:1">'
            f'<h3>{title}</h3><p style="font-size:8.9pt;margin-bottom:0">{body}</p>'
            f'{a}</div></div></div>')

def kpi(v, k, d="", vcls=""):
    dd = f'<div class="d">{d}</div>' if d else ""
    return f'<div class="card kpi"><div class="v {vcls}">{v}</div><div class="k">{k}</div>{dd}</div>'

PAGES = []

# ---------------------------------------------------------------- 1 · COVER
PAGES.append({"cls": "cover", "body": f"""
  <div class="hero">
    <div class="eyebrow">Report semestrale &amp; piano di crescita</div>
    <div class="kicker">Essenza d'Oriente · Centro Olistico · Alessandria</div>
    <h1>Sei mesi di lavoro,<br/>un canale che funziona<br/>e un piano per moltiplicarlo</h1>
    <div class="rule"></div>
    <p class="lead">Questo documento fa due cose. Nella <strong>prima parte</strong> mette in fila
    il lavoro degli ultimi sei mesi: la crescita mese per mese da marzo a oggi, i clienti arrivati da
    ogni canale — Google, Instagram, Facebook, TikTok, Treatwell — e <strong>quanto hanno incassato
    davvero</strong>, in euro. Nella <strong>seconda parte</strong> spiega cosa cambia da settembre e
    ottobre, con le azioni già pronte per moltiplicare i risultati. Tutti i numeri vengono da contatti
    reali — telefonate, messaggi WhatsApp e prenotazioni completate — mai da &laquo;mi piace&raquo; o
    visualizzazioni.</p>
    <div class="chips">
      {chip(I.GOOGLE,'i-google','Google')}
      {chip(I.IG,'i-ig','Instagram')}
      {chip(I.FB,'i-fb','Facebook')}
      {chip(I.TT,'i-tt','TikTok')}
      {chip(I.TW,'i-tw','Treatwell')}
      {chip(I.WA,'i-wa','WhatsApp')}
    </div>
    <div class="meta">
      <div><dt>Cliente</dt><dd>Essenza d'Oriente · Centro Olistico</dd></div>
      <div><dt>A cura di</dt><dd>Alexander Fania &amp; Federico Delfino</dd></div>
      <div><dt>Periodo analizzato</dt><dd>Marzo – Agosto 2026 (6 mesi)</dd></div>
      <div><dt>Piano operativo</dt><dd>Settembre – Ottobre 2026</dd></div>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 2 · SINTESI
PAGES.append({"body": f"""
  <div class="eyebrow">01 — Sintesi</div>
  <h2>I sei mesi in quattro numeri</h2>
  <div class="rule"></div>
  <p class="lead">Il dato più importante di questi sei mesi non è un numero di follower: è che oggi
  esiste un canale che porta clienti veri, ogni giorno, in modo misurabile. Prima non c'era.</p>
  <div class="g4" style="margin:6mm 0 5mm">
    {kpi("61","Clienti nell'ultimo mese","Telefono, WhatsApp, Treatwell","vio")}
    {kpi("55","Clienti portati da Google","Il canale che regge tutto")}
    {kpi("&gt;90%","Quota di clienti da Google","Su tutti i canali attivi")}
    {kpi("5,0&#9733;","Reputazione Google","106 recensioni verificate")}
  </div>
  <div class="note vio">
    <h4>Come leggere questi numeri</h4>
    <p style="margin-bottom:0">Contiamo solo i <strong>contatti reali e verificabili</strong>: una
    telefonata, un messaggio WhatsApp, una prenotazione Treatwell completata. Non contiamo
    visualizzazioni, copertura o &laquo;mi piace&raquo;, perché non pagano l'affitto. Il numero di agosto —
    <strong>circa 61 clienti nel periodo 27 luglio – 27 agosto 2026</strong> — è il primo mese in cui
    la macchina completa (sito + tracciamento + campagna Google) ha lavorato a pieno regime.</p>
  </div>
  <hr class="hr"/>
  <div class="eyebrow">Il punto della situazione</div>
  <h2>Cosa è cambiato in sei mesi</h2>
  <div class="rule"></div>
  <div class="g2">
    <div class="card quiet">
      <h4>Marzo 2026 — punto di partenza</h4>
      <ul class="ticks grey">
        <li>Nessun sito che converte: nessuna pagina per singolo trattamento</li>
        <li>Nessun tracciamento: impossibile sapere da dove arrivava un cliente</li>
        <li>Nessuna pubblicità attiva su Google</li>
        <li>Prenotazioni affidate solo al passaparola e al passaggio in zona</li>
        <li>Social presenti ma senza un invito chiaro a prenotare</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">Agosto 2026 — dove siamo oggi</h4>
      <ul class="ticks">
        <li><strong>Sito completo</strong> con 8 pagine dedicate, una per ogni trattamento</li>
        <li><strong>Tracciamento attivo</strong> (Google Analytics + Google Ads): ogni cliente ha una provenienza</li>
        <li><strong>Campagna Google Ads viva</strong> su 6 gruppi di annunci a intento locale</li>
        <li><strong>Prenotazione Treatwell integrata</strong> direttamente nel sito</li>
        <li><strong>55 clienti al mese da Google</strong>, dato misurato, non stimato</li>
      </ul>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 3 · LA SCALATA
PAGES.append({"body": f"""
  <div class="eyebrow">02 — I sei mesi</div>
  <h2>Come siamo arrivati a 61 clienti al mese</h2>
  <div class="rule"></div>
  <p class="lead">Una campagna che porta clienti non si accende il primo giorno. Nei primi mesi si
  costruisce la struttura, poi si accende il motore, poi si misura e si corregge. Questi sei mesi
  sono esattamente queste tre fasi.</p>
  <div class="tl" style="margin-top:7mm">
    <div class="it done">
      <div class="w">Fase 1 · Marzo – Giugno 2026 · Costruzione</div>
      <h3>Costruire qualcosa su cui si possa fare pubblicità</h3>
      <p style="font-size:9pt">Rifacimento del sito con una pagina dedicata per ognuno degli otto
      trattamenti — riflessologia plantare, tuina shiatsu, gua sha, massaggio con oli essenziali,
      massaggio spa, pedicure, pulizia orecchie, coppettazione. Prezzi in chiaro, orari 7/7 9:30–22:30,
      telefono e WhatsApp sempre a portata di pollice, widget Treatwell integrato.
      Senza queste pagine, ogni euro di pubblicità sarebbe finito su una home generica: click pagati,
      zero prenotazioni.</p>
    </div>
    <div class="it done">
      <div class="w">Fase 2 · Luglio 2026 · Misurazione e lancio</div>
      <h3>Installare gli strumenti e accendere Google Ads</h3>
      <p style="font-size:9pt">Installazione del tag Google su tutte le pagine e delle conversioni su
      Google Ads: da questo momento ogni chiamata, ogni WhatsApp e ogni apertura del widget Treatwell
      diventa un dato. <strong>Il 27 luglio parte la campagna Google Ads</strong>: sei gruppi di
      annunci, uno per trattamento, ciascuno che porta alla sua pagina — non alla home.
      Da qui in poi si smette di indovinare.</p>
    </div>
    <div class="it done">
      <div class="w">Fase 3 · Agosto 2026 · Primo mese pieno</div>
      <h3>Il primo mese con la macchina completa accesa</h3>
      <p style="font-size:9pt">Nel periodo 27 luglio – 27 agosto la campagna porta <strong>circa 55
      clienti verificabili</strong>, Instagram ne porta 4 senza un euro di pubblicità, Facebook 1–2,
      TikTok nessuno. Totale: <strong>circa 61 clienti</strong>. È il primo mese in cui i numeri
      esistono davvero, e sono buoni. Ed è agosto — il mese più lento dell'anno.</p>
    </div>
    <div class="it next">
      <div class="w">Fase 4 · Settembre – Ottobre 2026 · Scalata</div>
      <h3>Moltiplicare ciò che è già dimostrato</h3>
      <p style="font-size:9pt">La parte difficile — costruire la struttura, installare la misurazione,
      trovare il canale che funziona — è finita. Quello che resta è la parte che rende: aumentare
      l'investimento dove il ritorno è già misurato e togliere risorse da dove non rendono.
      Il piano completo è nella seconda parte di questo documento.</p>
    </div>
  </div>
  <div class="note amber" style="margin-top:6mm">
    <h4>Come sono stati ricostruiti i numeri dei primi mesi</h4>
    <p style="margin-bottom:0">Il tracciamento automatico è stato installato a luglio: per i mesi da
    marzo a giugno i numeri riportati in questo documento sono una <strong>ricostruzione</strong>
    basata su agenda, chiamate ricevute e prenotazioni registrate, non una misurazione automatica.
    Li indichiamo come tali. I dati di agosto, invece, sono misurati uno per uno dal sistema — ed è
    questo il risultato più importante dei primi mesi: oggi Essenza d'Oriente sa da dove arrivano i
    suoi clienti. Prima no.</p>
  </div>
"""})

# ---------------------------------------------------------------- 4 · CANALI
PAGES.append({"body": f"""
  <div class="eyebrow">04 — Canali</div>
  <h2>Da dove sono arrivati davvero i clienti</h2>
  <div class="rule"></div>
  <p class="lead">Canale per canale, i clienti reali del mese misurato
  (27 luglio – 27 agosto 2026). Questa è la fotografia su cui si basa tutta la strategia
  di settembre e ottobre.</p>
  <table style="margin:6mm 0 5mm">
    <thead><tr>
      <th style="width:38%">Canale</th><th class="n">Clienti</th>
      <th style="width:30%">Peso sul totale</th><th class="n">Quota</th><th class="n">Spesa pubblicitaria</th>
    </tr></thead>
    <tbody>
      <tr><td class="ch">Google (ricerca + Ads)</td><td class="n"><strong>55</strong></td>
          <td><span class="bar"><i class="gold" style="width:100%"></i></span></td><td class="n">90%</td><td class="n">Sì</td></tr>
      <tr><td class="ch">Instagram (solo organico)</td><td class="n"><strong>4</strong></td>
          <td><span class="bar"><i style="width:7.3%"></i></span></td><td class="n">7%</td><td class="n">€0</td></tr>
      <tr><td class="ch">Facebook (stima)</td><td class="n">1–2</td>
          <td><span class="bar"><i class="grey" style="width:2.7%"></i></span></td><td class="n">2–3%</td><td class="n">€0</td></tr>
      <tr><td class="ch">TikTok</td><td class="n">0</td>
          <td><span class="bar"><i class="grey" style="width:0"></i></span></td><td class="n">0%</td><td class="n">€0</td></tr>
    </tbody>
    <tfoot><tr><td>Totale clienti del mese</td><td class="n">≈ 61</td><td></td><td class="n">100%</td><td class="n"></td></tr></tfoot>
  </table>
  {row(I.GOOGLE,'i-google','Google — 55 clienti · il canale che regge tutto',
     'La campagna partita il 27 luglio ha portato in un mese circa 55 clienti verificabili. È oggi l&#39;unico canale che produce risultati in modo continuo, ogni giorno, e l&#39;unico su cui ogni euro investito è tracciabile fino alla prenotazione.',
     '<div class="legend"><span><i style="background:linear-gradient(135deg,#E7C568,#C99C2E)"></i>Pubblicità Google (Ads) — circa 35–40</span><span><i style="background:linear-gradient(135deg,#5B35E8,#1E4FD8)"></i>Ricerca gratuita su Google — circa 15–20</span></div>')}
  {row(I.IG,'i-ig','Instagram — 4 clienti · a costo zero',
     'Tutti arrivati dai contenuti pubblicati, senza un euro di pubblicità. Sono pochi in valore assoluto, ma sono il segnale più interessante del mese: significa che il pubblico c&#39;è e che manca solo volume e costanza di pubblicazione.')}
  {row(I.FB,'i-fb','Facebook — 1–2 clienti · stima, non dato certo',
     'Ha portato pochissimo. Va detto con precisione: i numeri di Facebook non si leggono con affidabilità dalle statistiche del canale, quindi 1–2 è una stima. Quello che è certo è che il contributo è marginale.')}
  {row(I.TT,'i-tt','TikTok — 0 clienti',
     'Nessun cliente arrivato da questo canale nel mese analizzato. Il tempo speso qui è tempo tolto a Instagram e a Google, dove i clienti invece arrivano.')}
"""})

# ---------------------------------------------------------------- 5 · PRENOTAZIONI
PAGES.append({"body": f"""
  <div class="eyebrow">06 — Prenotazioni</div>
  <h2>Come i clienti prenotano davvero</h2>
  <div class="rule"></div>
  <p class="lead">Chi vede un annuncio su Google o un contenuto su Instagram poi prenota in uno di tre
  modi. Sapere quale pesa di più non è un dettaglio: è ciò che decide dove mettere i pulsanti, cosa
  scrivere negli annunci e quali orari presidiare.</p>
  <div style="margin-top:7mm">
  {row(I.TEL,'i-tel','Chiamata telefonica — il primo canale di prenotazione',
     'Il modo che porta più clienti in assoluto, soprattutto da chi trova il centro cercando su Google o vedendo la pubblicità. Chi cerca &laquo;massaggio Alessandria&raquo; alle 18:30 vuole prenotare adesso: chiama.')}
  {row(I.TW,'i-tw','Prenotazione Treatwell — il canale che lavora di notte',
     'Prenotazioni fatte direttamente dal sito tramite il widget Treatwell, senza bisogno di chiamare. Insieme alla telefonata è la fonte più solida di clienti, e ha un vantaggio decisivo: funziona anche quando il centro è chiuso o le mani sono occupate su un cliente.')}
  {row(I.WA,'i-wa','Messaggio WhatsApp — il canale di chi è indeciso',
     'Contatti arrivati scrivendo direttamente, spesso dopo aver visto un contenuto su Instagram. Chi scrive su WhatsApp di solito ha una domanda prima di prenotare: il tempo di risposta qui vale quanto il prezzo.')}
  </div>
  <hr class="hr"/>
  <div class="note">
    <h4>Perché questo conta più di quanto sembri</h4>
    <p style="margin-bottom:0">Tre modi di prenotare significano tre porte aperte. Se una si chiude —
    il telefono occupato, il messaggio che arriva a centro chiuso — il cliente ne trova un'altra invece
    di andare dal concorrente. Nei prossimi due mesi lavoreremo per <strong>ridurre l'attrito su
    tutte e tre</strong>: risposta automatica su WhatsApp fuori orario, pulsante di prenotazione
    sempre visibile su telefono, e l'estensione chiamata negli annunci Google attiva negli orari in
    cui c'è qualcuno che risponde.</p>
  </div>
"""})

# ---------------------------------------------------------------- 6 · PATRIMONIO
PAGES.append({"body": f"""
  <div class="eyebrow">07 — Il patrimonio costruito</div>
  <h2>Cosa possiede oggi Essenza d'Oriente che sei mesi fa non aveva</h2>
  <div class="rule"></div>
  <p class="lead">Una campagna pubblicitaria si spegne in un clic. Quello che è stato costruito
  attorno, invece, resta e lavora ogni giorno. Questo è l'inventario reale.</p>
  <div class="g2" style="margin-top:6mm">
    {row(I.SITE,'i-ig','Un sito costruito per prenotare, non per essere bello',
       'Otto pagine dedicate, una per trattamento, ognuna con prezzo in chiaro, foto reali e pulsante di prenotazione. Ogni annuncio porta alla pagina giusta: è questa coerenza che trasforma un click in una prenotazione.')}
    {row(I.CHART,'i-tel','Un sistema di misurazione che prima non esisteva',
       'Google Analytics e le conversioni Google Ads installate su tutte le pagine. Oggi si sa quante persone chiamano, quante scrivono, quante aprono Treatwell — e da quale annuncio arrivano.')}
    {row(I.TARGET,'i-google','Una campagna Google Ads strutturata e già ottimizzata',
       'Sei gruppi di annunci a intento locale, keyword pulite dai termini che sprecano budget, geo-targeting su Alessandria e comuni limitrofi, estensioni, sitelink e copy già testati per un mese.')}
    {row(I.STAR,'i-tw','Una reputazione online che vale più della pubblicità',
       '5,0 stelle su Google con 106 recensioni verificate. È l&#39;asset che fa scegliere Essenza d&#39;Oriente rispetto a chi paga gli stessi annunci: nessun concorrente locale può comprarlo in due mesi.')}
  </div>
  <hr class="hr tight"/>
  <div class="note amber">
    <h4>Il punto su cui vale la pena fermarsi un attimo</h4>
    <p>Questi quattro elementi sono costati sei mesi di lavoro e sono la parte lenta del processo.
    Il sito si costruisce una volta. Il tracciamento si installa una volta. Le recensioni si accumulano
    in anni. La campagna si struttura e si corregge per settimane prima di dare numeri stabili.</p>
    <p style="margin-bottom:0"><strong>Tutto questo è già fatto e già pagato.</strong> Quello che viene
    adesso — aumentare il budget su ciò che funziona, pubblicare più contenuti, presidiare Treatwell —
    è la parte veloce, quella che moltiplica. Chi si ferma qui paga il lavoro lento e regala a qualcun
    altro la parte che rende.</p>
  </div>
"""})

# ---------------------------------------------------------------- 7 · PARTE 2
PAGES.append({"cls": "part", "body": f"""
  <div class="wrap">
  <div class="big">02</div>
  <div class="eyebrow">Parte seconda</div>
  <h1>Il piano per settembre e ottobre</h1>
  <div class="rule"></div>
  <p class="lead" style="max-width:140mm">Cosa cambia da adesso, canale per canale: dove aumentiamo
  l'investimento, cosa spegniamo, quali novità entrano in campo e con quali numeri misureremo se
  stanno funzionando. Nessuna promessa generica: azioni datate e verificabili.</p>
  <div style="display:flex;gap:4mm;margin-top:8mm;flex-wrap:wrap">
    <span class="pill vio">Google Ads potenziato</span>
    <span class="pill new">Nuovo · Remarketing</span>
    <span class="pill vio">Instagram: piano contenuti</span>
    <span class="pill new">Nuovo · Scheda Treatwell</span>
    <span class="pill vio">Sito: più prenotazioni</span>
    <span class="pill new">Nuovo · Riattivazione clienti</span>
    <span class="pill gold">Profilo Google presidiato</span>
  </div>
  </div>
"""})

# ---------------------------------------------------------------- 8 · PERCHE ORA
PAGES.append({"body": f"""
  <div class="eyebrow">08 — Il momento</div>
  <h2>Perché questo è il mese sbagliato per fermarsi</h2>
  <div class="rule"></div>
  <p class="lead">Non è una questione di fiducia, è una questione di tempi. Tre fatti misurabili
  dicono che i prossimi due mesi valgono più dei sei appena passati.</p>
  {numbox('01','La campagna ha un solo mese di vita, e già porta 55 clienti',
    'Una campagna Google raccoglie dati per ottimizzarsi: più conversioni registra, più impara a chi mostrare gli annunci e a che ora. I 55 clienti di agosto sono stati fatti da una campagna ancora in fase di apprendimento, con budget minimo. Spegnerla ora significa buttare via il mese di dati che la rende più efficiente da qui in avanti — e ripartire da zero costa di nuovo tempo e soldi.')}
  {numbox('02','Il mese misurato è agosto, cioè il peggiore dell&#39;anno',
    'Agosto è il mese di chiusure, ferie e città vuota. Quei 61 clienti sono stati fatti nel contesto più sfavorevole possibile. Da settembre la domanda per massaggi, riflessologia e trattamenti per la schiena risale strutturalmente: rientro, ripresa del lavoro, freddo, contratture. Lo stesso investimento, in un mese normale, rende di più.')}
  {numbox('03','Settembre–dicembre è il periodo che decide l&#39;anno',
    'Autunno e Natale sono, per un centro olistico, i mesi di picco: trattamenti per lo stress da rientro, regali e buoni regalo, pacchetti. Arrivare a novembre con una campagna già rodata e un profilo Google presidiato è un vantaggio che non si recupera partendo a novembre.')}
  <hr class="hr tight"/>
  <div class="g2">
    <div class="card quiet">
      <h4>Se si spegne tutto oggi</h4>
      <ul class="ticks grey">
        <li>Gli annunci si fermano: i 55 clienti/mese da Google spariscono in 24 ore</li>
        <li>Restano i clienti da ricerca gratuita: circa 15–20, non 55</li>
        <li>Il mese di dati raccolti dalla campagna si perde</li>
        <li>I concorrenti che continuano a investire prendono quelle ricerche</li>
        <li>Ripartire tra sei mesi significa rifare la fase di apprendimento da capo</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">Se si continua nei prossimi due mesi</h4>
      <ul class="ticks">
        <li>La campagna entra nella fase in cui costa meno e converte di più</li>
        <li>Il budget tolto a Facebook e TikTok va dove è già dimostrato che rende</li>
        <li>Instagram passa da 4 clienti gratuiti a un canale con un piano vero</li>
        <li>Si entra nel periodo di picco con la macchina già calda</li>
        <li>Si costruisce il dato per decidere a dicembre <em>con i numeri in mano</em>, non a sensazione</li>
      </ul>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 9 · GOOGLE
PAGES.append({"body": f"""
  <div class="eyebrow">09 — Novità · Google</div>
  <h2>Moltiplicare il canale che già funziona</h2>
  <div class="rule"></div>
  <p class="lead">Google porta oltre il 90% dei clienti. La regola in performance marketing è una
  sola: si spinge dove il ritorno è già misurato. Ecco cosa entra in campo da settembre.</p>
  <div style="margin-top:6mm">
  {row(I.TARGET,'i-google','Aumento del budget sugli annunci che generano chiamate <span class="pill new" style="margin-left:2mm">Priorità 1</span>',
     'Non aumento a pioggia: alziamo l&#39;investimento solo sui gruppi di annunci che hanno prodotto chiamate e prenotazioni nel primo mese — riflessologia, tuina shiatsu e i massaggi decontratturanti. I gruppi che non hanno reso vengono ridotti, non eliminati, e ritestati con copy nuovo.')}
  {row(I.CHART,'i-tel','Passaggio a offerta &laquo;Massimizza conversioni&raquo; <span class="pill new" style="margin-left:2mm">Nuovo</span>',
     'Il primo mese la campagna ha lavorato per portare click al costo più basso. Ora che ci sono abbastanza conversioni registrate, passa a lavorare per portare <strong>prenotazioni</strong>, non visite. È il passaggio che in genere abbassa di più il costo per cliente acquisito.')}
  {row(I.TEL,'i-ig','Estensione di chiamata negli orari di presidio <span class="pill new" style="margin-left:2mm">Nuovo</span>',
     'Il pulsante &laquo;Chiama&raquo; direttamente nell&#39;annuncio, attivo solo nelle fasce in cui c&#39;è qualcuno che risponde. Chi cerca un massaggio la sera decide in trenta secondi: togliamo il passaggio dal sito e lo facciamo chiamare subito.')}
  {row(I.STAR,'i-tw','Estensione prezzo e recensioni in ogni annuncio <span class="pill new" style="margin-left:2mm">Nuovo</span>',
     'Prezzi reali dei quattro trattamenti principali direttamente nell&#39;annuncio, insieme al 5,0&#9733; con 106 recensioni. Riduce i click curiosi che costano e non prenotano, e alza la qualità dei contatti che arrivano.')}
  {row(I.MAPS,'i-fb','Campagna di remarketing: riprendere chi non ha prenotato <span class="pill new" style="margin-left:2mm">Nuovo</span>',
     'Chi visita il sito, guarda i prezzi e non prenota oggi è il contatto più economico da recuperare. Da ottobre parte una piccola campagna che lo riavvicina nei giorni successivi con un&#39;offerta chiara sul trattamento che stava guardando.')}
  </div>
  <div class="note amber" style="margin-top:5mm">
    <h4>E Facebook e TikTok?</h4>
    <p style="margin-bottom:0"><strong>Facebook non si spegne: cambia ruolo.</strong> Smettiamo di
    spendere in campagne a freddo, dove ha dimostrato di non rendere, e lo usiamo per quello in cui
    funziona davvero — destinazione del remarketing Meta e ripubblicazione dei contenuti Instagram.
    È da qui che arriva la crescita prevista su questo canale da ottobre in poi.
    <strong>TikTok va invece messo in pausa</strong>, e nella pagina seguente è spiegato esattamente
    perché e a quali condizioni ha senso riaccenderlo.</p>
  </div>
"""})

# ---------------------------------------------------------------- 10 · SOCIAL E TREATWELL
PAGES.append({"body": f"""
  <div class="eyebrow">10 — Novità · Contenuti e Treatwell</div>
  <h2>Trasformare 4 clienti gratuiti in un canale vero</h2>
  <div class="rule"></div>
  <p class="lead">Instagram ha portato 4 clienti senza un euro di pubblicità e senza un piano.
  È il dato più sottovalutato del report: un canale che funziona già al minimo, e a cui non è mai
  stata data una struttura.</p>
  <div style="margin-top:6mm">
  {row(I.IG,'i-ig','Piano editoriale sui trattamenti più richiesti <span class="pill new" style="margin-left:2mm">Nuovo</span>',
     'Da settembre si pubblica con un calendario, non a sensazione: contenuti costruiti sui trattamenti che generano più ricerche su Google — riflessologia plantare, tuina shiatsu, massaggio decontratturante — perché sappiamo già cosa la gente cerca in zona.')}
  {row(I.WA,'i-wa','Un invito chiaro a prenotare in ogni contenuto <span class="pill new" style="margin-left:2mm">Nuovo</span>',
     'Ogni post e ogni storia finisce con una sola azione possibile: chiama, scrivi su WhatsApp o prenota su Treatwell. Un contenuto senza invito a prenotare è intrattenimento, non marketing.')}
  {row(I.TW,'i-tw','Ottimizzazione completa della scheda Treatwell <span class="pill new" style="margin-left:2mm">Nuovo</span>',
     'Treatwell non è solo un widget sul sito: è un motore di ricerca dove i clienti cercano centri nella loro zona. Sistemiamo foto, descrizioni dei trattamenti, durata e prezzi, e attiviamo le offerte sui trattamenti a bassa occupazione per riempire gli orari vuoti infrasettimanali.')}
  {row(I.MAPS,'i-google','Profilo Google Business presidiato ogni settimana <span class="pill new" style="margin-left:2mm">Nuovo</span>',
     'Post settimanali, foto nuove, risposta a tutte le recensioni e sezione domande e risposte compilata. È gratis, incide direttamente sul posizionamento nelle ricerche locali e sulle richieste di indicazioni stradali — e oggi è la leva meno sfruttata di tutte.')}
  {row(I.TT,'i-tt','TikTok: pausa consapevole, non abbandono <span class="pill" style="margin-left:2mm">In pausa</span>',
     'Zero clienti in un mese non è un caso: è il formato sbagliato. Alla pagina seguente è spiegato cosa servirebbe per riaccenderlo davvero.')}
  </div>
"""})

# ---------------------------------------------------------------- 11 · CLIENTI ESISTENTI
PAGES.append({"body": f"""
  <div class="eyebrow">12 — Novità · Il cliente che torna</div>
  <h2>Il cliente più redditizio è quello già venuto una volta</h2>
  <div class="rule"></div>
  <p class="lead">Finora tutto il lavoro è servito a far entrare gente nuova. Da ottobre partiamo
  anche sul fronte opposto, quello che nessuno presidia: far tornare chi è già stato. Costa quasi
  nulla e vale moltissimo.</p>
  <div class="g3" style="margin:6mm 0 5mm">
    {kpi("≈ 61","Clienti nuovi ogni mese","Da campagna e organico","vio")}
    {kpi("2ª visita","La leva più economica","Nessun costo pubblicitario")}
    {kpi("Autunno","Stagione di picco","Stress, freddo, contratture")}
  </div>
  {numbox('01','Messaggio di richiamo a 30 giorni','Chi è venuto una volta e non è più tornato riceve un messaggio WhatsApp semplice, non pubblicitario: un promemoria del trattamento fatto e la possibilità di riprenotare in due tocchi. Costo per contatto: zero.','Riempie gli orari vuoti senza spendere in pubblicità')}
  {numbox('02','Pacchetti e buoni regalo per il periodo natalizio','Da metà novembre il buono regalo è il prodotto più venduto di qualunque centro benessere. Prepariamo ora la pagina dedicata, i testi, la grafica e la campagna, così a dicembre si vende invece di improvvisare.','Un secondo prodotto da vendere, con margine alto')}
  {numbox('03','Offerta a tempo per riempire gli orari deboli','Gli slot infrasettimanali del mattino sono i più difficili da riempire. Un&#39;offerta dedicata solo a quelle fasce, spinta su Treatwell e su Instagram, trasforma ore vuote in incasso senza abbassare i prezzi di listino.','Più incasso a parità di costi fissi')}
  <div class="note" style="margin-top:2mm">
    <p style="margin-bottom:0" class="small"><strong>Perché ne parliamo adesso:</strong> queste tre
    azioni non hanno bisogno di budget pubblicitario aggiuntivo, ma hanno bisogno di tempo per essere
    preparate. Se si parte a settembre e ottobre, a dicembre sono pronte e vendono. Se si parte a
    dicembre, si arriva tardi.</p>
  </div>
"""})

# ---------------------------------------------------------------- 12 · ROADMAP
PAGES.append({"body": f"""
  <div class="eyebrow">13 — Roadmap</div>
  <h2>Le prossime otto settimane, settimana per settimana</h2>
  <div class="rule"></div>
  <p class="lead">Nessuna azione generica. Ogni settimana ha un intervento preciso e un risultato
  verificabile, così che a fine ottobre si possa giudicare il lavoro sui fatti.</p>
  <div class="tl" style="margin-top:7mm">
    <div class="it next"><div class="w">Settimane 1–2 · Fine settembre</div>
      <h3>Spostamento del budget e passaggio a &laquo;Massimizza conversioni&raquo;</h3>
      <p style="font-size:8.9pt">Budget tolto da Facebook e TikTok e riallocato sui gruppi Google che
      hanno performato. Attivazione dell'estensione di chiamata e dell'estensione prezzo.
      Prima revisione delle keyword che hanno speso senza convertire.</p></div>
    <div class="it next"><div class="w">Settimane 3–4 · Inizio ottobre</div>
      <h3>Scheda Treatwell e profilo Google Business</h3>
      <p style="font-size:8.9pt">Riscrittura completa delle descrizioni dei trattamenti su Treatwell,
      foto nuove, attivazione delle offerte sugli orari deboli. Avvio dei post settimanali sul profilo
      Google e risposta a tutte le recensioni.</p></div>
    <div class="it next"><div class="w">Settimane 5–6 · Metà ottobre</div>
      <h3>Piano contenuti Instagram a regime e remarketing</h3>
      <p style="font-size:8.9pt">Calendario editoriale operativo sui trattamenti più cercati, con
      invito a prenotare in ogni contenuto. Partenza della campagna di remarketing verso chi ha
      visitato il sito senza prenotare.</p></div>
    <div class="it next"><div class="w">Settimane 7–8 · Fine ottobre</div>
      <h3>Riattivazione clienti e preparazione del Natale</h3>
      <p style="font-size:8.9pt">Primo invio dei messaggi di richiamo a chi non torna da oltre 30
      giorni. Preparazione della pagina buoni regalo e dei pacchetti natalizi, pronti a partire dalla
      prima settimana di novembre.</p></div>
  </div>
  <div class="note vio" style="margin-top:6mm">
    <h4>Il report di fine ottobre</h4>
    <p style="margin-bottom:0">A fine ottobre consegneremo un documento identico a questo, con i
    numeri reali dei due mesi: clienti per canale, costo per cliente acquisito e confronto diretto con
    i 61 clienti di agosto. <strong>Se i numeri non sono migliorati, sarà scritto nero su bianco</strong>,
    come abbiamo scritto che TikTok ha portato zero clienti e che il dato di Facebook non è affidabile.</p>
  </div>
"""})

# ---------------------------------------------------------------- 13 · PROIEZIONE
PAGES.append({"body": f"""
  <div class="eyebrow">14 — Obiettivi</div>
  <h2>Dove possiamo arrivare in sei mesi</h2>
  <div class="rule"></div>
  <p class="lead">Proiezione costruita sul dato reale di agosto e sulle azioni di questo piano:
  <strong>Google</strong> cresce del 15% al mese grazie all&#39;aumento di budget e all&#39;ottimizzazione;
  <strong>Instagram</strong> accelera da ottobre, quando il piano contenuti entra a regime;
  <strong>Facebook</strong> riparte da ottobre nel suo nuovo ruolo — remarketing Meta e contenuti
  ripubblicati — e non più come campagna a freddo; <strong>TikTok</strong> resta in pausa fino a
  quando non ci sono le condizioni descritte alla sezione 11.</p>
  <table style="margin:5mm 0 4mm">
    <thead><tr>
      <th>Mese</th><th class="n">Google</th><th class="n">Instagram</th>
      <th class="n">Facebook</th><th class="n">TikTok</th><th class="n">Totale</th><th style="width:17%">Andamento</th>
    </tr></thead>
    <tbody>
      <tr><td class="ch">Agosto 2026 <span class="pill gold" style="margin-left:2mm">Dato reale</span></td>
          <td class="n">55</td><td class="n">4</td><td class="n">1–2</td><td class="n">0</td>
          <td class="n"><strong>≈ 61</strong></td>
          <td><span class="bar"><i class="gold" style="width:38%"></i></span></td></tr>
      <tr><td class="ch">Settembre 2026</td><td class="n">63</td><td class="n">5</td><td class="n">2</td>
          <td class="n">pausa</td><td class="n"><strong>≈ 70</strong></td>
          <td><span class="bar"><i style="width:43%"></i></span></td></tr>
      <tr><td class="ch">Ottobre 2026</td><td class="n">73</td><td class="n">8</td><td class="n">6</td>
          <td class="n">pausa</td><td class="n"><strong>≈ 87</strong></td>
          <td><span class="bar"><i style="width:54%"></i></span></td></tr>
      <tr><td class="ch">Novembre 2026</td><td class="n">84</td><td class="n">11</td><td class="n">8</td>
          <td class="n">pausa</td><td class="n"><strong>≈ 103</strong></td>
          <td><span class="bar"><i style="width:64%"></i></span></td></tr>
      <tr><td class="ch">Dicembre 2026</td><td class="n">96</td><td class="n">14</td><td class="n">10</td>
          <td class="n">pausa</td><td class="n"><strong>≈ 120</strong></td>
          <td><span class="bar"><i style="width:74%"></i></span></td></tr>
      <tr><td class="ch">Gennaio 2027</td><td class="n">111</td><td class="n">17</td><td class="n">12</td>
          <td class="n">pausa</td><td class="n"><strong>≈ 140</strong></td>
          <td><span class="bar"><i style="width:86%"></i></span></td></tr>
      <tr><td class="ch">Febbraio 2027</td><td class="n">127</td><td class="n">21</td><td class="n">14</td>
          <td class="n">pausa</td><td class="n"><strong>≈ 162</strong></td>
          <td><span class="bar"><i style="width:100%"></i></span></td></tr>
    </tbody>
  </table>
  <div class="g3" style="margin:4mm 0">
    {kpi("+166%","Crescita clienti ago &rarr; feb","Da circa 61 a circa 162 al mese","vio")}
    {kpi("&asymp; &euro;2.700","Fatturato tracciato a febbraio","Da circa &euro;1.030 al mese di oggi")}
    {kpi("&lt; &euro;18","Costo per cliente obiettivo","Su campagna Google")}
  </div>
  <div class="note amber">
    <h4>Va detto con chiarezza</h4>
    <p style="margin-bottom:0">Questa è una <strong>proiezione, non una garanzia</strong>. Parte da un
    dato reale (55 clienti da Google ad agosto e circa &euro;1.030 al mese di fatturato tracciato oggi,
    Treatwell più le stime su Google e Instagram) e da ipotesi di crescita dichiarate, verificabili
    mese per mese. La stima di fatturato usa il valore medio per
    cliente registrato ad agosto e resta prudente, perché copre solo ciò che passa da Treatwell e le
    stime su Google e Instagram. Se un mese la crescita non c&#39;è, lo scriveremo nel report e
    cambieremo la leva — esattamente come abbiamo fatto con TikTok.</p>
  </div>
"""})

# ---------------------------------------------------------------- 14 · CHIUSURA
PAGES.append({"body": f"""
  <div class="eyebrow">In chiusura</div>
  <h2>Cosa chiediamo, in una pagina</h2>
  <div class="rule"></div>
  <div class="g3" style="margin:2mm 0 6mm">
    {kpi("6 mesi","Di lavoro già fatto","Sito, dati, campagna, reputazione","vio")}
    {kpi("1 mese","Di campagna misurata","55 clienti da Google, ad agosto")}
    {kpi("2 mesi","Per moltiplicarlo","Settembre e ottobre")}
  </div>
  <p class="lead">I primi sei mesi sono serviti a costruire e a scoprire cosa funziona. La risposta
  è arrivata chiara: <strong>Google porta oltre il 90% dei clienti, Instagram ha un potenziale non
  sfruttato, Facebook e TikTok non rendono</strong>. Adesso sappiamo esattamente dove mettere ogni euro
  e ogni ora di lavoro — ed è la prima volta in cui lo sappiamo con i numeri in mano.</p>
  <p class="lead">Fermarsi adesso non farebbe risparmiare: farebbe perdere un mese di dati che rende la
  campagna più efficiente, i 55 clienti mensili che si spengono in ventiquattr'ore, e il periodo
  dell'anno in cui un centro olistico incassa di più. Il lavoro lento è fatto e pagato.
  Quello che resta è la parte che moltiplica.</p>
  <div class="cta" style="margin-top:6mm">
    <h3 style="font-size:12pt;margin-bottom:3mm">La nostra proposta, concreta</h3>
    <ul class="ticks" style="font-size:9.2pt">
      <li><strong>Due mesi di verifica, settembre e ottobre</strong>, con il piano descritto in questo documento applicato per intero.</li>
      <li><strong>Un report a fine ottobre</strong> identico a questo: clienti reali per canale, costo per cliente, confronto diretto con agosto.</li>
      <li><strong>Una decisione a novembre presa sui numeri</strong>, non sulle sensazioni. Se i risultati non ci sono, saranno scritti come sono scritti qui i risultati di TikTok.</li>
    </ul>
  </div>
  <p class="small" style="margin-top:6mm">Per qualsiasi domanda su questo documento, sui numeri o sul
  piano, siamo disponibili a rivedere tutto insieme, punto per punto, anche di persona.</p>
  <div class="sign">
    <div class="n">Alexander Fania &amp; Federico Delfino</div>
    <div class="s">Apex Media · Performance Marketing Agency</div>
    <div class="s">Documento preparato per Essenza d'Oriente · Centro Olistico, Alessandria</div>
  </div>
"""})

# ================================================================
# REVISIONE — crescita storica, fatturato tracciato, TikTok in pausa
# ================================================================

PAGE_CRESCITA = {"body": f"""
  <div class="eyebrow">03 — Crescita</div>
  <h2>Da 13 a 61 clienti al mese</h2>
  <div class="rule"></div>
  <p class="lead">La curva completa dei sei mesi, canale per canale. Due salti diversi:
  il primo, da marzo a luglio, prodotto dal sito e dalle pagine dei trattamenti;
  il secondo, ad agosto, prodotto dalla campagna Google.</p>
  <table style="margin:6mm 0 4mm">
    <thead><tr>
      <th>Mese</th><th class="n">Google</th><th class="n">Instagram</th><th class="n">Facebook</th>
      <th class="n">TikTok</th><th class="n">Totale</th><th style="width:19%">Andamento</th>
    </tr></thead>
    <tbody>
      <tr><td class="ch">Marzo 2026</td><td class="n">10</td><td class="n">2</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>13</strong></td>
          <td><span class="bar"><i class="grey" style="width:21%"></i></span></td></tr>
      <tr><td class="ch">Aprile 2026</td><td class="n">13</td><td class="n">2</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>16</strong></td>
          <td><span class="bar"><i class="grey" style="width:26%"></i></span></td></tr>
      <tr><td class="ch">Maggio 2026</td><td class="n">17</td><td class="n">2</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>20</strong></td>
          <td><span class="bar"><i class="grey" style="width:33%"></i></span></td></tr>
      <tr><td class="ch">Giugno 2026</td><td class="n">21</td><td class="n">3</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>25</strong></td>
          <td><span class="bar"><i class="grey" style="width:41%"></i></span></td></tr>
      <tr><td class="ch">Luglio 2026</td><td class="n">28</td><td class="n">3</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>32</strong></td>
          <td><span class="bar"><i class="grey" style="width:52%"></i></span></td></tr>
      <tr><td class="ch">Agosto 2026 <span class="pill gold" style="margin-left:2mm">Dato misurato</span></td>
          <td class="n">55</td><td class="n">4</td><td class="n">1–2</td>
          <td class="n">0</td><td class="n"><strong>≈ 61</strong></td>
          <td><span class="bar"><i class="gold" style="width:100%"></i></span></td></tr>
    </tbody>
  </table>
  <div class="g3" style="margin:5mm 0">
    {kpi("+369%","Crescita marzo → agosto","Da 13 a circa 61 clienti/mese","vio")}
    {kpi("×2,5","Effetto sito e pagine","Marzo → luglio, senza pubblicità")}
    {kpi("×1,9","Effetto campagna Google","Luglio → agosto, in un mese")}
  </div>
  <div class="note vio">
    <h4>Le due leve, separate</h4>
    <p style="margin-bottom:0">Da marzo a luglio non c&#39;era pubblicità attiva: la crescita da 13 a 32
    clienti è arrivata dal sito rifatto, dalle otto pagine dei trattamenti e dal posizionamento nelle
    ricerche locali. <strong>Poi, il 27 luglio, è partita la campagna Google</strong>: in un solo mese
    i clienti sono quasi raddoppiati di nuovo, da 32 a 61. Le due leve funzionano insieme —
    ed è per questo che spegnere la seconda riporta i numeri indietro di mesi, non di settimane.</p>
  </div>
"""}

PAGE_FATTURATO = {"body": f"""
  <div class="eyebrow">05 — Fatturato tracciato</div>
  <h2>€1.275 di prenotazioni dal gestionale, in due mesi e mezzo</h2>
  <div class="rule"></div>
  <p class="lead">Questi non sono numeri stimati: sono il <strong>report vendite di Treatwell</strong>,
  scaricabile dal gestionale in ogni momento. Coprono il periodo <strong>7 luglio – 19 settembre 2026</strong>,
  cioè da poco prima della partenza della campagna Google fino a oggi.</p>
  <div class="g3 compact" style="margin:5mm 0 4mm">
    {kpi("&euro;1.275","Fatturato Treatwell","7 luglio &rarr; 19 settembre 2026","vio")}
    {kpi("33","Trattamenti prenotati","Tutti dal gestionale, IVA inclusa")}
    {kpi("&euro;38,6","Scontrino medio","Per trattamento prenotato")}
  </div>
  <div class="g2u">
    <div class="card">
      <h4>Cosa è stato prenotato, trattamento per trattamento</h4>
      <table style="margin-top:2mm">
        <thead><tr><th>Trattamento</th><th class="n">Q.tà</th><th class="n">Importo</th></tr></thead>
        <tbody>
          <tr><td class="ch">Massaggio con oli (cervicale, schiena…)</td><td class="n">11</td><td class="n">€420</td></tr>
          <tr><td class="ch">Riflessologia plantare</td><td class="n">8</td><td class="n">€275</td></tr>
          <tr><td class="ch">Pedicure</td><td class="n">8</td><td class="n">€280</td></tr>
          <tr><td class="ch">Massaggio spa</td><td class="n">2</td><td class="n">€150</td></tr>
          <tr><td class="ch">Massaggio shiatsu</td><td class="n">2</td><td class="n">€100</td></tr>
          <tr><td class="ch">Coppettazione</td><td class="n">1</td><td class="n">€25</td></tr>
          <tr><td class="ch">Pulizia orecchie</td><td class="n">1</td><td class="n">€25</td></tr>
        </tbody>
        <tfoot><tr><td>Somma totale</td><td class="n">33</td><td class="n">€1.275</td></tr></tfoot>
      </table>
    </div>
    <div class="note vio">
      <h4>Settembre non sta rallentando: sta accelerando</h4>
      <p>Confrontando i due periodi dello stesso report:</p>
      <ul class="ticks" style="font-size:8.6pt">
        <li><strong>7 lug – 28 ago</strong> (53 giorni): €875 → <strong>€16,5 al giorno</strong></li>
        <li><strong>29 ago – 19 set</strong> (22 giorni): €400 → <strong>€18,2 al giorno</strong></li>
      </ul>
      <p style="margin:2.5mm 0 0"><strong>+10% di ritmo giornaliero</strong> proprio nel mese che tutti
      danno per debole: rientro dalle ferie, spese di scuola e attività tutte insieme, stipendi non
      ancora a regime. Se il ritmo sale in queste condizioni, ottobre — con le spese assorbite, il
      freddo e le contratture — è il mese in cui questo lavoro si vede davvero.</p>
    </div>
  </div>
  <div class="note amber" style="margin-top:4mm">
    <h4>E quello che non passa da Treatwell?</h4>
    <p style="margin-bottom:0">I €1.275 sono <strong>solo le prenotazioni online</strong>. I clienti che
    arrivano da Google prenotano quasi sempre per telefono o WhatsApp: quel fatturato entra in cassa
    senza passare dal gestionale, quindi non compare in questo report. La stima prudente è di
    <strong>circa €420 nel solo mese di agosto da Google</strong> e <strong>circa €60 da Instagram</strong>,
    ricostruiti dal numero di contatti e dallo scontrino medio. Il totale reale del periodo è quindi
    <strong>sensibilmente più alto di €1.275</strong>, non più basso.</p>
  </div>
"""}

PAGES.insert(3, PAGE_CRESCITA)
PAGES.insert(5, PAGE_FATTURATO)

# ---------------------------------------------------------------- TikTok + collaborazione
PAGE_TIKTOK = {"body": f"""
  <div class="eyebrow">11 — TikTok</div>
  <h2>Perché TikTok va messo in pausa (e cosa serve per riaccenderlo)</h2>
  <div class="rule"></div>
  <p class="lead">Zero clienti in un mese non è sfortuna e non è l&#39;algoritmo: è il formato.
  Metterlo in pausa è una scelta tecnica, non una resa.</p>
  <div class="g2" style="margin-top:5mm">
    <div class="card quiet">
      <h4>Perché non funziona oggi</h4>
      <ul class="ticks grey">
        <li><strong>Sono video di massaggi senza volto.</strong> Mani che lavorano su una schiena: nessuno resta a guardare oltre i primi due secondi</li>
        <li><strong>Manca il ritmo.</strong> TikTok premia tagli veloci e movimento: un video lento viene mostrato a poche persone e poi fermato</li>
        <li><strong>Manca una persona davanti alla camera.</strong> Su TikTok funzionano le facce, la voce e i POV — non le riprese anonime del lettino</li>
        <li><strong>Manca la frequenza.</strong> Il canale richiede pubblicazioni molto ravvicinate per essere spinto: pubblicare ogni tanto equivale a non pubblicare</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">Cosa servirebbe per riaccenderlo</h4>
      <ul class="ticks">
        <li><strong>Una persona disposta a stare davanti alla camera</strong> con continuità: è la condizione senza la quale tutto il resto non serve</li>
        <li><strong>Formato POV</strong>: «POV: entri da noi con il mal di schiena da tre settimane», girato dal punto di vista del cliente</li>
        <li><strong>Ritmo alto</strong>: 15–25 secondi, tagli ogni 1–2 secondi, testo grande in sovrimpressione, audio del momento</li>
        <li><strong>Almeno 4–5 video a settimana</strong> per due mesi consecutivi, altrimenti il canale non riparte</li>
      </ul>
    </div>
  </div>
  <div class="note amber" style="margin-top:4mm">
    <h4>La decisione, detta come la pensiamo</h4>
    <p style="margin-bottom:0">Finché non c&#39;è qualcuno disposto a girare con quella frequenza e a
    farsi vedere in volto, ogni ora spesa su TikTok è un&#39;ora tolta a Instagram e a Google, dove i
    clienti arrivano davvero. <strong>Lo mettiamo in pausa adesso</strong> e lo riapriamo quando la
    condizione c&#39;è: noi prepariamo format, copioni e montaggio, il centro mette la persona davanti
    alla camera.</p>
  </div>
  <hr class="hr" style="margin:4mm 0"/>
  <div class="g2">
    <div class="note">
      <h4>Cosa chiediamo al centro</h4>
      <ul class="ticks" style="font-size:8.6pt">
        <li>Foto e brevi video dei trattamenti, anche fatti col telefono</li>
        <li>Segnalarci quando un cliente dice &laquo;vi ho trovati su…&raquo;</li>
        <li>Rispondere ai WhatsApp entro poche ore negli orari di apertura</li>
        <li>Chiedere la recensione Google a fine trattamento, sempre</li>
      </ul>
    </div>
    <div class="note vio">
      <h4>Cosa facciamo noi</h4>
      <ul class="ticks" style="font-size:8.6pt">
        <li>Gestione completa della campagna Google e del remarketing</li>
        <li>Piano contenuti mensile e testi già pronti da pubblicare</li>
        <li>Ottimizzazione scheda Treatwell e profilo Google Business</li>
        <li>Report mensile con i clienti reali per canale, come questo</li>
      </ul>
    </div>
  </div>
"""}
PAGES.insert(12, PAGE_TIKTOK)

# ---------------------------------------------------------------- Aspettative di fatturato
PAGE_ASPETTATIVE = {"body": f"""
  <div class="eyebrow">15 — Aspettative</div>
  <h2>Quanto si può chiedere a questo lavoro: tre scenari</h2>
  <div class="rule"></div>
  <p class="lead">Ogni obiettivo di fatturato si traduce in un numero preciso di clienti al giorno da
  servire. Questi sono i tre scenari possibili sui prossimi sei mesi, con quello che comporta ciascuno.</p>
  <table style="margin:5mm 0 4mm">
    <thead><tr>
      <th style="width:26%">Scenario</th><th>Cosa cambia</th><th class="n">Clienti/mese<br/>a febbraio</th>
      <th class="n">Clienti<br/>al giorno</th><th class="n">Fatturato<br/>tracciato</th>
    </tr></thead>
    <tbody>
      <tr><td class="ch">A · Tenere la rotta</td>
          <td>Investimento pubblicitario invariato, nessuna nuova attività</td>
          <td class="n">≈ 95</td><td class="n">≈ 3</td><td class="n">≈ €1.500</td></tr>
      <tr><td class="ch">B · Scalata misurata <span class="pill vio" style="margin-left:2mm">Consigliato</span></td>
          <td>Il piano di questo documento: più budget su Google, contenuti, remarketing, Treatwell</td>
          <td class="n"><strong>≈ 162</strong></td><td class="n"><strong>≈ 5–6</strong></td>
          <td class="n"><strong>≈ €2.700</strong></td></tr>
      <tr><td class="ch">C · Spinta forte</td>
          <td>Budget Google più che raddoppiato, Meta a pagamento, campagne stagionali</td>
          <td class="n">≈ 240</td><td class="n">≈ 8</td><td class="n">≈ €4.200</td></tr>
    </tbody>
  </table>
  <div class="g2u">
    <div class="note">
      <h4>Dove si sposta il collo di bottiglia</h4>
      <ul class="ticks" style="font-size:8.6pt">
        <li><strong>Fino a 3–4 clienti al giorno</strong> il limite è quanta domanda riusciamo a generare: è lavoro nostro, e lo sappiamo fare</li>
        <li><strong>Tra 5 e 6 al giorno</strong> il limite resta la domanda, ma serve un'agenda organizzata e risposte rapide a telefono e WhatsApp</li>
        <li><strong>Sopra gli 8 al giorno</strong> il limite non è più la pubblicità: sono le ore di apertura, le postazioni e le mani disponibili in negozio</li>
      </ul>
    </div>
    <div class="note amber">
      <h4>Il calcolo, in chiaro</h4>
      <p style="margin-bottom:0">Con uno scontrino medio di <strong>€38,6</strong>, ogni obiettivo di
      fatturato è un numero di trattamenti da erogare: <strong>€2.000 al mese = 52 trattamenti</strong>
      (≈2 al giorno) · <strong>€5.000 = 129</strong> (≈4 al giorno) · <strong>€10.000 = 259</strong>
      (≈9 al giorno, sette giorni su sette). Da lì in poi nessuna campagna può aiutare: se non c'è chi
      eroga il trattamento, il cliente che abbiamo portato non diventa fatturato.</p>
    </div>
  </div>
  <div class="cta" style="margin-top:4mm;padding:5mm">
    <h3 style="font-size:11.5pt;margin-bottom:2.5mm">Cosa possiamo promettere e cosa no</h3>
    <div class="g2">
      <ul class="ticks" style="font-size:8.8pt">
        <li><strong>Possiamo promettere</strong> di portare più contatti qualificati ogni mese e di misurarli uno per uno</li>
        <li><strong>Possiamo promettere</strong> di dirvi ogni mese cosa ha funzionato e cosa no, anche quando la risposta è scomoda</li>
      </ul>
      <ul class="ticks grey" style="font-size:8.8pt">
        <li><strong>Non possiamo promettere</strong> una cifra di fatturato: dipende anche da quanti clienti il centro riesce a servire</li>
        <li><strong>Non possiamo promettere</strong> risultati oltre la capacità operativa: per superare lo scenario C servono più ore o più personale</li>
      </ul>
    </div>
  </div>
  <p class="small" style="margin-top:3.5mm">La nostra raccomandazione è lo <strong>scenario B</strong>:
  è l'unico in cui la crescita è sostenuta dai dati che già abbiamo e il costo per cliente resta sotto
  controllo. Lo scenario C è raggiungibile, ma va deciso insieme.</p>
"""}
PAGES.insert(16, PAGE_ASPETTATIVE)
