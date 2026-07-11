import type { Metadata } from "next";
import Card from "@/components/Card";
import Eyebrow from "@/components/Eyebrow";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contatti — Apex Media",
  description:
    "Scrivi ad Apex Media per una proposta su strategia social, content creation e advertising per il tuo brand.",
};

export default function Contatti() {
  return (
    <section className="bg-mesh px-6 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-5 md:gap-16">
        <div className="md:col-span-2">
          <Eyebrow>Contatti</Eyebrow>
          <h1 className="mt-6 text-balance font-display text-4xl leading-tight md:text-5xl">
            Parliamo del tuo brand.
          </h1>
          <p className="mt-6 max-w-sm text-pretty leading-relaxed text-muted">
            Compila il form: torniamo con una proposta entro 48 ore lavorative.
            Nessun copia-incolla, solo una direzione pensata per il tuo caso.
          </p>

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-muted">Email</dt>
              <dd className="mt-1">hello@apexmedia.agency</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-muted">Telefono</dt>
              <dd className="mt-1">+39 02 1234 5678</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.15em] text-muted">Studio</dt>
              <dd className="mt-1">Milano, Italia</dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-3">
          <Card>
            <div className="p-6 md:p-10">
              <ContactForm />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
