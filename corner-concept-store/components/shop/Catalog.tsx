"use client";

import { useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { ProductCard, ProductCell, ProductGrid } from "@/components/ProductCard";
import { ChiudiPannello, Pannello } from "@/components/ui/Pannello";
import {
  EMPTY_FILTERS,
  GROUPS,
  SORTS,
  activeCount,
  applyFilters,
  optionCount,
  parseFilters,
  sortProducts,
  toQuery,
  toggle,
  type Filters,
  type GroupId,
  type SortId,
} from "@/lib/filters";
import { pezzi } from "@/lib/format";
import { CATEGORIES, products } from "@/lib/products";

/** L'URL è l'unica fonte di verità: i filtri si possono condividere e il tasto indietro li rispetta. */
function writeUrl(filters: Filters) {
  const query = toQuery(filters);
  window.history.replaceState(null, "", query ? `/shop?${query}` : "/shop");
}

function FilterGroups({ filters, onToggle }: { filters: Filters; onToggle: (id: GroupId, value: string) => void }) {
  return (
    <div className="divide-y divide-linea border-y border-linea">
      {GROUPS.map((group) => (
        <fieldset key={group.id} className="py-5">
          <legend className="occhiello float-left mb-3 w-full text-marrone">{group.name}</legend>
          <div className="clear-both flex flex-wrap gap-2">
            {group.options.map((option) => {
              const selected = filters[group.id].includes(option.value);
              const count = optionCount(products, filters, group.id, option.value);
              const empty = count === 0 && !selected;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  disabled={empty}
                  onClick={() => onToggle(group.id, option.value)}
                  className={`pillola disabled:cursor-not-allowed disabled:border-linea disabled:text-marrone/45 ${
                    selected
                      ? "border-verde bg-verde text-crema"
                      : "bg-transparent text-verde hover:border-verde enabled:hover:bg-carta"
                  }`}
                >
                  {option.swatch ? (
                    <span
                      aria-hidden="true"
                      className="h-3 w-1.5 rounded-full border border-black/10"
                      style={{ background: option.swatch }}
                    />
                  ) : null}
                  {option.label}
                  <span className={`cifre text-[0.6875rem] ${selected ? "text-crema/70" : "text-marrone/80"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function Catalog() {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sortId = useId();

  const results = useMemo(() => sortProducts(applyFilters(products, filters), filters.ordina), [filters]);
  const active = activeCount(filters);

  const onToggle = (id: GroupId, value: string) => writeUrl(toggle(filters, id, value));
  const reset = () => writeUrl({ ...EMPTY_FILTERS, ordina: filters.ordina });

  const single = filters.categoria.length === 1 ? CATEGORIES.find((c) => c.id === filters.categoria[0]) : undefined;

  return (
    <div className="pagina pb-16 pt-8 md:pb-24 md:pt-12">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="occhiello text-marrone">
            {single ? (
              <>
                <span className="cifre text-ruggine">{single.number}</span> · {single.note}
              </>
            ) : (
              "Tutto quello che c'è in negozio, adesso"
            )}
          </p>
          <h1 className="titolo mt-3 text-[2.5rem] md:text-6xl">{single ? single.name : "Catalogo"}</h1>
        </div>
      </header>

      <div className="mt-8 grid gap-x-8 lg:grid-cols-12">
        {/* filtri sempre visibili su desktop */}
        <aside className="hidden lg:col-span-3 lg:block" aria-label="Filtri">
          <div className="sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-contain pr-1">
            <FilterGroups filters={filters} onToggle={onToggle} />
            {active > 0 ? (
              <button type="button" onClick={reset} className="link-riga mt-4 min-h-11 text-sm font-semibold">
                Azzera i filtri ({active})
              </button>
            ) : null}
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="flex items-center justify-between gap-3 border-t border-linea py-3 lg:border-t-0 lg:pt-0">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              className={`pillola lg:hidden ${active ? "border-verde bg-verde text-crema" : "text-verde"}`}
            >
              Filtri
              {active > 0 ? <span className="cifre text-[0.6875rem] text-crema/80">{active}</span> : null}
            </button>

            <p className="cifre hidden text-sm text-marrone sm:block" aria-live="polite">
              {pezzi(results.length)}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor={sortId} className="text-xs text-marrone">
                Ordina
              </label>
              <div className="relative">
                <select
                  id={sortId}
                  value={filters.ordina}
                  onChange={(event) => writeUrl({ ...filters, ordina: event.target.value as SortId })}
                  className="pillola appearance-none bg-transparent pr-9 text-verde hover:border-verde"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs">
                  ↓
                </span>
              </div>
            </div>
          </div>

          <p className="cifre pb-3 text-sm text-marrone sm:hidden" aria-live="polite">
            {pezzi(results.length)}
          </p>

          {results.length > 0 ? (
            <ProductGrid wide={false}>
              {results.map((p, index) => (
                <ProductCell key={p.slug}>
                  <ProductCard
                    product={p}
                    eager={index < 4}
                    sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 32vw"
                  />
                </ProductCell>
              ))}
            </ProductGrid>
          ) : (
            <div className="border border-linea px-5 py-16 text-center">
              <p className="titolo text-3xl">Con questi filtri non resta niente.</p>
              <p className="mx-auto mt-3 max-w-[40ch] text-sm text-marrone">
                Il negozio è piccolo: togli un filtro e qualcosa salta fuori.
              </p>
              <button type="button" onClick={reset} className="bottone bottone-pieno mt-6">
                Azzera i filtri
              </button>
            </div>
          )}
        </div>
      </div>

      {/* filtri su mobile: pannello dal basso */}
      <Pannello open={sheetOpen} onClose={() => setSheetOpen(false)} side="basso" labelledBy="filtri-titolo">
        <div className="flex max-h-[88dvh] flex-col">
          <div className="flex items-center justify-between border-b border-linea px-4 py-2.5">
            <h2 id="filtri-titolo" className="titolo text-[1.625rem]">
              Filtri
            </h2>
            <ChiudiPannello onClose={() => setSheetOpen(false)} />
          </div>
          <div className="overflow-y-auto overscroll-contain px-4">
            <FilterGroups filters={filters} onToggle={onToggle} />
          </div>
          <div className="flex gap-3 border-t border-linea px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <button type="button" onClick={reset} disabled={active === 0} className="bottone bottone-contorno flex-1 disabled:opacity-40">
              Azzera
            </button>
            <button type="button" onClick={() => setSheetOpen(false)} className="bottone bottone-pieno flex-[2]">
              Mostra {pezzi(results.length)}
            </button>
          </div>
        </div>
      </Pannello>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="pagina pb-16 pt-8 md:pb-24 md:pt-12" aria-busy="true">
      <p className="occhiello text-marrone">Tutto quello che c&apos;è in negozio, adesso</p>
      <p className="titolo mt-3 text-[2.5rem] md:text-6xl">Catalogo</p>
      <div className="mt-8 grid gap-x-8 lg:grid-cols-12">
        <div className="hidden lg:col-span-3 lg:block" />
        <ul className="grid grid-cols-2 border-l border-t border-linea md:grid-cols-3 lg:col-span-9">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="border-b border-r border-linea">
              <div className="aspect-[4/5] bg-ombra" />
              <div className="h-20" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
