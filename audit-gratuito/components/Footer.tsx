import { Logo } from "./Logo";
import { IconMail, IconPhone } from "./icons";

const CONTATTI = [
  { nome: "Fania Alexander", telefono: "351 594 0685" },
  { nome: "Federico Delfino", telefono: "333 701 8993" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 pb-10 pt-14 sm:pb-14 sm:pt-16">
      <div className="tri-stripe-full absolute left-0 top-0" aria-hidden="true" />
      <div className="mx-auto flex max-w-content flex-col items-center gap-8 px-5 text-center sm:px-8">
        <Logo className="text-lg" />

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-8">
          {CONTATTI.map((c) => (
            <a
              key={c.nome}
              href={`tel:${c.telefono.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <IconPhone className="h-4 w-4 text-blue" />
              {c.nome} — {c.telefono}
            </a>
          ))}
          <a
            href="mailto:studio@infoapex.eu"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <IconMail className="h-4 w-4 text-blue" />
            studio@infoapex.eu
          </a>
        </div>

        <p className="text-xs text-white/30">© {new Date().getFullYear()} Apex Media</p>
      </div>
    </footer>
  );
}
