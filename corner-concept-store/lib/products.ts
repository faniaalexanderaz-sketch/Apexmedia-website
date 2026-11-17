import data from "@/data/products.json";

export type CategoryId = "giacche" | "felpe" | "denim" | "maglieria" | "accessori" | "vintage" | "donna";
export type ColorId = "verde" | "blu" | "marrone" | "beige" | "grigio" | "rosso";
export type SizeType = "abbigliamento" | "denim" | "unica" | "donna";

export type ProductImage = { src: string; alt: string };
export type ProductSize = { label: string; stock: number };

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  categories: CategoryId[];
  color: string;
  colorFamily: ColorId;
  sizeType: SizeType;
  sizes: ProductSize[];
  description: string;
  details: string[];
  images: ProductImage[];
  pairsWith: string[];
  measurements?: string;
  vintage?: boolean;
  unique?: boolean;
  dropNumber?: number;
  newRank?: number;
};

export const products = data as Product[];

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export const CATEGORIES: { id: CategoryId; number: string; name: string; note: string }[] = [
  { id: "giacche", number: "01", name: "Giacche e capispalla", note: "Field jacket, parka, cerate" },
  { id: "felpe", number: "02", name: "Felpe", note: "Canvas, garzato, tute con la zip" },
  { id: "denim", number: "03", name: "Denim", note: "Grezzo e cimosato, da rodare" },
  { id: "maglieria", number: "04", name: "Maglieria", note: "Lana vera, pesi seri" },
  { id: "accessori", number: "05", name: "Accessori", note: "Berretti a coste e trucker" },
  { id: "vintage", number: "06", name: "Vintage", note: "Pezzi unici: uno, e basta" },
  { id: "donna", number: "07", name: "Donna", note: "Linea piccola, scelta bene" },
];

export const BRANDS = ["Barbour", "Sergio Tacchini", "Sundek", "SKFK", "Selezione Corner"] as const;

export const COLORS: { id: ColorId; name: string; swatch: string }[] = [
  { id: "verde", name: "Verde", swatch: "#5d6646" },
  { id: "blu", name: "Blu", swatch: "#27324d" },
  { id: "marrone", name: "Marrone", swatch: "#9a4a30" },
  { id: "beige", name: "Beige", swatch: "#cdbf9f" },
  { id: "grigio", name: "Grigio", swatch: "#a3a39d" },
  { id: "rosso", name: "Rosso e bordeaux", swatch: "#7c2a33" },
];

export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "30", "31", "32", "33", "34", "36", "Unica"];

export const PRICE_BANDS: { id: string; name: string; min: number; max: number }[] = [
  { id: "0-100", name: "Fino a 100 €", min: 0, max: 100 },
  { id: "100-200", name: "100–200 €", min: 100.01, max: 200 },
  { id: "200-300", name: "200–300 €", min: 200.01, max: 300 },
  { id: "300", name: "Oltre 300 €", min: 300.01, max: Infinity },
];

export function categoryName(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function totalStock(p: Product): number {
  return p.sizes.reduce((sum, s) => sum + s.stock, 0);
}

export function isSoldOut(p: Product): boolean {
  return totalStock(p) === 0;
}

export function stockOf(p: Product, size: string): number {
  return p.sizes.find((s) => s.label === size)?.stock ?? 0;
}

/** Etichetta di scarsità: solo quando è vera. */
export function scarcityLabel(p: Product): string | null {
  if (p.unique) return null;
  const total = totalStock(p);
  if (total === 1) return "Ultimo pezzo";
  if (total === 2) return "Ultimi 2 pezzi";
  return null;
}

export function inCategory(id: CategoryId): Product[] {
  return products.filter((p) => p.categories.includes(id));
}

export function newArrivals(limit = 8): Product[] {
  return products
    .filter((p) => typeof p.newRank === "number")
    .sort((a, b) => (a.newRank ?? 0) - (b.newRank ?? 0))
    .slice(0, limit);
}

export function dropPieces(): Product[] {
  return products
    .filter((p) => typeof p.dropNumber === "number")
    .sort((a, b) => (a.dropNumber ?? 0) - (b.dropNumber ?? 0));
}

export function pairings(p: Product): Product[] {
  return p.pairsWith.map((slug) => bySlug.get(slug)).filter((x): x is Product => Boolean(x) && !isSoldOut(x as Product));
}

export function productHref(p: Product): string {
  return `/prodotto/${p.slug}`;
}
