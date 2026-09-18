# -*- coding: utf-8 -*-
"""Sintesi esecutiva in 8 pagine — stessi contenuti e numeri del documento lungo."""
import icons as I

STRINGS = {
    "title": "Apex Media — Essenza d'Oriente · Sintesi in 8 pagine",
    "tag": "Performance Marketing Agency",
    "foot_l": "Apex Media · Essenza d'Oriente · Sintesi esecutiva",
    "foot_r": "Settembre 2026",
}

def chip(ic, cls, label):
    return f'<div class="chip"><span class="ico {cls}">{ic}</span><span class="lb">{label}</span></div>'

def row(ic, cls, title, body):
    return (f'<div class="row"><span class="ico {cls}">{ic}</span><div class="bd">'
            f'<h3>{title}</h3><p>{body}</p></div></div>')

def kpi(v, k, d="", vcls=""):
    dd = f'<div class="d">{d}</div>' if d else ""
    return f'<div class="card kpi"><div class="v {vcls}">{v}</div><div class="k">{k}</div>{dd}</div>'

PAGES = []

# ---------------------------------------------------------------- 1 · COVER
PAGES.append({"cls": "cover", "body": f"""
  <div class="hero">
    <div class="eyebrow">Sintesi esecutiva · 8 pagine</div>
    <div class="kicker">Essenza d'Oriente · Centro Olistico · Alessandria</div>
    <h1>Sei mesi di lavoro,<br/>un canale che funziona<br/>e un piano per moltiplicarlo</h1>
    <div class="rule"></div>
    <p class="lead">Tutto quello che conta, in otto pagine: quanti clienti sono arrivati e da dove,
    quanto hanno incassato davvero i canali in euro, cosa è stato costruito in questi sei mesi,
    cosa cambia da settembre e ottobre e fino a dove si può arrivare. Tutti i numeri vengono da
    contatti reali — telefonate, messaggi WhatsApp e prenotazioni completate — mai da
    &laquo;mi piace&raquo; o visualizzazioni.</p>
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
      <div><dt>Versione completa</dt><dd>Documento di 18 pagine, allegato</dd></div>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 2 · NUMERI
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">01 — I numeri</div>
  <h2>Da 13 a 61 clienti al mese</h2>
  <div class="rule"></div>
  <p class="lead">Il risultato più importante di questi sei mesi non è un numero di follower:
  è che oggi esiste un canale che porta clienti veri, ogni giorno, in modo misurabile.
  Sei mesi fa non c'era.</p>
  <div class="g4" style="margin:4mm 0">
    {kpi("61","Clienti nell'ultimo mese","Telefono, WhatsApp, Treatwell","vio")}
    {kpi("55","Clienti portati da Google","Il canale che regge tutto")}
    {kpi("&gt;90%","Quota di clienti da Google","Su tutti i canali attivi")}
    {kpi("5,0&#9733;","Reputazione Google","106 recensioni verificate")}
  </div>
  <table style="margin:4mm 0 3mm">
    <thead><tr><th>Mese</th><th class="n">Google</th><th class="n">Instagram</th>
      <th class="n">Facebook</th><th class="n">TikTok</th><th class="n">Totale</th>
      <th style="width:20%">Andamento</th></tr></thead>
    <tbody>
      <tr><td class="ch">Marzo 2026</td><td class="n">10</td><td class="n">2</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>13</strong></td><td><span class="bar"><i class="grey" style="width:21%"></i></span></td></tr>
      <tr><td class="ch">Aprile 2026</td><td class="n">13</td><td class="n">2</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>16</strong></td><td><span class="bar"><i class="grey" style="width:26%"></i></span></td></tr>
      <tr><td class="ch">Maggio 2026</td><td class="n">17</td><td class="n">2</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>20</strong></td><td><span class="bar"><i class="grey" style="width:33%"></i></span></td></tr>
      <tr><td class="ch">Giugno 2026</td><td class="n">21</td><td class="n">3</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>25</strong></td><td><span class="bar"><i class="grey" style="width:41%"></i></span></td></tr>
      <tr><td class="ch">Luglio 2026</td><td class="n">28</td><td class="n">3</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>32</strong></td><td><span class="bar"><i class="grey" style="width:52%"></i></span></td></tr>
      <tr><td class="ch">Agosto 2026 <span class="pill gold" style="margin-left:1.5mm">Dato misurato</span></td>
          <td class="n">55</td><td class="n">4</td><td class="n">1–2</td><td class="n">0</td>
          <td class="n"><strong>≈ 61</strong></td><td><span class="bar"><i class="gold" style="width:100%"></i></span></td></tr>
    </tbody>
  </table>
  <div class="g2">
    <div class="note vio">
      <h4>Le due leve, separate</h4>
      <p style="margin-bottom:0">Da marzo a luglio <strong>non c'era pubblicità attiva</strong>:
      la crescita da 13 a 32 clienti (<strong>×2,5</strong>) è arrivata dal sito rifatto, dalle otto
      pagine dei trattamenti e dal posizionamento nelle ricerche locali. Poi, il <strong>27 luglio</strong>,
      è partita la campagna Google: in un mese i clienti sono quasi raddoppiati di nuovo, da 32 a 61
      (<strong>×1,9</strong>). Le due leve funzionano insieme: spegnere la seconda riporta i numeri
      indietro di mesi, non di settimane.</p>
    </div>
    <div class="note amber">
      <h4>Come sono stati ricostruiti i primi mesi</h4>
      <p style="margin-bottom:0">Il tracciamento automatico è stato installato a luglio: i numeri da
      marzo a giugno sono una <strong>ricostruzione</strong> da agenda, chiamate e prenotazioni
      registrate, non una misurazione. Lo indichiamo come tale. Agosto invece è misurato uno per uno
      dal sistema — ed è questo il risultato più importante dei primi mesi: oggi Essenza d'Oriente
      sa da dove arrivano i suoi clienti. Prima no.</p>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 3 · CANALI
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">02 — Canali e prenotazioni</div>
  <h2>Da dove arrivano i clienti e come prenotano</h2>
  <div class="rule"></div>
  <p class="lead">La fotografia del mese misurato (27 luglio – 27 agosto 2026), su cui si basa tutta
  la strategia di settembre e ottobre.</p>
  <table style="margin:4mm 0 3mm">
    <thead><tr><th style="width:36%">Canale</th><th class="n">Clienti</th>
      <th style="width:26%">Peso sul totale</th><th class="n">Quota</th><th class="n">Spesa pubblicitaria</th></tr></thead>
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
  <div class="legend" style="margin-bottom:4mm">
    <span><i style="background:linear-gradient(135deg,#E7C568,#C99C2E)"></i>Dalla pubblicità Google — circa 35–40</span>
    <span><i style="background:linear-gradient(135deg,#5B35E8,#1E4FD8)"></i>Dalla ricerca gratuita su Google — circa 15–20</span>
  </div>
  <div class="g2u">
    <div>
      <h4>Come prenotano davvero</h4>
      {row(I.TEL,'i-tel','Chiamata telefonica — il primo canale',
         'Porta più clienti in assoluto, soprattutto da chi trova il centro su Google. Chi cerca &laquo;massaggio Alessandria&raquo; alle 18:30 vuole prenotare adesso: chiama.')}
      {row(I.TW,'i-tw','Treatwell — il canale che lavora di notte',
         'Prenotazioni dal sito senza telefonare. Insieme alla chiamata è la fonte più solida, e funziona anche a centro chiuso o con le mani occupate su un cliente.')}
      {row(I.WA,'i-wa','WhatsApp — il canale di chi è indeciso',
         'Spesso dopo aver visto un contenuto su Instagram. Chi scrive ha una domanda prima di prenotare: il tempo di risposta qui vale quanto il prezzo.')}
    </div>
    <div>
      <div class="note amber" style="margin-bottom:3.4mm">
        <h4>Facebook: 1–2 clienti, ed è una stima</h4>
        <p style="margin-bottom:0">I numeri di Facebook non si leggono con affidabilità dalle
        statistiche del canale. Quello che è certo è che il contributo è marginale.</p>
      </div>
      <div class="note" style="margin-bottom:3.4mm">
        <h4>TikTok: zero clienti</h4>
        <p style="margin-bottom:0">Nessun cliente nel mese analizzato. Il tempo speso qui è tempo
        tolto a Instagram e a Google, dove i clienti invece arrivano.</p>
      </div>
      <div class="note vio">
        <h4>Instagram: 4 clienti a costo zero</h4>
        <p style="margin-bottom:0">Pochi in valore assoluto, ma è il segnale più interessante del
        mese: il pubblico c'è, manca solo volume e costanza di pubblicazione.</p>
      </div>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 4 · FATTURATO
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">03 — Fatturato</div>
  <h2>€1.275 di prenotazioni dal gestionale, in due mesi e mezzo</h2>
  <div class="rule"></div>
  <p class="lead">Non sono stime: è il <strong>report vendite di Treatwell</strong>, scaricabile dal
  gestionale in ogni momento. Periodo <strong>7 luglio – 19 settembre 2026</strong>, cioè da poco
  prima della partenza della campagna Google fino a oggi.</p>
  <div class="g3" style="margin:4mm 0">
    {kpi("&euro;1.275","Fatturato Treatwell","7 luglio &rarr; 19 settembre 2026","vio")}
    {kpi("33","Trattamenti prenotati","Tutti dal gestionale, IVA inclusa")}
    {kpi("&euro;38,6","Scontrino medio","Per trattamento prenotato")}
  </div>
  <div class="g2u">
    <div class="card">
      <h4>Cosa è stato prenotato, trattamento per trattamento</h4>
      <table style="margin-top:1.5mm">
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
      <ul class="ticks">
        <li><strong>7 lug – 28 ago</strong> (53 giorni): €875 → <strong>€16,5 al giorno</strong></li>
        <li><strong>29 ago – 19 set</strong> (22 giorni): €400 → <strong>€18,2 al giorno</strong></li>
      </ul>
      <p style="margin:2mm 0 0"><strong>+10% di ritmo giornaliero</strong> proprio nel mese che tutti
      danno per debole: rientro dalle ferie, spese di scuola tutte insieme, stipendi non a regime.
      Se il ritmo sale in queste condizioni, ottobre — spese assorbite, freddo e contratture — è il
      mese in cui questo lavoro si vede davvero.</p>
    </div>
  </div>
  <div class="note amber" style="margin-top:3.4mm">
    <h4>E quello che non passa da Treatwell?</h4>
    <p style="margin-bottom:0">I €1.275 sono <strong>solo le prenotazioni online</strong>. I clienti
    che arrivano da Google prenotano quasi sempre per telefono o WhatsApp: quel fatturato entra in
    cassa senza passare dal gestionale. La stima prudente è di <strong>circa €420 nel solo mese di
    agosto da Google</strong> e <strong>circa €60 da Instagram</strong>, ricostruiti dai contatti e
    dallo scontrino medio. Il totale reale del periodo è quindi <strong>sensibilmente più alto di
    €1.275</strong>, non più basso.</p>
  </div>
"""})

