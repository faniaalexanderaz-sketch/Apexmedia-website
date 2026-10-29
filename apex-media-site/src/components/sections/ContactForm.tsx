"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { deferSetup, gsap, useGSAP, MEDIA, enterAt } from "@/lib/gsap";
import { track } from "@/lib/track";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { serviceOptions, budgetOptions } from "@/data/contact";
import { site } from "@/data/site";

type Errors = Partial<Record<"nome" | "attivita" | "servizio", string>>;

const isServiceOption = (v: string): v is (typeof serviceOptions)[number] =>
  (serviceOptions as readonly string[]).includes(v);

export function buildMessage(d: {
  nome: string;
  attivita: string;
  servizio: string;
  budget: string;
  messaggio: string;
}) {
  const parts = [
    `Ciao Apex, sono ${d.nome.trim()} di ${d.attivita.trim()}.`,
    `Mi interessa: ${d.servizio}.`,
    `Budget: ${d.budget || "da definire"}.`,
  ];
  if (d.messaggio.trim()) parts.push(d.messaggio.trim());
  return parts.join(" ");
}

export function ContactForm() {
  const uid = useId();
  const [nome, setNome] = useState("");
  const [attivita, setAttivita] = useState("");
  const [servizio, setServizio] = useState("");
  const [budget, setBudget] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const magnetRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(
        contextSafe,
        () => {
          const form = formRef.current;
          const magnet = magnetRef.current;
          if (!form || !magnet) return;
          const mm = gsap.matchMedia();
          mm.add([MEDIA.desktop, MEDIA.mobile], () => {
            gsap.from("[data-field]", {
              opacity: 0,
              y: 12,
              duration: 0.6,
              stagger: 0.07,
              scrollTrigger: enterAt(form, "top 80%"),
            });
          });
          mm.add(`${MEDIA.desktop} and (hover: hover)`, () => {
            // Effetto magnetico leggero: massimo 10px
            const btn = magnet.firstElementChild as HTMLElement | null;
            if (!btn) return;
            const toX = gsap.quickTo(btn, "x", {
              duration: 0.5,
              ease: "power3",
            });
            const toY = gsap.quickTo(btn, "y", {
              duration: 0.5,
              ease: "power3",
            });
            const onMove = (e: MouseEvent) => {
              const r = magnet.getBoundingClientRect();
              const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
              const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
              toX(gsap.utils.clamp(-10, 10, dx * 10));
              toY(gsap.utils.clamp(-10, 10, dy * 10));
            };
            const onLeave = () => {
              toX(0);
              toY(0);
            };
            magnet.addEventListener("mousemove", onMove);
            magnet.addEventListener("mouseleave", onLeave);
            return () => {
              magnet.removeEventListener("mousemove", onMove);
              magnet.removeEventListener("mouseleave", onLeave);
            };
          });
        },
        400,
      ),
    { scope: formRef },
  );

  // I bottoni "Scegli Starter/Growth/Domination" preselezionano il servizio
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-preselect]",
      );
      const v = el?.dataset.preselect;
      if (v && isServiceOption(v)) {
        setServizio(v);
        setSent(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const validate = (): Errors => {
    const e: Errors = {};
    if (nome.trim().length < 2) e.nome = "Scrivi il tuo nome.";
    if (attivita.trim().length < 2)
      e.attivita = "Scrivi il nome della tua attività.";
    if (!servizio) e.servizio = "Scegli il servizio che ti interessa.";
    return e;
  };

  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    const text = buildMessage({ nome, attivita, servizio, budget, messaggio });
    const url = `${site.whatsappUrl}?text=${encodeURIComponent(text)}`;
    track("form_submit", { servizio, budget: budget || "non indicato" });
    setSent(true);
    window.open(url, "_blank", "noopener");
  };

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p
        id={`${uid}-${k}-err`}
        className="mt-2 text-[14px] text-[#c8102e]"
        role="alert"
      >
        {errors[k]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      data-contact-form
      className="space-y-7"
    >
      <div data-field>
        <label htmlFor={`${uid}-nome`} className="label-mono text-ink/60">
          Nome *
        </label>
        <div className="field-wrap">
          <input
            id={`${uid}-nome`}
            name="nome"
            className="field"
            autoComplete="given-name"
            placeholder="Come ti chiami?"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            aria-invalid={!!errors.nome}
            aria-describedby={errors.nome ? `${uid}-nome-err` : undefined}
            required
          />
        </div>
        {err("nome")}
      </div>

      <div data-field>
        <label htmlFor={`${uid}-attivita`} className="label-mono text-ink/60">
          Nome attività *
        </label>
        <div className="field-wrap">
          <input
            id={`${uid}-attivita`}
            name="attivita"
            className="field"
            autoComplete="organization"
            placeholder="Es. Bar Centrale, Studio Rossi…"
            value={attivita}
            onChange={(e) => setAttivita(e.target.value)}
            aria-invalid={!!errors.attivita}
            aria-describedby={
              errors.attivita ? `${uid}-attivita-err` : undefined
            }
            required
          />
        </div>
        {err("attivita")}
      </div>

      <div data-field>
        <label htmlFor={`${uid}-servizio`} className="label-mono text-ink/60">
          Servizio che ti interessa *
        </label>
        <div className="field-wrap">
          <select
            id={`${uid}-servizio`}
            name="servizio"
            className="field"
            value={servizio}
            onChange={(e) => setServizio(e.target.value)}
            aria-invalid={!!errors.servizio}
            aria-describedby={
              errors.servizio ? `${uid}-servizio-err` : undefined
            }
            required
          >
            <option value="" disabled>
              Scegli…
            </option>
            {serviceOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        {err("servizio")}
      </div>

      <div data-field>
        <label htmlFor={`${uid}-budget`} className="label-mono text-ink/60">
          Budget indicativo{" "}
          <span className="normal-case tracking-normal">(facoltativo)</span>
        </label>
        <div className="field-wrap">
          <select
            id={`${uid}-budget`}
            name="budget"
            className="field"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            <option value="">Non lo so ancora</option>
            {budgetOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div data-field>
        <label htmlFor={`${uid}-messaggio`} className="label-mono text-ink/60">
          Messaggio{" "}
          <span className="normal-case tracking-normal">(facoltativo)</span>
        </label>
        <div className="field-wrap">
          <textarea
            id={`${uid}-messaggio`}
            name="messaggio"
            className="field min-h-[96px] resize-y"
            rows={3}
            placeholder="Due righe su cosa vorresti ottenere."
            value={messaggio}
            onChange={(e) => setMessaggio(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-2" data-field>
        <span ref={magnetRef} className="inline-block w-full sm:w-auto">
          <Button type="submit" className="w-full sm:w-auto">
            <WhatsAppIcon />
            Invia su WhatsApp
          </Button>
        </span>
        <p className="mt-3 text-[14px] text-ink/60">
          Si apre WhatsApp con il messaggio già scritto. Nessun dato viene
          salvato qui.
        </p>
      </div>

      <p
        role="status"
        aria-live="polite"
        hidden={!sent}
        className="border-l-2 border-verde pl-4 text-[17px] font-medium text-ink"
      >
        Perfetto. Invia il messaggio su WhatsApp e ti rispondiamo entro 24 ore.
      </p>

      <noscript>
        <p className="text-[15px] text-ink/70">
          Il form ha bisogno di JavaScript. Scrivici direttamente su{" "}
          <a
            href={site.whatsappUrl}
            className="underline"
            data-track="click_whatsapp"
            data-track-posizione="contatti"
          >
            WhatsApp
          </a>
          .
        </p>
      </noscript>
    </form>
  );
}
