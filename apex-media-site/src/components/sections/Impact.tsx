"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { PanelBg } from "@/components/ui/PanelBg";
import {
  deferSetup,
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  enterAt,
  refreshSoon,
} from "@/lib/gsap";

/** Il manifesto, già diviso nelle righe che escono una dopo l’altra. L’ultima è quella che si accende per ultima. */
const MANIFESTO = ["Non vendiamo", "visibilità.", "Vendiamo clienti."];

const STEPS = [
  {
    word: "Analizziamo",
    line: "Dove la tua attività perde clienti oggi.",
    label: "Analisi",
  },
  {
    word: "Costruiamo",
    line: "Sito, contenuti e campagne con un solo obiettivo.",
    label: "Strategia",
  },
  {
    word: "Misuriamo",
    line: "Quanto costa ogni contatto. Quanto rende ogni euro.",
    label: "Misura",
  },
];

/** Da 768px in su la sezione è fissata e guidata dallo scroll; sotto, ogni blocco entra quando arriva nello schermo. */
const PINNED = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const STACKED = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";

/** Momenti della timeline fissata: 10 unità in tutto, cioè 4 altezze di schermo (1 unità = 40% di schermo). */
const T = {
  lightA: 0.1,
  lightB: 1.5,
  out: 2.6,
  words: 3.2,
  cross: [4.9, 6.5],
  close: 8.2,
  end: 10,
};

/** Curva del cambio tra una parola e la successiva: uguale per chi esce e per chi entra. */
const CROSS_EASE = "power3.inOut";

/** Posizione di un elemento rispetto a `root`, senza contare le trasformazioni in corso. */
function place(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return {
    cx: x + el.offsetWidth / 2,
    cy: y + el.offsetHeight / 2,
    w: el.offsetWidth,
  };
}

/** "Non vendiamo visibilità. Vendiamo clienti.": solo tipografia, che entra ed esce con lo scroll. */
export function Impact() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      let alive = true;
      const stop = deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root || !contextSafe) return;
          // Le misure di SplitText dipendono dal font: si parte solo quando è caricato
          const start = contextSafe(() => {
            if (!alive) return;
            build(root);
            ScrollTrigger.refresh();
          });
          (document.fonts?.ready ?? Promise.resolve()).then(start);
        },
        90,
      );
      return () => {
        alive = false;
        stop?.();
      };
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="approccio"
      className="relative isolate text-paper"
      data-section="approccio"
      data-impact
      aria-labelledby="impact-title"
    >
      <PanelBg />
      <div className="impact-stage" data-impact-pin>
        <Container className="h-full">
          <div className="impact-heavy" data-impact-heavy>
            {/* Il titolo ha il testo intero in aria-label: i pezzi creati da SplitText sono nascosti ai lettori vocali */}
            <h2
              id="impact-title"
              className="impact-manifesto"
              aria-label="Non vendiamo visibilità. Vendiamo clienti."
              data-impact-manifesto
            >
              {MANIFESTO.map((line, i) => (
                <span
                  key={line}
                  className="impact-line"
                  aria-hidden="true"
                  data-impact-line
                >
                  <span className={i === 2 ? "text-giallo" : undefined}>
                    {line}
                  </span>
                </span>
              ))}
            </h2>

            <p className="sr-only">
              {STEPS.map((s) => `${s.word}. ${s.line}`).join(" ")}
            </p>

            <ol
              className="impact-words"
              role="list"
              aria-hidden="true"
              data-impact-words
            >
              {STEPS.map((s) => (
                <li key={s.word} data-impact-step>
                  <p className="impact-word" data-impact-word>
                    {s.word}
                  </p>
                  <p className="impact-sub" data-impact-sub>
                    {s.line}
                  </p>
                </li>
              ))}
            </ol>

            <p className="impact-final" aria-hidden="true" data-impact-final>
              {STEPS.map((s, i) => (
                <span key={s.word} className="impact-slot" data-impact-slot>
                  <span>
                    <span data-impact-slot-word>{s.word}</span>
                    <span data-impact-slot-dot>.</span>
                  </span>
                  {i < STEPS.length - 1 ? " " : null}
                </span>
              ))}
            </p>
          </div>
        </Container>

        <div className="impact-progress" aria-hidden="true" data-impact-progress>
          <Container className="flex items-center gap-6">
            <span className="relative block h-px flex-1 bg-paper/20">
              <span
                className="absolute inset-0 origin-left scale-x-0 bg-paper"
                data-impact-bar
              />
            </span>
            <p className="label-mono flex shrink-0 items-center gap-3">
              {STEPS.map((s, i) => (
                <span key={s.label} className="contents">
                  {i > 0 ? <span className="opacity-30">·</span> : null}
                  <span className="opacity-30" data-impact-label>
                    {s.label}
                  </span>
                </span>
              ))}
            </p>
          </Container>
        </div>
      </div>
    </section>
  );
}