# ---------------------------------------------------------------- 5 · PATRIMONIO + MOMENTO
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">04 — Il patrimonio costruito</div>
  <h2>Cosa possiede oggi il centro che sei mesi fa non aveva</h2>
  <div class="rule"></div>
  <div class="g2">
    <ul class="ticks">
      <li><strong>Un sito costruito per prenotare:</strong> otto pagine, una per trattamento, con prezzo in chiaro, foto reali e pulsante di prenotazione. Ogni annuncio porta alla pagina giusta</li>
      <li><strong>Un sistema di misurazione che prima non esisteva:</strong> Google Analytics e le conversioni Ads su tutte le pagine. Si sa chi chiama, chi scrive, chi apre Treatwell — e da quale annuncio</li>
    </ul>
    <ul class="ticks">
      <li><strong>Una campagna Google strutturata e già ottimizzata:</strong> sei gruppi di annunci, keyword ripulite, geo-targeting su Alessandria e dintorni, copy testato per un mese</li>
      <li><strong>Una reputazione che vale più della pubblicità:</strong> 5,0★ con 106 recensioni. Nessun concorrente locale può comprarla in due mesi</li>
    </ul>
  </div>
  <div class="note amber" style="margin:3.4mm 0">
    <p style="margin-bottom:0">Questi quattro elementi sono la <strong>parte lenta</strong> del
    processo: il sito si costruisce una volta, il tracciamento si installa una volta, le recensioni si
    accumulano in anni, la campagna si corregge per settimane prima di dare numeri stabili.
    <strong>Tutto questo è già fatto e già pagato.</strong> Quello che viene adesso è la parte veloce,
    quella che moltiplica.</p>
  </div>
  <hr class="hr"/>
  <div class="eyebrow">05 — Il momento</div>
  <h2>Perché questo è il mese sbagliato per fermarsi</h2>
  <div class="rule"></div>
  <ul class="ticks" style="margin-bottom:3.4mm">
    <li><strong>La campagna ha un solo mese di vita e già porta 55 clienti.</strong> Più conversioni registra, più impara a chi mostrare gli annunci: spegnerla ora butta via il mese di dati che la rende più efficiente da qui in avanti</li>
    <li><strong>Il mese misurato è agosto, il peggiore dell'anno.</strong> Quei 61 clienti sono il pavimento, non il tetto: da settembre la domanda per massaggi e trattamenti alla schiena risale strutturalmente</li>
    <li><strong>Settembre–dicembre decide l'anno.</strong> Per un centro olistico è il picco: stress da rientro, regali e buoni regalo, pacchetti. Arrivare a novembre con la macchina già calda non si recupera partendo a novembre</li>
  </ul>
  <div class="g2">
    <div class="card quiet">
      <h4>Se si spegne tutto oggi</h4>
      <ul class="ticks grey">
        <li>Gli annunci si fermano: i 55 clienti/mese da Google spariscono in 24 ore</li>
        <li>Restano i clienti da ricerca gratuita: circa 15–20, non 55</li>
        <li>Il mese di dati raccolti si perde, e i concorrenti prendono quelle ricerche</li>
        <li>Ripartire tra sei mesi significa rifare la fase di apprendimento da capo</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">Se si continua nei prossimi due mesi</h4>
      <ul class="ticks">
        <li>La campagna entra nella fase in cui costa meno e converte di più</li>
        <li>Il budget tolto a Facebook e TikTok va dove è già dimostrato che rende</li>
        <li>Instagram passa da 4 clienti gratuiti a un canale con un piano vero</li>
        <li>Si decide a dicembre <em>con i numeri in mano</em>, non a sensazione</li>
      </ul>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 6 · PIANO
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">06 — Il piano</div>
  <h2>Cosa cambia da settembre e ottobre</h2>
  <div class="rule"></div>
  <div class="g2">
    <div class="card">
      <h4 style="color:var(--violet)">Google — moltiplicare ciò che già funziona</h4>
      <ul class="ticks">
        <li><strong>Più budget sugli annunci che generano chiamate</strong>, non a pioggia: solo sui gruppi che hanno prodotto prenotazioni</li>
        <li><strong>Passaggio a &laquo;Massimizza conversioni&raquo;</strong>: la campagna lavora per portare prenotazioni, non visite</li>
        <li><strong>Estensione di chiamata</strong> attiva solo negli orari in cui c'è chi risponde</li>
        <li><strong>Prezzi e recensioni in ogni annuncio</strong>: meno click curiosi, contatti di qualità più alta</li>
        <li><strong>Remarketing da ottobre</strong>: recuperare chi ha visto i prezzi e non ha prenotato</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">Contenuti, Treatwell e Google Business</h4>
      <ul class="ticks">
        <li><strong>Piano editoriale Instagram</strong> sui trattamenti più cercati su Google, con calendario e non a sensazione</li>
        <li><strong>Un invito a prenotare in ogni contenuto</strong>: chiama, scrivi o prenota su Treatwell</li>
        <li><strong>Scheda Treatwell rifatta</strong>: foto, descrizioni, durate, prezzi e offerte sugli orari infrasettimanali vuoti</li>
        <li><strong>Profilo Google Business presidiato ogni settimana</strong>: post, foto, risposta a tutte le recensioni. È gratis ed è la leva meno sfruttata</li>
      </ul>
    </div>
  </div>
  <div class="g2" style="margin-top:3.4mm">
    <div class="note">
      <h4>Il cliente che torna — da ottobre</h4>
      <ul class="ticks">
        <li><strong>Messaggio di richiamo a 30 giorni</strong> a chi è venuto una volta e non è tornato. Costo per contatto: zero</li>
        <li><strong>Pacchetti e buoni regalo per Natale</strong>, preparati ora per vendere a dicembre invece di improvvisare</li>
        <li><strong>Offerta a tempo sugli orari deboli</strong>: più incasso a parità di costi fissi</li>
      </ul>
    </div>
    <div class="note amber">
      <h4>Facebook cambia ruolo, TikTok va in pausa</h4>
      <p><strong>Facebook non si spegne:</strong> niente campagne a freddo, diventa destinazione del
      remarketing e dei contenuti Instagram ripubblicati. Da lì la crescita prevista da ottobre.</p>
      <p style="margin-bottom:0"><strong>TikTok in pausa:</strong> zero clienti non è sfortuna, è il
      formato. Servono ritmo alto, volti e riprese in prima persona (POV), 4–5 video a settimana per
      due mesi. Finché non c'è chi sta davanti alla camera, ogni ora lì è tolta a Instagram e Google.
      Noi prepariamo format, copioni e montaggio; il centro mette la persona.</p>
    </div>
  </div>
  <div class="g2" style="margin-top:3.4mm">
    <div class="note">
      <h4>Cosa chiediamo al centro</h4>
      <ul class="ticks">
        <li>Foto e brevi video dei trattamenti, anche col telefono</li>
        <li>Segnalarci quando un cliente dice &laquo;vi ho trovati su…&raquo;</li>
        <li>Rispondere ai WhatsApp entro poche ore, e chiedere sempre la recensione Google</li>
      </ul>
    </div>
    <div class="note vio">
      <h4>Cosa facciamo noi</h4>
      <ul class="ticks">
        <li>Gestione completa di campagna Google e remarketing</li>
        <li>Piano contenuti mensile con i testi già pronti</li>
        <li>Treatwell, profilo Google Business e report mensile per canale</li>
      </ul>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 7 · ROADMAP + PROIEZIONE
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">07 — Roadmap</div>
  <h2>Le prossime otto settimane</h2>
  <div class="rule"></div>
  <div class="tl">
    <div class="it next"><div class="w">Settimane 1–2 · Fine settembre</div>
      <h3>Spostamento del budget e passaggio a &laquo;Massimizza conversioni&raquo;</h3>
      <p style="margin-bottom:0">Budget tolto a Facebook e TikTok e riallocato sui gruppi Google che hanno performato. Estensioni di chiamata e prezzo attive. Prima revisione delle keyword che hanno speso senza convertire.</p></div>
    <div class="it next"><div class="w">Settimane 3–4 · Inizio ottobre</div>
      <h3>Scheda Treatwell e profilo Google Business</h3>
      <p style="margin-bottom:0">Descrizioni riscritte, foto nuove, offerte sugli orari deboli. Post settimanali sul profilo Google e risposta a tutte le recensioni.</p></div>
    <div class="it next"><div class="w">Settimane 5–6 · Metà ottobre</div>
      <h3>Piano contenuti a regime e remarketing</h3>
      <p style="margin-bottom:0">Calendario editoriale operativo sui trattamenti più cercati. Partenza del remarketing verso chi ha visitato il sito senza prenotare.</p></div>
    <div class="it next"><div class="w">Settimane 7–8 · Fine ottobre</div>
      <h3>Riattivazione clienti e preparazione del Natale</h3>
      <p style="margin-bottom:0">Primo invio ai clienti fermi da oltre 30 giorni. Pagina buoni regalo e pacchetti pronti per la prima settimana di novembre.</p></div>
  </div>
  <hr class="hr"/>
  <div class="eyebrow">08 — Proiezione</div>
  <h2>Dove possiamo arrivare in sei mesi</h2>
  <div class="rule"></div>
  <p style="margin-bottom:3mm">Google +15% al mese; Instagram accelera da ottobre col piano contenuti;
  Facebook riparte da ottobre nel nuovo ruolo; TikTok resta in pausa.</p>
  <table>
    <thead><tr><th>Mese</th><th class="n">Google</th><th class="n">Instagram</th><th class="n">Facebook</th>
      <th class="n">TikTok</th><th class="n">Totale</th><th style="width:18%">Andamento</th></tr></thead>
    <tbody>
      <tr><td class="ch">Agosto 2026 <span class="pill gold" style="margin-left:1.5mm">Reale</span></td>
          <td class="n">55</td><td class="n">4</td><td class="n">1–2</td><td class="n">0</td>
          <td class="n"><strong>≈ 61</strong></td><td><span class="bar"><i class="gold" style="width:38%"></i></span></td></tr>
      <tr><td class="ch">Settembre 2026</td><td class="n">63</td><td class="n">5</td><td class="n">2</td><td class="n">pausa</td>
          <td class="n"><strong>≈ 70</strong></td><td><span class="bar"><i style="width:43%"></i></span></td></tr>
      <tr><td class="ch">Ottobre 2026</td><td class="n">73</td><td class="n">8</td><td class="n">6</td><td class="n">pausa</td>
          <td class="n"><strong>≈ 87</strong></td><td><span class="bar"><i style="width:54%"></i></span></td></tr>
      <tr><td class="ch">Novembre 2026</td><td class="n">84</td><td class="n">11</td><td class="n">8</td><td class="n">pausa</td>
          <td class="n"><strong>≈ 103</strong></td><td><span class="bar"><i style="width:64%"></i></span></td></tr>
      <tr><td class="ch">Dicembre 2026</td><td class="n">96</td><td class="n">14</td><td class="n">10</td><td class="n">pausa</td>
          <td class="n"><strong>≈ 120</strong></td><td><span class="bar"><i style="width:74%"></i></span></td></tr>
      <tr><td class="ch">Gennaio 2027</td><td class="n">111</td><td class="n">17</td><td class="n">12</td><td class="n">pausa</td>
          <td class="n"><strong>≈ 140</strong></td><td><span class="bar"><i style="width:86%"></i></span></td></tr>
      <tr><td class="ch">Febbraio 2027</td><td class="n">127</td><td class="n">21</td><td class="n">14</td><td class="n">pausa</td>
          <td class="n"><strong>≈ 162</strong></td><td><span class="bar"><i style="width:100%"></i></span></td></tr>
    </tbody>
  </table>
  <div class="note amber" style="margin-top:3mm">
    <p style="margin-bottom:0"><strong>+166% di clienti e circa €2.700 al mese di fatturato tracciato
    a febbraio</strong>, da circa €1.030 di oggi, con un costo per cliente obiettivo sotto i €18.
    È una <strong>proiezione, non una garanzia</strong>: se un mese la crescita non c'è, lo scriviamo
    nel report e cambiamo la leva — esattamente come abbiamo fatto con TikTok.</p>
  </div>
