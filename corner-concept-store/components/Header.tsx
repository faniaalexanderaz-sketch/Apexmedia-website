import Link from "next/link";
import { CartButton } from "@/components/cart/CartButton";
import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/MobileMenu";
import { FREE_SHIPPING_FROM, RETURN_DAYS } from "@/lib/shipping";

const NAV = [
  { href: "/shop?ordina=novita", label: "Nuovi arrivi" },
  { href: "/shop", label: "Catalogo" },
  { href: "/shop?categoria=vintage", label: "Vintage" },
  { href: "/shop?categoria=donna", label: "Donna" },
  { href: "/#negozio", label: "Il negozio" },
];

export function TopBar() {
  return (
    <div className="su-verde bg-verde text-crema">
      <p className="pagina py-1.5 text-center text-[0.6875rem] font-medium leading-tight tracking-wide md:text-xs">
        Spedizione gratuita sopra i {FREE_SHIPPING_FROM} €, resi entro {RETURN_DAYS} giorni
      </p>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      <TopBar />
      <div className="border-b border-linea bg-crema">
        <div className="pagina grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-[5.25rem]">
          <div className="lg:hidden">
            <MobileMenu />
          </div>
          <Link
            href="/"
            aria-label="CORNER Concept Store, vai alla home"
            className="justify-self-center lg:justify-self-start"
          >
            <Logo variant="testata" label={null} className="h-[2.875rem] w-auto md:h-[3.75rem]" />
          </Link>
          <nav aria-label="Principale" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-[0.8125rem] font-medium tracking-wide underline-offset-[6px] hover:underline hover:decoration-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="justify-self-end">
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
