"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const company = String(form.get("company") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    const nextErrors: Record<string, string> = {};
    if (name.length < 2) nextErrors.name = "Inserisci il tuo nome.";
    if (!emailPattern.test(email)) nextErrors.email = "Inserisci un'email valida.";
    if (message.length < 10) nextErrors.message = "Raccontaci qualcosa in più (min. 10 caratteri).";

    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setServerError(data?.error ?? "Invio non riuscito. Riprova.");
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
      <div className="rounded-2xl border border-gold/30 bg-gold/5 px-6 py-8 text-center">
        <p className="font-display text-xl text-gold-bright">Richiesta inviata.</p>
        <p className="mt-2 text-sm text-muted">
          Grazie per averci scritto. Ti rispondiamo entro 48 ore lavorative.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nome e cognome" name="name" error={errors.name} required />
        <Field label="Email" name="email" type="email" error={errors.email} required />
      </div>
      <Field label="Azienda (opzionale)" name="company" />
      <div>
        <label htmlFor="message" className="text-xs uppercase tracking-[0.15em] text-muted">
          Messaggio
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          aria-invalid={Boolean(errors.message)}
          className="mt-2 w-full rounded-2xl border border-hairline bg-white/[0.02] px-4 py-3 text-sm outline-none transition-colors duration-500 focus:border-gold/50"
          placeholder="Raccontaci il tuo brand e i tuoi obiettivi."
        />
        {errors.message && <p className="mt-1.5 text-xs text-violet-bright">{errors.message}</p>}
      </div>

      {status === "error" && (
        <p className="text-sm text-violet-bright">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 inline-flex w-fit items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-medium text-[#0a0805] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-bright active:scale-[0.98] disabled:opacity-60"
      >
        {status === "submitting" ? "Invio in corso…" : "Invia richiesta"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        className="mt-2 w-full rounded-full border border-hairline bg-white/[0.02] px-4 py-3 text-sm outline-none transition-colors duration-500 focus:border-gold/50"
      />
      {error && <p className="mt-1.5 text-xs text-violet-bright">{error}</p>}
    </div>
  );
}
