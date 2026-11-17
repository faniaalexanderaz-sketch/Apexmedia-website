"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { PanelBg } from "@/components/ui/PanelBg";
import { campaign } from "@/data/campaign";
import {
  deferSetup,
  gsap,
  useGSAP,
  MEDIA,
  EASE,
  enterAt,
  splitLinesIn,
  countUp,
} from "@/lib/gsap";

const W = 640;
const H = 240;
const PAD = 6;

/** Punti del grafico e curva morbida che li attraversa (Catmull-Rom → Bézier). */
function chart(values: number[]) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => ({
    x: (i / Math.max(1, values.length - 1)) * W,
    y: H - PAD - (v / max) * (H - PAD * 2),
  }));
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return { d, area: `${d} L ${W} ${H} L 0 ${H} Z`, last: pts[pts.length - 1] };
}

const fmt = (v: number, decimals: number) =>
  new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);

/** "Ogni euro investito, misurato.": un pannello in stile report che si compone mentre scorri. */
export function Campaigns() {
  const ref = useRef<HTMLElement>(null);
  const { d, area, last } = chart(campaign.line);
  const barMax = Math.max(...campaign.bars.map((b) => b.value), 1);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const root = ref.current;
          if (!root) return;
          const q = gsap.utils.selector(root);
          const panel = q("[data-camp-panel]")[0];
          const mm = gsap.matchMedia();
          mm.add([MEDIA.desktop, MEDIA.mobile], () => {
            const title = q("h2")[0];
            const split = title ? splitLinesIn(title) : null;
            gsap.from(q("[data-camp-fade]"), {
              opacity: 0,
              y: 16,
              duration: 0.7,
              stagger: 0.08,
              scrollTrigger: enterAt(root),
            });
            gsap.from(panel, {
              opacity: 0,
              y: 40,
              duration: 0.9,
              ease: EASE.enter,
              scrollTrigger: enterAt(panel, "top 88%"),
            });

            // Contatori: salgono una volta sola, quando il pannello entra
            (q("[data-number]") as HTMLElement[]).forEach((el) =>
              countUp(el, panel, "top 78%"),
            );

            // La linea si disegna con lo scroll (stroke-dashoffset), l’area sotto compare alla fine
            const draw = gsap.timeline({
              defaults: { ease: EASE.scrub },
              scrollTrigger: {
                trigger: q("[data-camp-chart]")[0],
                start: "top 82%",
                end: "top 28%",
                scrub: 0.6,
              },
            });
            draw
              .fromTo(
                q("[data-camp-line]"),
                { strokeDashoffset: 1.05 },
                { strokeDashoffset: 0, duration: 1 },
                0,
              )
              .fromTo(
                q("[data-camp-area]"),
                { opacity: 0 },
                { opacity: 1, duration: 0.4 },
                0.6,
              )
              .fromTo(
                q("[data-camp-dot]"),
                { opacity: 0 },
                { opacity: 1, duration: 0.1 },
                0.9,
              );

            // Le barre crescono da sinistra, una dopo l’altra
            gsap.fromTo(
              q("[data-camp-bar]"),
              { scaleX: 0 },
              {
                scaleX: (i) => campaign.bars[i].value / barMax,
                duration: 1.1,
                ease: EASE.title,
                stagger: 0.1,
                scrollTrigger: enterAt(q("[data-camp-bars]")[0], "top 82%"),
              },
            );

            return () => {
              split?.revert();
            };
          });
        },
        150,
      ),
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="campagne"
      className="relative isolate py-20 text-paper lg:py-32"
      data-section="campagne"
    >
      <PanelBg />
      <Container>
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-8">
            <p className="label-mono text-paper/60" data-camp-fade>
              Campagne che crescono
            </p>
            <h2 className="h-display mt-6 text-[clamp(2.25rem,0.9rem+5.2vw,5.5rem)] text-paper">
              Ogni euro investito, misurato.
            </h2>
          </div>
          <p
            className="max-w-[36ch] text-[17px] leading-relaxed text-paper/75 md:text-lg lg:col-span-4 lg:pb-2"
            data-camp-fade
          >
            Ogni mese ricevi un report così: quanti contatti sono arrivati, da
            dove, e quanto è costato ognuno.
          </p>
        </div>

        <div
          data-camp-panel
          className="mt-12 rounded-lg border border-paper/15 bg-paper/[0.04] lg:mt-20"
        >
          {/* Barra del pannello */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-paper/15 px-5 py-4 lg:px-8">
            <p className="label-mono text-paper/70">
              {campaign.name}
              <span className="mx-2 text-paper/30" aria-hidden="true">
                /
              </span>
              {campaign.period}
            </p>
            <p
              className={`label-mono rounded-sm border px-2.5 py-1.5 ${
                campaign.isRealData
                  ? "border-giallo/60 text-giallo"
                  : "border-paper/25 text-paper/70"
              }`}
              data-camp-label={campaign.isRealData ? "reale" : "esempio"}
            >
              {campaign.isRealData
                ? campaign.realLabel
                : campaign.placeholderLabel}
            </p>
          </div>

          {/* Contatori */}
          <dl className="grid grid-cols-1 sm:grid-cols-3">
            {campaign.kpis.map((k, i) => (
              <div
                key={k.label}
                className={`px-5 py-7 lg:px-8 lg:py-10 ${
                  i > 0 ? "border-t border-paper/15 sm:border-l sm:border-t-0" : ""
                }`}
              >
                <dt className="label-mono text-paper/60">{k.label}</dt>
                <dd className="mt-4 font-display text-[clamp(2.75rem,1.5rem+3.4vw,5rem)] font-bold leading-none tracking-tightest tabular-nums">
                  {k.prefix}
                  <span data-number={k.value} data-decimals={k.decimals}>
                    {fmt(k.value, k.decimals)}
                  </span>
                  {k.suffix}
                </dd>
              </div>
            ))}
          </dl>

          {/* Grafico e canali */}
          <div className="grid grid-cols-1 border-t border-paper/15 lg:grid-cols-12">
            <figure
              className="px-5 py-7 lg:col-span-8 lg:px-8 lg:py-10"
              data-camp-chart
            >
              <figcaption className="label-mono text-paper/60">
                {campaign.lineLabel}
              </figcaption>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="mt-6 block h-auto w-full overflow-visible"
                role="img"
                aria-label={`${campaign.lineLabel}: andamento in crescita nel periodo`}
              >
                {[0.25, 0.5, 0.75, 1].map((f) => (
                  <line
                    key={f}
                    x1="0"
                    x2={W}
                    y1={H * f - 0.5}
                    y2={H * f - 0.5}
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeWidth="1"
                  />
                ))}
                <path
                  d={area}
                  fill="currentColor"
                  fillOpacity="0.06"
                  data-camp-area
                />
                <path
                  d={d}
                  fill="none"
                  stroke="var(--giallo)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  // Il vuoto più lungo del tratto evita il puntino del terminale tondo quando la linea è ancora nascosta
                  strokeDasharray="1 1.2"
                  data-camp-line
                />
                <circle
                  cx={last.x}
                  cy={last.y}
                  r="6"
                  fill="var(--giallo)"
                  data-camp-dot
                />
              </svg>
              <p className="label-mono mt-4 flex justify-between text-paper/50">
                <span>{campaign.lineStart}</span>
                <span>{campaign.lineEnd}</span>
              </p>
            </figure>

            <div
              className="border-t border-paper/15 px-5 py-7 lg:col-span-4 lg:border-l lg:border-t-0 lg:px-8 lg:py-10"
              data-camp-bars
            >
              <p className="label-mono text-paper/60">{campaign.barsLabel}</p>
              <ul className="mt-6 space-y-6" role="list">
                {campaign.bars.map((b) => (
                  <li key={b.label}>
                    <p className="flex items-baseline justify-between gap-4 text-[16px]">
                      <span className="text-paper/85">{b.label}</span>
                      <span className="font-mono text-[13px] tabular-nums text-paper/70">
                        {b.value}
                      </span>
                    </p>
                    <span className="mt-2.5 block h-[6px] bg-paper/10">
                      <span
                        data-camp-bar
                        className="block h-full origin-left bg-paper"
                        style={{ transform: `scaleX(${b.value / barMax})` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {!campaign.isRealData ? (
          <p className="mt-5 max-w-[60ch] text-[14px] leading-relaxed text-paper/55">
            I numeri nel pannello sono un esempio di come si legge il report,
            non i risultati di un cliente.
          </p>
        ) : null}
      </Container>
    </section>
  );
}
