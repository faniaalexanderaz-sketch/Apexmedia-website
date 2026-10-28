import { Container } from "./Container";

/** Linee della griglia a 12 colonne (4 su mobile), 1px inchiostro all’8%. */
export function GridLines({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      <Container className="h-full">
        <div className="grid h-full grid-cols-4 lg:grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`grid-line ${i >= 4 ? "hidden lg:block" : ""}`}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
