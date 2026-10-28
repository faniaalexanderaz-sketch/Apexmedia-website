import Link from "next/link";
import { TricolorStripe } from "@/components/ui/TricolorStripe";
import { Container } from "@/components/ui/Container";
import { navLinks, site } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-auto" data-footer>
      <TricolorStripe />
      <Container className="pb-8 pt-10 lg:pt-14">
        <p className="sr-only">Apex Media</p>
        <svg
          viewBox="0 0 1000 150"
          className="block w-full"
          aria-hidden="true"
          data-footer-wordmark
        >
          <text
            x="0"
            y="138"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            fontFamily="var(--font-space-grotesk), 'Space Grotesk', sans-serif"
            fontWeight="700"
            fontSize="168"
            letterSpacing="-5"
            fill="currentColor"
            className="text-ink"
          >
            APEX MEDIA
          </text>
        </svg>

        <div className="mt-8 flex flex-col gap-4 border-t border-ink/10 pt-5 text-[13px] text-ink/70 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={site.whatsappUrl} className="hover:text-ink">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-ink">
                {site.email}
              </a>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-ink">
                Privacy
              </Link>
            </li>
          </ul>
          <p className="font-mono text-[11px] tracking-wide">
            © {site.year} Apex Media — Alessandria
          </p>
        </div>
      </Container>
    </footer>
  );
}
