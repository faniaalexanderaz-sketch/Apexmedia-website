import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";

export default function NotFound() {
  return (
    <section className="bg-mesh px-6 py-32 text-center">
      <div className="mx-auto max-w-md">
        <Eyebrow>Errore 404</Eyebrow>
        <h1 className="mt-6 font-display text-4xl md:text-5xl">
          Questa pagina non esiste.
        </h1>
        <p className="mt-4 text-pretty leading-relaxed text-muted">
          Il link potrebbe essere sbagliato o la pagina è stata spostata.
          Torna alla home o scrivici direttamente.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/" variant="primary">Torna alla home</Button>
        </div>
      </div>
    </section>
  );
}
