import {
  BRANDS,
  CATEGORIES,
  COLORS,
  PRICE_BANDS,
  SIZE_ORDER,
  type Product,
} from "@/lib/products";

export type GroupId = "categoria" | "taglia" | "brand" | "colore" | "prezzo";
export type SortId = "evidenza" | "novita" | "prezzo-asc" | "prezzo-desc";

export type Filters = Record<GroupId, string[]> & { ordina: SortId };

export const GROUP_IDS: GroupId[] = ["categoria", "taglia", "brand", "colore", "prezzo"];

export const SORTS: { id: SortId; name: string }[] = [
  { id: "evidenza", name: "In evidenza" },
  { id: "novita", name: "Novità" },
  { id: "prezzo-asc", name: "Prezzo: dal più basso" },
  { id: "prezzo-desc", name: "Prezzo: dal più alto" },
];

export const brandSlug = (brand: string) => brand.toLowerCase().replace(/\s+/g, "-");

export const GROUPS: { id: GroupId; name: string; options: { value: string; label: string; swatch?: string }[] }[] = [
  { id: "categoria", name: "Categoria", options: CATEGORIES.map((c) => ({ value: c.id, label: c.name })) },
  { id: "taglia", name: "Taglia", options: SIZE_ORDER.map((s) => ({ value: s, label: s })) },
  { id: "brand", name: "Brand", options: BRANDS.map((b) => ({ value: brandSlug(b), label: b })) },
  { id: "colore", name: "Colore", options: COLORS.map((c) => ({ value: c.id, label: c.name, swatch: c.swatch })) },
  { id: "prezzo", name: "Prezzo", options: PRICE_BANDS.map((b) => ({ value: b.id, label: b.name })) },
];

const VALID: Record<GroupId, Set<string>> = Object.fromEntries(
  GROUPS.map((g) => [g.id, new Set(g.options.map((o) => o.value))]),
) as Record<GroupId, Set<string>>;

export const EMPTY_FILTERS: Filters = { categoria: [], taglia: [], brand: [], colore: [], prezzo: [], ordina: "evidenza" };

export function parseFilters(params: { get(name: string): string | null }): Filters {
  const filters: Filters = { ...EMPTY_FILTERS };
  for (const id of GROUP_IDS) {
    const raw = params.get(id);
    filters[id] = raw ? raw.split(",").filter((v) => VALID[id].has(v)) : [];
  }
  const sort = params.get("ordina");
  filters.ordina = SORTS.some((s) => s.id === sort) ? (sort as SortId) : "evidenza";
  return filters;
}

export function toQuery(filters: Filters): string {
  const parts: string[] = [];
  for (const id of GROUP_IDS) {
    if (filters[id].length) parts.push(`${id}=${filters[id].map(encodeURIComponent).join(",")}`);
  }
  if (filters.ordina !== "evidenza") parts.push(`ordina=${filters.ordina}`);
  return parts.join("&");
}

export function activeCount(filters: Filters): number {
  return GROUP_IDS.reduce((sum, id) => sum + filters[id].length, 0);
}

function matchesGroup(product: Product, id: GroupId, values: string[]): boolean {
  if (values.length === 0) return true;
  switch (id) {
    case "categoria":
      return values.some((v) => (product.categories as string[]).includes(v));
    case "taglia":
      // una taglia conta solo se è disponibile
      return product.sizes.some((s) => s.stock > 0 && values.includes(s.label));
    case "brand":
      return values.includes(brandSlug(product.brand));
    case "colore":
      return values.includes(product.colorFamily);
    case "prezzo":
      return PRICE_BANDS.some((b) => values.includes(b.id) && product.price >= b.min && product.price <= b.max);
  }
}

export function applyFilters(all: Product[], filters: Filters, skip?: GroupId): Product[] {
  return all.filter((p) => GROUP_IDS.every((id) => id === skip || matchesGroup(p, id, filters[id])));
}

/** Quanti capi resterebbero scegliendo quell'opzione, tenendo fermi gli altri gruppi. */
export function optionCount(all: Product[], filters: Filters, id: GroupId, value: string): number {
  return applyFilters(all, filters, id).filter((p) => matchesGroup(p, id, [value])).length;
}

export function sortProducts(list: Product[], sort: SortId): Product[] {
  const sorted = [...list];
  switch (sort) {
    case "novita":
      return sorted.sort((a, b) => (a.newRank ?? 99) - (b.newRank ?? 99) || a.id.localeCompare(b.id));
    case "prezzo-asc":
      return sorted.sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
    case "prezzo-desc":
      return sorted.sort((a, b) => b.price - a.price || a.id.localeCompare(b.id));
    default:
      return sorted.sort((a, b) => a.id.localeCompare(b.id));
  }
}

export function toggle(filters: Filters, id: GroupId, value: string): Filters {
  const current = filters[id];
  return { ...filters, [id]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
}
