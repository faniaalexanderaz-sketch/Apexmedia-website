"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function ConsultationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") ?? "").trim();
    const business = String(form.get("business") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const contact = String(form.get("contact") ?? "").trim();
    const service = String(form.get("service") ?? "").trim();
    const budget = String(form.get("budget") ?? "").trim();
    const goal = String(form.get("goal") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    const nextErrors: Record<string, string> = {};
    if (name.length < 2) nextErrors.name = "Inserisci il tuo nome.";
    if (business.length < 2) nextErrors.business = "Inserisci il nome della tua attività.";
    if (service.length < 2) nextErrors.service = "Indica il servizio che ti interessa.";

    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      // Netlify Forms: POST url-encoded alla pagina stessa con form-name
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "consulenza",
          name,
          business,
          city,
          contact,
          service,
          budget,
          goal,
          message,
        }).toString(),
      });

      if (!res.ok) {
        setServerError("Invio non riuscito. Riprova.");
        setStatus("error");
        return;
      }

      setStatus("success");
      formEl.reset();
    } catch {
      setServerError("Connessione non riuscita. Riprova.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-orange/30 bg-orange/5 px-6 py-10 text-center">
        <p className="font-display text-xl font-bold text-orange-bright">Richiesta inviata.</p>
        <p className="mt-2 text-sm text-muted">
          Grazie, ti ricontattiamo entro 24 ore via WhatsApp o email.
        </p>
      </div>
    );
  }

  return (
    <form
      name="consulenza"
      data-netlify="true"
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="form-name" value="consulenza" />
      <Field label="Nome *" name="name" error={errors.name} required />
      <Field label="Nome attività / brand *" name="business" error={errors.business} required />
      <Field label="Città" name="city" />
      <Field label="Instagram o sito web" name="contact" />
      <Field label="Servizio interessato *" name="service" error={errors.service} required />
      <Field label="Budget indicativo" name="budget" />
      <Field label="Obiettivo principale" name="goal" />

      <div>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full rounded-2xl border border-hairline bg-white/[0.02] px-4 py-3 text-sm outline-none transition-colors duration-500 focus:border-orange/50"
          placeholder="Messaggio (facoltativo)"
        />
      </div>

      {status === "error" && <p className="text-sm text-violet-bright">{serverError}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="eyebrow mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange to-orange-bright px-6 py-4 text-xs uppercase text-[#170c02] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
      >
        {status === "submitting" ? "Invio in corso…" : "Richiedi consulenza"}
        {status !== "submitting" && <span aria-hidden="true">→</span>}
      </button>

      <p className="text-center text-xs text-muted">
        Inviando confermi di voler essere ricontattato via WhatsApp / email
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  required,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <input
        id={name}
        name={name}
        type="text"
        required={required}
        aria-invalid={Boolean(error)}
        placeholder={label}
        className="w-full rounded-full border border-hairline bg-white/[0.02] px-5 py-3.5 text-sm outline-none transition-colors duration-500 focus:border-orange/50"
      />
      {error && <p className="mt-1.5 pl-2 text-xs text-violet-bright">{error}</p>}
    </div>
  );
}