"""})

# ---------------------------------------------------------------- 8 · SCENARI + PROPOSTA
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">09 — Aspettative</div>
  <h2>Quanto si può chiedere a questo lavoro: tre scenari</h2>
  <div class="rule"></div>
  <p class="lead">Ogni obiettivo di fatturato si traduce in un numero preciso di clienti al giorno da
  servire. Questi sono i tre scenari possibili sui prossimi sei mesi.</p>
  <table style="margin:3.4mm 0">
    <thead><tr><th style="width:24%">Scenario</th><th>Cosa cambia</th>
      <th class="n">Clienti/mese<br/>a febbraio</th><th class="n">Clienti<br/>al giorno</th>
      <th class="n">Fatturato<br/>tracciato</th></tr></thead>
    <tbody>
      <tr><td class="ch">A · Tenere la rotta</td><td>Investimento invariato, nessuna nuova attività</td>
          <td class="n">≈ 95</td><td class="n">≈ 3</td><td class="n">≈ €1.500</td></tr>
      <tr><td class="ch">B · Scalata misurata <span class="pill vio" style="margin-left:1.5mm">Consigliato</span></td>
          <td>Il piano di questo documento: più budget su Google, contenuti, remarketing, Treatwell</td>
          <td class="n"><strong>≈ 162</strong></td><td class="n"><strong>≈ 5–6</strong></td><td class="n"><strong>≈ €2.700</strong></td></tr>
      <tr><td class="ch">C · Spinta forte</td><td>Budget Google più che raddoppiato, Meta a pagamento, campagne stagionali</td>
          <td class="n">≈ 240</td><td class="n">≈ 8</td><td class="n">≈ €4.200</td></tr>
    </tbody>
  </table>
  <div class="g2u">
    <div class="note">
      <h4>Dove si sposta il collo di bottiglia</h4>
      <ul class="ticks">
        <li><strong>Fino a 3–4 clienti al giorno</strong> il limite è quanta domanda riusciamo a generare: è lavoro nostro</li>
        <li><strong>Tra 5 e 6</strong> il limite resta la domanda, ma serve agenda organizzata e risposte rapide</li>
        <li><strong>Sopra gli 8</strong> il limite non è più la pubblicità: sono ore, postazioni e mani disponibili in negozio</li>
      </ul>
    </div>
    <div class="note amber">
      <h4>Il calcolo, in chiaro</h4>
      <p style="margin-bottom:0">Con uno scontrino medio di <strong>€38,6</strong>:
      <strong>€2.000 al mese = 52 trattamenti</strong> (≈2 al giorno) ·
      <strong>€5.000 = 129</strong> (≈4 al giorno) · <strong>€10.000 = 259</strong> (≈9 al giorno,
      sette giorni su sette). Da lì in poi nessuna campagna può aiutare: se non c'è chi eroga, il
      cliente che abbiamo portato non diventa fatturato.
      <strong>Possiamo promettere</strong> più contatti qualificati e misurati ogni mese, e di dire
      cosa non funziona anche quando è scomodo. <strong>Non possiamo promettere</strong> una cifra di
      fatturato: dipende anche da quanti clienti il centro riesce a servire.</p>
    </div>
  </div>
  <div class="cta" style="margin-top:3.6mm">
    <h3 style="font-size:11pt;margin-bottom:2mm">La nostra proposta, concreta</h3>
    <ul class="ticks">
      <li><strong>Due mesi di verifica, settembre e ottobre</strong>, con il piano applicato per intero — la nostra raccomandazione è lo scenario B.</li>
      <li><strong>Un report a fine ottobre</strong> con clienti reali per canale, costo per cliente e confronto diretto con agosto.</li>
      <li><strong>Una decisione a novembre presa sui numeri</strong>, non sulle sensazioni. Se i risultati non ci sono, saranno scritti come sono scritti qui quelli di TikTok.</li>
    </ul>
  </div>
  <div class="sign" style="margin-top:4mm">
    <div class="n">Alexander Fania &amp; Federico Delfino</div>
    <div class="s">Apex Media · Performance Marketing Agency · Documento preparato per Essenza d'Oriente</div>
  </div>
"""})
