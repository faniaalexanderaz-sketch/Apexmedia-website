import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function NegozioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-verde focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-crema"
      >
        Vai al contenuto
      </a>
      <Header />
      <main id="contenuto" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
