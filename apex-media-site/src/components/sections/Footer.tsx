import Link from "next/link";
import { TricolorStripe } from "@/components/ui/TricolorStripe";
import { Container } from "@/components/ui/Container";
import { FooterWordmark } from "@/components/ui/FooterWordmark";
import { navLinks, site } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-auto" data-footer>
      <TricolorStripe />
      <Container className="pb-8 pt-10 lg:pt-14">
        <p className="sr-only">Apex Media</p>
        <FooterWordmark />

        <div className="mt-8 flex flex-col gap-4 border-t border-ink/10 pt-5 text-[13px] text-ink/70 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="u-draw hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={site.whatsappUrl} className="u-draw hover:text-ink" data-track="click_whatsapp" data-track-posizione="footer">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="u-draw hover:text-ink" data-track="click_email" data-track-posizione="footer">
                {site.email}
              </a>
            </li>
            <li>
              <Link href="/privacy" className="u-draw hover:text-ink">
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