/** Tutte le animazioni della sezione. Chiamata dentro il contesto di useGSAP: alla pulizia torna tutto com’era. */
function build(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const pin = q("[data-impact-pin]")[0] as HTMLElement;
  const heavy = q("[data-impact-heavy]")[0] as HTMLElement;
  const manifesto = q("[data-impact-manifesto]")[0] as HTMLElement;
  const lines = q("[data-impact-line] > span") as HTMLElement[];
  const steps = q("[data-impact-step]") as HTMLElement[];
  const words = q("[data-impact-word]") as HTMLElement[];
  const subs = q("[data-impact-sub]") as HTMLElement[];
  const mm = gsap.matchMedia();

  mm.add({ pinned: PINNED, stacked: STACKED }, (ctx) => {
    const pinned = Boolean(ctx.conditions?.pinned);

    // Parole del manifesto, lettere delle tre parole grandi, parole delle righe sotto
    const splits = [
      ...lines.map((l) => SplitText.create(l, { type: "words", aria: "none" })),
    ];
    const mWords = splits.flatMap((s) => s.words) as HTMLElement[];
    const wordSplits = words.map((w) =>
      SplitText.create(w, { type: "chars", aria: "none" }),
    );
    const subSplits = subs.map((s) =>
      SplitText.create(s, { type: "words", aria: "none" }),
    );
    const chars = wordSplits.map((s) => s.chars as HTMLElement[]);
    const subWords = subSplits.map((s) => s.words as HTMLElement[]);
    const all = [...splits, ...wordSplits, ...subSplits];

    if (!pinned) {
      // Sotto 768px: niente pin. Il manifesto si accende, le tre parole entrano una per volta quando arrivano
      gsap.fromTo(
        mWords,
        { opacity: 0.15 },
        {
          opacity: 1,
          duration: 0.5,
          stagger: 0.22,
          ease: "none",
          scrollTrigger: enterAt(manifesto, "top 72%"),
        },
      );
      steps.forEach((step, i) => {
        gsap.fromTo(
          chars[i],
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.9,
            stagger: 0.03,
            ease: "power4.out",
            scrollTrigger: enterAt(step, "top 84%"),
          },
        );
        gsap.fromTo(
          subWords[i],
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            delay: 0.4,
            ease: "power3.out",
            scrollTrigger: enterAt(step, "top 84%"),
          },
        );
      });
      return () => all.forEach((s) => s.revert());
    }

    const slots = q("[data-impact-slot] > span") as HTMLElement[];
    const slotWords = q("[data-impact-slot-word]") as HTMLElement[];
    const slotDots = q("[data-impact-slot-dot]") as HTMLElement[];
    const progress = q("[data-impact-progress]")[0] as HTMLElement;
    const bar = q("[data-impact-bar]")[0] as HTMLElement;
    const labels = q("[data-impact-label]") as HTMLElement[];
    const last = words.length - 1;

    const tl = gsap.timeline({ defaults: { ease: "none" } });

    // ---- Fase 1: il manifesto si accende, parola per parola. "Vendiamo clienti." per ultima, poi una pausa
    tl.fromTo(
      mWords.slice(0, 3),
      { opacity: 0.15 },
      { opacity: 1, duration: 0.4, stagger: 0.4 },
      T.lightA,
    ).fromTo(
      mWords.slice(3),
      { opacity: 0.15 },
      { opacity: 1, duration: 0.4, stagger: 0.3 },
      T.lightB,
    );

    // ---- Fase 2: ogni riga esce verso l’alto, tagliata dalla sua maschera
    tl.to(
      lines,
      { yPercent: -110, duration: 0.5, stagger: 0.1, ease: "power3.in" },
      T.out,
    );

    // ---- Fase 3: le tre parole si danno il cambio nello stesso punto
    const enter = (i: number, at: number, ease = "power4.out") => {
      tl.fromTo(
        chars[i],
        { yPercent: 110 },
        { yPercent: 0, duration: 0.5, stagger: 0.03, ease },
        at,
      ).fromTo(
        subWords[i],
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: "power2.out" },
        at + 0.4,
      );
    };
    const leave = (i: number, at: number, ease = "power4.in") => {
      tl.to(
        chars[i],
        { yPercent: -110, duration: 0.5, stagger: 0.03, ease },
        at,
      );
      leaveSub(i, at);
    };
    const leaveSub = (i: number, at: number) =>
      tl.to(
        subWords[i],
        { opacity: 0, y: -10, duration: 0.2, stagger: 0.015, ease: "power2.in" },
        at,
      );
    const light = (i: number, at: number) => {
      tl.to(labels, { opacity: 0.3, duration: 0.15 }, at).to(
        labels[i],
        { opacity: 1, duration: 0.15 },
        at,
      );
    };

    enter(0, T.words);
    light(0, T.words + 0.1);
    T.cross.forEach((at, i) => {
      // Uscita e ingresso sovrapposti, nello stesso istante e con la stessa curva: ogni lettera che sale
      // lascia il posto a quella che arriva da sotto, senza che le due si coprano
      leave(i, at, CROSS_EASE);
      enter(i + 1, at, CROSS_EASE);
      light(i + 1, at + 0.2);
    });

    // Indicatore: compare con la prima parola, la linea si riempie fino alla chiusura
    tl.fromTo(
      progress,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      T.words - 0.1,
    )
      .fromTo(
        bar,
        { scaleX: 0 },
        { scaleX: 1, duration: T.close - T.words },
        T.words,
      )
      .to(progress, { opacity: 0, duration: 0.3 }, T.close + 0.1);

    // ---- Fase 4: "Misuriamo" si rimpicciolisce fino al suo posto nella riga finale, le altre due la raggiungono
    leaveSub(last, T.close);
    tl.to(
      words[last],
      {
        x: () => place(slotWords[last], heavy).cx - place(words[last], heavy).cx,
        y: () => place(slotWords[last], heavy).cy - place(words[last], heavy).cy,
        scale: () =>
          place(slotWords[last], heavy).w / place(words[last], heavy).w,
        duration: 0.9,
        ease: "power3.inOut",
      },
      T.close + 0.1,
    )
      .fromTo(
        slots.slice(0, last),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.5, stagger: 0.15, ease: "power4.out" },
        T.close + 0.55,
      )
      .fromTo(
        slotDots[last],
        { opacity: 0 },
        { opacity: 1, duration: 0.15 },
        T.close + 0.95,
      )
      .to({}, { duration: 0.01 }, T.end - 0.01);

    // La parola della riga finale che viene sostituita da quella grande resta invisibile, ma tiene il posto
    gsap.set(slotWords[last], { visibility: "hidden" });
    // Il CSS tiene nascosti questi blocchi finché gli stati iniziali non sono impostati
    gsap.set(q("[data-impact-words], [data-impact-final], [data-impact-progress]"), {
      visibility: "visible",
    });

    // Peso: il blocco si inclina appena secondo la velocità dello scroll, poi torna dritto
    const skewTo = gsap.quickTo(heavy, "skewX", {
      duration: 0.5,
      ease: "power3",
    });
    const settle = gsap.delayedCall(0.12, () => skewTo(0)).pause();
    const moving = [...lines, ...chars.flat(), ...words, ...slots];

    ScrollTrigger.create({
      animation: tl,
      trigger: pin,
      start: "top top",
      end: "+=400%",
      pin: true,
      scrub: 0.9,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        skewTo(gsap.utils.clamp(-3, 3, self.getVelocity() / -900));
        settle.restart(true);
      },
      // will-change solo mentre la sezione è fissata
      onToggle: (self) =>
        gsap.set(
          moving,
          self.isActive
            ? { willChange: "transform" }
            : { clearProps: "willChange" },
        ),
    });
    refreshSoon();

    return () => {
      settle.kill();
      all.forEach((s) => s.revert());
    };
  });
}
