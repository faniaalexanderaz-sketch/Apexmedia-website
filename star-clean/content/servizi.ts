export type SlugServizio = "pulizie-civili" | "pulizie-industriali" | "trattamento-pavimenti";

export type Servizio = {
  slug: SlugServizio;
  /** valore salvato col lead */
  chiave: "civili" | "industriali" | "pavimenti";
  nome: string;
  nomeBreve: string;
  h1: string;
  metaTitolo: string;
  metaDescrizione: string;
  intro: string;
  /** riga usata in home e nel passo 1 del form */
  riassunto: string;
  /** percorso in /public/foto, es. "/foto/civili.jpg". null = foto reale non ancora consegnata. */
  foto: string | null;
  /** proporzioni della foto: decide il taglio del riquadro in home e nella pagina servizio */
  fotoFormato: "verticale" | "quadrata";
  fotoAlt: string;
  fotoRichiesta: string;
  problema: { titolo: string; testo: string[] };
  soluzione: { titolo: string; testo: string[] };
  incluso: { voce: string; dettaglio: string }[];
};

/*
 * Nota: l'elenco "incluso" descrive lavori tipici del settore.
 * Va riletto e confermato da Jonathan Germanò prima di andare online.
 */
export const servizi: Servizio[] = [
  {
    slug: "pulizie-civili",
    chiave: "civili",
    nome: "Pulizie civili",
    nomeBreve: "Pulizie civili",
    h1: "Pulizie civili ad Alessandria",
    metaTitolo: "Pulizie civili ad Alessandria, preventivo in 24 ore",
    metaDescrizione:
      "Pulizia di condomini, uffici, studi e appartamenti ad Alessandria e provincia. Giorni fissi e preventivo scritto in 24 ore.",
    intro:
      "Condomini, uffici, studi e appartamenti puliti con la frequenza che scegli tu. Il preventivo arriva in 24 ore.",
    riassunto:
      "Condomini, uffici, studi e appartamenti. Passiamo una volta sola o tutte le settimane, decidi tu.",
    foto: "/foto/civili.webp",
    fotoFormato: "verticale",
    fotoAlt: "Pulizia delle vetrate di un ufficio",
    fotoRichiesta: "scala o androne di un condominio appena pulito",
    problema: {
      titolo: "Chi pulisce salta i turni e le scale restano sporche.",
      testo: [
        "Succede spesso. Le persone cambiano ogni mese, al telefono non risponde nessuno e i condòmini chiamano l'amministratore.",
        "In ufficio va allo stesso modo. Passano di corsa e il lunedì trovi i cestini pieni.",
      ],
    },
    soluzione: {
      titolo: "Giorni fissi e un numero a cui risponde il titolare.",
      testo: [
        "Star Clean è un'impresa di famiglia che pulisce ad Alessandria da 30 anni. Concordi giorni e orari con Jonathan Germanò e quelli restano.",
        "Se qualcosa non va, chiami lui e si sistema.",
      ],
    },
    incluso: [
      { voce: "Scale, androni e pianerottoli", dettaglio: "Pavimenti lavati, corrimano, vetri del portone." },
      { voce: "Uffici e studi", dettaglio: "Scrivanie, pavimenti, cestini e zone comuni." },
      { voce: "Bagni", dettaglio: "Sanitari, specchi e pavimenti a ogni passaggio." },
      { voce: "Vetri e infissi", dettaglio: "Vetrate interne ed esterne raggiungibili da terra." },
      { voce: "Pulizie di fondo", dettaglio: "Dopo un trasloco, un cantiere o una lunga chiusura." },
    ],
  },
  {
    slug: "pulizie-industriali",
    chiave: "industriali",
    nome: "Pulizie industriali",
    nomeBreve: "Pulizie industriali",
    h1: "Pulizie industriali ad Alessandria",
    metaTitolo: "Pulizie industriali ad Alessandria, preventivo in 24 ore",
    metaDescrizione:
      "Pulizia di capannoni, magazzini e officine in provincia di Alessandria con lavasciuga e monospazzola. Preventivo scritto in 24 ore.",
    intro:
      "Capannoni, magazzini e officine. Puliamo pavimenti, aree di lavoro e spogliatoi negli orari in cui non ti blocchiamo.",
    riassunto:
      "Capannoni, magazzini e officine. Veniamo negli orari in cui il reparto è fermo.",
    foto: "/foto/industriali.webp",
    fotoFormato: "quadrata",
    fotoAlt: "Lavasciuga uomo a bordo al lavoro in un capannone",
    fotoRichiesta: "lavasciuga al lavoro in un capannone",
    problema: {
      titolo: "Polvere e unto sul pavimento rallentano il lavoro.",
      testo: [
        "In un capannone lo sporco si accumula in fretta. La polvere finisce sulla merce e le macchie d'olio fanno scivolare chi passa con il muletto.",
        "Agli spogliatoi, di solito, non pensa nessuno.",
      ],
    },
    soluzione: {
      titolo: "Entriamo con la lavasciuga e ti lasciamo il pavimento asciutto.",
      testo: [
        "Usiamo macchine fatte per le grandi superfici. Puliamo in fretta e non restano zone bagnate dove si lavora.",
        "Giorni e orari li scegli tu, anche a reparto fermo.",
      ],
    },
    incluso: [
      { voce: "Pavimenti industriali", dettaglio: "Lavaggio con lavasciuga e sgrassaggio delle macchie." },
      { voce: "Corsie e aree di lavoro", dettaglio: "Aspirazione di polveri e residui di lavorazione." },
      { voce: "Uffici interni", dettaglio: "Scrivanie, pavimenti e cestini." },
      { voce: "Spogliatoi e bagni", dettaglio: "Sanitari, docce, armadietti e pavimenti." },
      { voce: "Pulizie straordinarie", dettaglio: "Prima di un'ispezione o dopo lavori in reparto." },
    ],
  },
  {
    slug: "trattamento-pavimenti",
    chiave: "pavimenti",
    nome: "Trattamento pavimenti",
    nomeBreve: "Pavimenti",
    h1: "Trattamento pavimenti ad Alessandria",
    metaTitolo: "Trattamento pavimenti ad Alessandria con monospazzola e lavasciuga",
    metaDescrizione:
      "Lavaggio di fondo dei pavimenti con monospazzola e lavasciuga ad Alessandria e provincia. Cemento, gres, marmo e linoleum. Preventivo in 24 ore.",
    intro:
      "Con monospazzola e lavasciuga togliamo lo sporco entrato nel pavimento. Lavoriamo su cemento, gres, marmo e linoleum.",
    riassunto:
      "Monospazzola e lavasciuga tolgono lo sporco che lo straccio non toglie più.",
    foto: "/foto/pavimenti.webp",
    fotoFormato: "verticale",
    fotoAlt: "Monospazzola su un pavimento in marmo lucidato",
    fotoRichiesta: "monospazzola su un pavimento, metà già trattata",
    problema: {
      titolo: "Lavi tutti i giorni e il pavimento resta grigio.",
      testo: [
        "Lo straccio sposta lo sporco, non lo toglie. Con il tempo si forma una patina che scurisce le fughe e spegne il colore.",
        "Più lavi, più sembra opaco.",
      ],
    },
    soluzione: {
      titolo: "La monospazzola stacca la patina, la lavasciuga la porta via.",
      testo: [
        "Prima sciogliamo lo sporco con il prodotto adatto al materiale. Poi passiamo la monospazzola, che lavora in profondità.",
        "La lavasciuga aspira l'acqua sporca e il pavimento resta asciutto.",
      ],
    },
    incluso: [
      { voce: "Lavaggio di fondo", dettaglio: "Monospazzola con disco scelto in base al materiale." },
      { voce: "Passaggio con lavasciuga", dettaglio: "Aspira l'acqua sporca mentre lava." },
      { voce: "Fughe e angoli", dettaglio: "Rifiniti a mano dove la macchina non arriva." },
      { voce: "Deceratura e nuova protezione", dettaglio: "Togliamo la cera vecchia e stendiamo quella nuova." },
      { voce: "Prova su un punto nascosto", dettaglio: "Prima di partire verifichiamo il prodotto sul tuo pavimento." },
    ],
  },
];

export const servizioDaSlug = (slug: SlugServizio) => servizi.find((s) => s.slug === slug)!;
