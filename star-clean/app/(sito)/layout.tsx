import { BarraMobile } from "@/components/BarraMobile";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function LayoutSito({ children }: { children: React.ReactNode }) {
  return (
    <div className="con-barra">
      <a href="#contenuto" className="bg-petrolio sr-only z-50 p-4 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Vai al contenuto
      </a>
      <Header />
      <main id="contenuto">{children}</main>
      <Footer />
      <BarraMobile />
    </div>
  );
}
