import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Taglio } from "@/lib/studio/agenti";

/* =============================================================
   Il corpo delle persone, costruito nel codice: proporzioni da
   adulto, volto con occhi, naso, bocca e orecchie, mani con le dita,
   capelli in nove tagli, divisa Apex con zip, colletto, profili e
   tasca. Ogni parte del corpo (busto, testa, braccio, mano…) è una
   sola geometria con i colori dentro i vertici: poche chiamate di
   disegno anche con tante persone, quindi fluido anche sul telefono.
   ============================================================= */

type V3 = [number, number, number];

/** Misure in metri: uomo e donna. Le y del busto sono riferite all'anca. */
export type Misure = {
  anca: number; coscia: number; stinco: number; spalla: [number, number]; omero: number; avambraccio: number;
  collo: number; testa: number; largo: number;
};
export const UOMO: Misure = { anca: 0.93, coscia: 0.44, stinco: 0.42, spalla: [0.178, 0.43], omero: 0.29, avambraccio: 0.25, collo: 0.575, testa: 1.1, largo: 1 };
export const DONNA: Misure = { anca: 0.89, coscia: 0.42, stinco: 0.4, spalla: [0.158, 0.405], omero: 0.27, avambraccio: 0.235, collo: 0.548, testa: 1.05, largo: 0.92 };

/** Raccoglie pezzi colorati e li fonde in una geometria sola. */
class Pezzi {
  private lista: THREE.BufferGeometry[] = [];
  add(g: THREE.BufferGeometry, colore: THREE.ColorRepresentation, p: V3 = [0, 0, 0], r: V3 = [0, 0, 0], s: V3 | number = 1) {
    const c = g.clone();
    const sc = typeof s === "number" ? new THREE.Vector3(s, s, s) : new THREE.Vector3(...s);
    c.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), sc));
    for (const n of Object.keys(c.attributes)) if (!["position", "normal", "uv"].includes(n)) c.deleteAttribute(n);
    if (!c.getAttribute("uv")) c.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(c.getAttribute("position").count * 2), 2));
    if (!c.index) { const n = c.getAttribute("position").count; c.setIndex(Array.from({ length: n }, (_, i) => i)); }
    const col = new THREE.Color(colore), n = c.getAttribute("position").count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
    c.setAttribute("color", new THREE.BufferAttribute(arr, 3));
    this.lista.push(c);
    return this;
  }
  get vuoto() { return this.lista.length === 0; }
  fondi(): THREE.BufferGeometry {
    const g = this.lista.length ? mergeGeometries(this.lista, false) : new THREE.BufferGeometry();
    for (const x of this.lista) x.dispose();
    this.lista = [];
    g.computeBoundingSphere();
    return g;
  }
}

/* ---------- Forme base (unitarie, condivise) ---------- */

const SFERA = new THREE.SphereGeometry(1, 22, 16);
const SFERA_P = new THREE.SphereGeometry(1, 12, 8);
const TORO = new THREE.TorusGeometry(1, 0.12, 6, 24);

/** Arto affusolato con le estremità arrotondate, dall'alto (y=0) verso il basso (y=-lung). */
function fuso(rSu: number, rGiu: number, lung: number, giri = 14): THREE.BufferGeometry {
  const p: THREE.Vector2[] = [];
  for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + (i / 5) * (Math.PI / 2); p.push(new THREE.Vector2(Math.max(0.0005, Math.cos(a) * rGiu), -lung + Math.sin(a) * rGiu)); }
  for (let i = 1; i < 6; i++) { const t = i / 6; p.push(new THREE.Vector2(rGiu + (rSu - rGiu) * t + Math.sin(t * Math.PI) * (rSu + rGiu) * 0.06, -lung * (1 - t))); }
  for (let i = 0; i <= 5; i++) { const a = (i / 5) * (Math.PI / 2); p.push(new THREE.Vector2(Math.max(0.0005, Math.cos(a) * rSu), Math.sin(a) * rSu)); }
  return new THREE.LatheGeometry(p, giri);
}

/** Solido di rotazione da un profilo (raggio, altezza), schiacciato in profondità. */
function profilo(punti: [number, number][], giri = 24): THREE.BufferGeometry {
  return new THREE.LatheGeometry(punti.map(([r, y]) => new THREE.Vector2(Math.max(0.0005, r), y)), giri);
}

const scuro = (c: string, k: number) => "#" + new THREE.Color(c).multiplyScalar(k).getHexString();
const mescola = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();

/* ---------- Busto con la divisa ---------- */

const BUSTO_U: [number, number][] = [[0, -0.17], [0.18, -0.17], [0.184, -0.1], [0.18, -0.03], [0.17, 0.04], [0.154, 0.11], [0.158, 0.19], [0.172, 0.29], [0.182, 0.37], [0.186, 0.425], [0.17, 0.465], [0.125, 0.495], [0.07, 0.512], [0, 0.516]];
const BUSTO_D: [number, number][] = [[0, -0.17], [0.19, -0.17], [0.192, -0.1], [0.184, -0.04], [0.164, 0.04], [0.134, 0.12], [0.138, 0.19], [0.15, 0.28], [0.158, 0.355], [0.162, 0.405], [0.148, 0.44], [0.108, 0.47], [0.062, 0.486], [0, 0.49]];
const PROF = 0.62;

/** Raggio del busto all'altezza y (per appoggiare zip, tasche e loghi sulla superficie). */
export function raggioBusto(donna: boolean, y: number): number {
  const p = donna ? BUSTO_D : BUSTO_U;
  for (let i = 1; i < p.length; i++) if (y <= p[i][1]) { const [r0, y0] = p[i - 1], [r1, y1] = p[i]; return r0 + ((r1 - r0) * (y - y0)) / Math.max(1e-4, y1 - y0); }
  return 0;
}

export type Colori = { divisa: string; accento: string; pelle: string; capelli: string; pantaloni: string; ospite?: boolean };

/** Giacca Apex: corpo, fascia in fondo, colletto alto con la maglia bianca, zip, profili sulle spalle, pieghe. */
export function geoBusto(donna: boolean, c: Colori): THREE.BufferGeometry {
  const z = new Pezzi();
  const prof = donna ? BUSTO_D : BUSTO_U;
  const top = prof[prof.length - 1][1];
  z.add(profilo(prof), c.divisa, [0, 0, 0], [0, 0, 0], [1, 1, PROF]);
  // fascia elastica in fondo
  z.add(profilo([[0.001, -0.17], [raggioBusto(donna, -0.17) + 0.006, -0.17], [raggioBusto(donna, -0.12) + 0.006, -0.12], [0.001, -0.12]]), scuro(c.divisa, 0.78), [0, 0, 0], [0, 0, 0], [1, 1, PROF + 0.01]);
  // colletto alto, aperto davanti, con la maglia bianca dentro
  const yc = top - 0.045;
  z.add(new THREE.CylinderGeometry(0.072, 0.084, 0.05, 22, 1, true, Math.PI * 0.14, Math.PI * 1.72), scuro(c.divisa, 0.9), [0, yc + 0.03, 0.004], [0, 0, 0], [1, 1, 0.92]);
  z.add(new THREE.CylinderGeometry(0.058, 0.07, 0.05, 18), c.ospite ? mescola(c.divisa, "#ffffff", 0.75) : "#f4f2ef", [0, yc + 0.025, 0], [0, 0, 0], [1, 1, 0.95]);
  if (!c.ospite) {
    // zip davanti, dal colletto alla fascia, appoggiata sulla curva del busto
    for (let y = -0.165; y < yc; y += 0.045) {
      const r = raggioBusto(donna, y + 0.0225) * PROF + 0.002;
      z.add(new THREE.BoxGeometry(1, 1, 1), "#c9ccd4", [0, y + 0.0225, -r + 0.002], [0, 0, 0], [0.011, 0.05, 0.014]);
    }
    z.add(new THREE.BoxGeometry(1, 1, 1), "#e8e9ee", [0.006, yc - 0.03, -raggioBusto(donna, yc - 0.03) * PROF - 0.012], [0.2, 0, 0], [0.012, 0.03, 0.006]);
    // tasca sul petto, a destra, con il bottoncino del colore personale
    const yt = donna ? 0.3 : 0.32, rt = raggioBusto(donna, yt) * PROF;
    z.add(new THREE.BoxGeometry(1, 1, 1), scuro(c.divisa, 0.82), [0.085, yt, -rt + 0.004], [0, -0.42, 0], [0.075, 0.006, 0.01]);
    z.add(SFERA_P, c.accento, [0.112, yt + 0.024, -rt + 0.012], [0, 0, 0], [0.011, 0.011, 0.006]);
    // tasche basse a filetto
    for (const l of [-1, 1]) z.add(new THREE.BoxGeometry(1, 1, 1), scuro(c.divisa, 0.8), [l * 0.09, -0.04, -raggioBusto(donna, -0.04) * PROF * 0.93], [0, l * 0.5, l * 0.35], [0.07, 0.005, 0.01]);
  }
  // pieghe del tessuto in vita e sulla schiena
  for (const [x, y, rz, l] of [[-0.12, 0.1, 0.5, 0.06], [0.12, 0.12, -0.45, 0.07], [-0.1, 0.17, 0.3, 0.05], [0.11, 0.2, -0.35, 0.05]] as [number, number, number, number][]) {
    const r = raggioBusto(donna, y);
    z.add(SFERA_P, scuro(c.divisa, 0.93), [x, y, -Math.sqrt(Math.max(0, r * r - x * x)) * PROF + 0.002], [0, 0, rz], [0.004, l / 2.6, 0.003]);
  }
  z.add(SFERA_P, scuro(c.divisa, 0.86), [0, 0.12, raggioBusto(donna, 0.12) * PROF - 0.002], [0, 0, 0.1], [0.05, 0.005, 0.004]);
  return z.fondi();
}

/** Torso nudo col costume, per la jacuzzi. */
export function geoBustoSpa(donna: boolean, c: Colori): THREE.BufferGeometry {
  const z = new Pezzi();
  const prof = donna ? BUSTO_D : BUSTO_U;
  z.add(profilo(prof.map(([r, y]) => [r * 0.95, y] as [number, number])), c.pelle, [0, 0, 0], [0, 0, 0], [1, 1, PROF * 0.95]);
  if (donna) {
    for (const l of [-1, 1]) z.add(SFERA, "#1f6f8b", [l * 0.058, 0.33, -0.07], [0, 0, 0], [0.066, 0.058, 0.05]);
    z.add(new THREE.BoxGeometry(1, 1, 1), "#1f6f8b", [0, 0.31, -0.08], [0, 0, 0], [0.03, 0.02, 0.02]);
  }
  z.add(new THREE.CylinderGeometry(0.052, 0.06, 0.1, 16), c.pelle, [0, prof[prof.length - 1][1] + 0.02, 0]);
  return z.fondi();
}

/** Bacino e attaccatura delle gambe (pantaloni). */
export function geoBacino(donna: boolean, c: Colori): THREE.BufferGeometry {
  const z = new Pezzi();
  const k = donna ? 1.06 : 1;
  z.add(profilo([[0, -0.13], [0.15 * k, -0.13], [0.158 * k, -0.06], [0.155 * k, 0.02], [0.145, 0.08], [0, 0.08]]), c.pantaloni, [0, 0, 0], [0, 0, 0], [1, 1, 0.6]);
  return z.fondi();
}

/** Collo (pelle). */
export function geoCollo(m: Misure, c: Colori): THREE.BufferGeometry {
  return new Pezzi().add(new THREE.CylinderGeometry(0.046, 0.06, 0.15, 16), c.pelle, [0, m.collo - 0.035, 0.012]).fondi();
}

/* ---------- Gambe ---------- */

export function geoCoscia(m: Misure, c: Colori): THREE.BufferGeometry {
  const z = new Pezzi();
  z.add(fuso(0.079 * m.largo, 0.06, m.coscia), c.pantaloni);
  z.add(SFERA, c.pantaloni, [0, -m.coscia, -0.006], [0, 0, 0], [0.062, 0.062, 0.066]);
  return z.fondi();
}

export function geoStinco(m: Misure, c: Colori): THREE.BufferGeometry {
  const z = new Pezzi();
  z.add(fuso(0.06, 0.05, m.stinco - 0.03), c.pantaloni);
  // orlo
  z.add(new THREE.CylinderGeometry(0.053, 0.055, 0.02, 14), scuro(c.pantaloni, 0.85), [0, -m.stinco + 0.045, 0]);
  return z.fondi();
}

/** Sneaker bianca: tomaia, suola, punta, profilo viola Apex e lacci. */
export function geoScarpa(c: Colori, donna: boolean): THREE.BufferGeometry {
  const z = new Pezzi();
  const k = donna ? 0.92 : 1;
  z.add(new RoundedBoxGeometry(1, 1, 1, 3, 0.35), "#f7f7f9", [0, -0.034, -0.05 * k], [0, 0, 0], [0.098 * k, 0.07, 0.26 * k]);
  z.add(SFERA, "#f7f7f9", [0, -0.045, -0.165 * k], [0, 0, 0], [0.047 * k, 0.036, 0.05]);
  z.add(new RoundedBoxGeometry(1, 1, 1, 2, 0.3), "#d9dade", [0, -0.066, -0.052 * k], [0, 0, 0], [0.104 * k, 0.024, 0.276 * k]);
  z.add(new THREE.BoxGeometry(1, 1, 1), c.ospite ? "#c9ccd4" : "#5b2eff", [0, -0.038, 0.02], [0, 0, 0], [0.1 * k, 0.012, 0.1]);
  for (let i = 0; i < 3; i++) z.add(new THREE.BoxGeometry(1, 1, 1), "#e6e7eb", [0, 0.0 - i * 0.004, -0.075 - i * 0.028], [0.2, 0, 0], [0.05, 0.005, 0.008]);
  return z.fondi();
}

/* ---------- Braccia e mani ---------- */

export function geoOmero(m: Misure, colore: string, spalla: boolean): THREE.BufferGeometry {
  const z = new Pezzi();
  z.add(fuso(0.052 * m.largo, 0.043, m.omero), colore);
  if (spalla) z.add(SFERA, colore, [-0.006, -0.006, 0], [0, 0, 0], [0.05 * m.largo, 0.046, 0.052]);
  z.add(SFERA, colore, [0, -m.omero, 0], [0, 0, 0], 0.046);
  return z.fondi();
}

export function geoAvambraccio(m: Misure, colore: string, polsino: string | null, pelle: string): THREE.BufferGeometry {
  const z = new Pezzi();
  z.add(fuso(0.046, 0.036, m.avambraccio - 0.02), colore);
  if (polsino) z.add(new THREE.CylinderGeometry(0.039, 0.04, 0.03, 14), polsino, [0, -m.avambraccio + 0.03, 0]);
  z.add(new THREE.CylinderGeometry(0.026, 0.028, 0.04, 12), pelle, [0, -m.avambraccio + 0.005, 0], [0, 0, 0], [1, 1, 0.8]);
  return z.fondi();
}

/** Mano: palmo, quattro dita leggermente piegate, pollice. Il palmo guarda verso il corpo; `lato` +1 destra, -1 sinistra. */
export function geoMano(c: Colori, lato: number, donna: boolean): THREE.BufferGeometry {
  const z = new Pezzi();
  const k = donna ? 0.9 : 1;
  z.add(new RoundedBoxGeometry(1, 1, 1, 2, 0.35), c.pelle, [0, -0.045 * k, 0], [0, 0, 0], [0.028 * k, 0.085 * k, 0.07 * k]);
  const dita = [-0.024, -0.008, 0.008, 0.024];
  const lung = [0.05, 0.058, 0.055, 0.044];
  dita.forEach((dz, i) => {
    const g = new THREE.CapsuleGeometry(0.0082 * k, lung[i] * k, 3, 8);
    z.add(g, c.pelle, [-lato * 0.006, -0.085 * k - lung[i] * k * 0.45, dz * k], [0, 0, -lato * 0.32], 1);
  });
  z.add(new THREE.CapsuleGeometry(0.0095 * k, 0.04 * k, 3, 8), c.pelle, [-lato * 0.012, -0.05 * k, -0.04 * k], [-0.7, 0, -lato * 0.35], 1);
  return z.fondi();
}

/* ---------- Testa ---------- */

/** Centro e raggi del cranio, riferiti al punto in cui la testa ruota (cima del collo). */
const CRANIO: { c: V3; r: V3 } = { c: [0, 0.1, 0.006], r: [0.08, 0.1, 0.094] };

export type Volto = { donna: boolean; barba: boolean; occhi: string };

/** Testa intera da una sfera deformata: mascella più stretta, mento, nuca: nessuna giuntura visibile. */
function geoCranio(donna: boolean, gonfia = 1, filtro?: (u: THREE.Vector3) => boolean): THREE.BufferGeometry {
  const g = filtro ? new THREE.SphereGeometry(1, 120, 90) : new THREE.SphereGeometry(1, 44, 32);
  const p = g.getAttribute("position"), v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const { x, y, z } = v;
    const giu = Math.max(0, -y);
    let rx = CRANIO.r[0], rz = CRANIO.r[2];
    const ry = y >= 0 ? CRANIO.r[1] : 0.117;
    // mascella che si stringe verso il mento, più morbida nelle donne
    rx *= 1 - (donna ? 0.42 : 0.34) * Math.pow(giu, 1.6);
    // dietro, sotto, la nuca rientra verso il collo
    if (z > 0) rz *= 1 - 0.38 * Math.pow(giu, 1.3);
    // il viso davanti è un po' più piatto ai lati, il mento sporge appena
    let dz = 0;
    if (z < 0) { dz = -0.006 * Math.exp(-Math.pow((y + 0.82) / 0.16, 2)) * (donna ? 0.6 : 1); rx *= 1 - 0.05 * Math.max(0, -z); }
    v.set(x * rx * gonfia, y * ry * gonfia, z * rz * gonfia + dz);
    p.setXYZ(i, v.x + CRANIO.c[0], v.y + CRANIO.c[1], v.z + CRANIO.c[2]);
  }
  g.computeVertexNormals();
  if (!filtro) return g;
  // tiene solo i triangoli scelti (per la barba)
  const idx = g.index!, tieni: number[] = [], u = new THREE.Vector3();
  for (let t = 0; t < idx.count; t += 3) {
    u.set(0, 0, 0);
    for (let k = 0; k < 3; k++) { const j = idx.getX(t + k); u.x += p.getX(j) / 3; u.y += p.getY(j) / 3; u.z += p.getZ(j) / 3; }
    if (filtro(u)) tieni.push(idx.getX(t), idx.getX(t + 1), idx.getX(t + 2));
  }
  g.setIndex(tieni);
  return g;
}

/** Pelle della testa: cranio, mascella, zigomi, naso, orecchie, labbra. */
export function geoTesta(v: Volto, c: Colori): THREE.BufferGeometry {
  const z = new Pezzi();
  const p = c.pelle;
  z.add(geoCranio(v.donna), p);
  // arcata sopraccigliare
  // naso: dorso, punta, ali
  z.add(SFERA, p, [0, 0.088, -0.088], [0.3, 0, 0], v.donna ? [0.0085, 0.026, 0.011] : [0.0105, 0.029, 0.013]);
  z.add(SFERA, p, [0, 0.066, -0.097], [0, 0, 0], v.donna ? [0.0105, 0.0095, 0.0105] : [0.0125, 0.011, 0.012]);
  for (const l of [-1, 1]) z.add(SFERA_P, mescola(p, "#7a3e34", 0.08), [l * 0.0105, 0.063, -0.088], [0, 0, 0], [0.0072, 0.0058, 0.0075]);
  // orecchie
  for (const l of [-1, 1]) {
    z.add(SFERA, p, [l * 0.079, 0.094, 0.006], [0, l * 0.25, 0], [0.012, 0.028, 0.019]);
    z.add(SFERA_P, mescola(p, "#8a4a3c", 0.18), [l * 0.085, 0.094, 0.004], [0, l * 0.25, 0], [0.005, 0.018, 0.011]);
  }
  // labbra e taglio della bocca
  const labbra = v.donna ? "#b5525e" : mescola(p, "#9a4f48", 0.42);
  const zl = v.barba ? -0.003 : 0;
  z.add(SFERA, labbra, [0, 0.036, -0.088 + zl], [0.15, 0, 0], v.donna ? [0.02, 0.0062, 0.009] : [0.021, 0.0055, 0.009]);
  z.add(SFERA, mescola(labbra, p, 0.15), [0, 0.0265, -0.086 + zl], [-0.2, 0, 0], v.donna ? [0.018, 0.0075, 0.0095] : [0.019, 0.0068, 0.0094]);
  z.add(new THREE.BoxGeometry(1, 1, 1), "#5a2a26", [0, 0.0315, -0.0945 + zl], [0, 0, 0], [0.028, 0.0016, 0.004]);
  return z.fondi();
}

/** Occhi: bulbo, iride, pupilla e riflesso (materiale lucido). */
export function geoOcchi(v: Volto): THREE.BufferGeometry {
  const z = new Pezzi();
  for (const l of [-1, 1]) {
    const o: V3 = [l * 0.031, 0.104, -0.077];
    z.add(SFERA, "#f3efe9", o, [0, 0, 0], 0.0125);
    z.add(SFERA, v.occhi, [o[0], o[1], o[2] - 0.0108], [0, 0, 0], [0.0072, 0.0072, 0.0028]);
    z.add(SFERA_P, "#0c0a0a", [o[0], o[1], o[2] - 0.0128], [0, 0, 0], [0.0034, 0.0034, 0.0015]);
    z.add(SFERA_P, "#ffffff", [o[0] + 0.0025, o[1] + 0.0028, o[2] - 0.0134], [0, 0, 0], [0.0013, 0.0013, 0.0008]);
  }
  return z.fondi();
}

/** Palpebre superiori con le ciglia: ruotano attorno all'asse degli occhi per sbattere. Origine all'altezza degli occhi. */
export function geoPalpebre(v: Volto, c: Colori): THREE.BufferGeometry {
  const z = new Pezzi();
  const cupola = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const l of [-1, 1]) {
    z.add(cupola, mescola(c.pelle, "#8a5a4a", 0.12), [l * 0.031, 0, 0], [0, 0, 0], 0.0138);
    const ciglia = new THREE.TorusGeometry(0.0139, v.donna ? 0.0016 : 0.0011, 4, 16, Math.PI);
    z.add(ciglia, "#1a1412", [l * 0.031, 0, 0], [-Math.PI / 2, 0, 0], 1);
  }
  return z.fondi();
}
export const ALTEZZA_OCCHI: V3 = [0, 0.104, -0.077];

/** Calotta di capelli sopra il cranio: `scala` di quanto sporge; `fronte` e `nuca` dove finisce davanti e dietro (angolo dalla cima, in giri di π). */
function calotta(z: Pezzi, colore: string, scala: number, fronte: number, nuca: number) {
  const arco = ((fronte + nuca) / 2) * Math.PI, incl = ((nuca - fronte) / 2) * Math.PI;
  // prima si inclina la calotta, poi si porta alla forma del cranio: così combacia ovunque
  z.add(new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, arco).rotateX(incl), colore, CRANIO.c, [0, 0, 0], [CRANIO.r[0] * scala, CRANIO.r[1] * scala, CRANIO.r[2] * scala]);
}
/** Frangia: solo davanti, dalla cima fino a `fino` (giri di π). */
function frangia(z: Pezzi, colore: string, fino: number, ampia = 0.8) {
  z.add(new THREE.SphereGeometry(1, 18, 8, Math.PI * 1.5 - ampia, ampia * 2, Math.PI * 0.12, (fino - 0.12) * Math.PI), colore, CRANIO.c, [0, 0, 0], [CRANIO.r[0] * 1.075, CRANIO.r[1] * 1.06, CRANIO.r[2] * 1.08]);
}
/** Guscio che scende ai lati e dietro lasciando libero il viso. */
function guscio(z: Pezzi, colore: string, scala: V3, fino: number, apertura = 0.78) {
  const inizio = Math.PI * 1.5 + apertura;
  z.add(new THREE.SphereGeometry(1, 24, 12, inizio, Math.PI * 2 - apertura * 2, Math.PI * 0.2, fino - Math.PI * 0.2), colore, CRANIO.c, [0, 0, 0], [CRANIO.r[0] * scala[0], CRANIO.r[1] * scala[1], CRANIO.r[2] * scala[2]]);
}

/** Capelli, sopracciglia e barba: un pezzo solo. */
export function geoCapelli(t: Taglio, v: Volto, c: Colori): THREE.BufferGeometry {
  const z = new Pezzi();
  const h = c.capelli, h2 = mescola(h, "#ffffff", 0.08), h3 = scuro(h, 0.8);
  switch (t) {
    case "rasati": calotta(z, mescola(h, c.pelle, 0.15), 1.035, 0.3, 0.8); break;
    case "corti":
    case "ciuffo": {
      calotta(z, h, 1.05, 0.29, 0.8);
      z.add(SFERA, h2, [0, 0.172, -0.005], [0.1, 0, 0], [0.072, 0.036, 0.084]);
      for (const l of [-1, 1]) z.add(new THREE.BoxGeometry(1, 1, 1), h, [l * 0.078, 0.1, -0.012], [0, 0, 0], [0.008, 0.035, 0.018]);
      // riga di lato
      z.add(new THREE.BoxGeometry(1, 1, 1), h3, [-0.03, 0.2, -0.02], [0, 0, 0.18], [0.004, 0.004, 0.08]);
      if (t === "ciuffo") {
        z.add(SFERA, h2, [0.006, 0.19, -0.062], [-0.65, 0, 0.12], [0.056, 0.03, 0.048]);
        z.add(SFERA, h, [-0.02, 0.188, -0.045], [-0.4, 0, -0.2], [0.044, 0.026, 0.044]);
      }
      break;
    }
    case "ricci": {
      calotta(z, h, 1.06, 0.3, 0.8);
      const n = 70;
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 1.6, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.39996;
        const px = Math.cos(a) * r, pz = Math.sin(a) * r;
        const bordo = (0.55 + 0.25 * pz) * Math.PI;
        if (Math.acos(y) > bordo + 0.04) continue; // niente ricci sul viso e sul collo
        z.add(SFERA_P, i % 3 ? h : h2, [CRANIO.c[0] + px * 0.088, CRANIO.c[1] + y * 0.106, CRANIO.c[2] + pz * 0.102], [0, 0, 0], 0.021 + (i % 4) * 0.0025);
      }
      break;
    }
    case "chignon":
    case "coda": {
      calotta(z, h, 1.045, 0.27, 0.78);
      z.add(SFERA, h2, [0, 0.19, 0.0], [0, 0, 0], [0.068, 0.028, 0.078]);
      if (t === "chignon") {
        z.add(SFERA, h, [0, 0.205, 0.07], [0, 0, 0], [0.046, 0.042, 0.046]);
        z.add(TORO, h3, [0, 0.19, 0.052], [0.9, 0, 0], [0.032, 0.032, 0.03]);
      } else {
        z.add(TORO, "#2a2a30", [0, 0.135, 0.1], [1.2, 0, 0], [0.022, 0.022, 0.03]);
        z.add(fuso(0.03, 0.012, 0.24), h, [0, 0.14, 0.105], [0.35, 0, 0], 1);
      }
      break;
    }
    case "caschetto": {
      calotta(z, h, 1.065, 0.27, 0.78);
      guscio(z, h, [1.14, 1.06, 1.12], Math.PI * 0.7);
      frangia(z, h2, 0.33);
      break;
    }
    case "lunghi":
    case "onde": {
      calotta(z, h, 1.065, 0.27, 0.78);
      guscio(z, h, [1.14, 1.06, 1.12], Math.PI * 0.78, 0.82);
      z.add(new THREE.CylinderGeometry(0.09, 0.108, 0.28, 20, 1, true, -1.95, 3.9), h, [0, -0.045, 0.02], [0.08, 0, 0], [1, 1, 0.92]);
      frangia(z, h2, 0.3, 0.6);
      if (t === "onde") for (let i = 0; i < 11; i++) { const a = -1.8 + (i / 10) * 3.6; z.add(SFERA_P, i % 2 ? h : h2, [Math.sin(a) * 0.1, -0.17 + (i % 2) * 0.02, 0.02 + Math.cos(a) * 0.092], [0, 0, 0], [0.026, 0.032, 0.022]); }
      break;
    }
  }
  // sopracciglia
  for (const l of [-1, 1]) z.add(new RoundedBoxGeometry(1, 1, 1, 1, 0.3), scuro(h, 0.85), [l * 0.033, 0.129, -0.087], [0.25, l * -0.18, l * (v.donna ? -0.12 : -0.05)], v.donna ? [0.03, 0.0045, 0.007] : [0.033, 0.0075, 0.009]);
  if (v.barba) {
    // barba corta curata: guance basse, mento, baffi sottili
    z.add(geoCranio(v.donna, 1.03, (u) => u.z < -0.005 && u.y < 0.062 && u.y > -0.02 && !(Math.abs(u.x) < 0.03 && u.y > 0.018 && u.y < 0.05)), mescola(h, c.pelle, 0.38));
    z.add(SFERA, h, [0, 0.0435, -0.0905], [0.1, 0, 0], [0.021, 0.0055, 0.0085]);
  }
  return z.fondi();
}

/** Accessori sulla testa: occhiali, cuffie, cuffia con microfono, orecchini. */
export function geoAccessori(extra: "cuffie" | "microfono" | "occhiali" | undefined, v: Volto, accento: string): THREE.BufferGeometry | null {
  const z = new Pezzi();
  const nero = "#17181d";
  if (extra === "occhiali") {
    for (const l of [-1, 1]) {
      z.add(new THREE.TorusGeometry(0.018, 0.0022, 6, 24), nero, [l * 0.032, 0.104, -0.094], [0, 0, 0], [1, 0.82, 1]);
      z.add(new THREE.BoxGeometry(1, 1, 1), nero, [l * 0.08, 0.108, -0.045], [0, 0, 0], [0.003, 0.003, 0.1]);
    }
    z.add(new THREE.BoxGeometry(1, 1, 1), nero, [0, 0.108, -0.096], [0, 0, 0], [0.026, 0.003, 0.003]);
  } else if (extra === "cuffie" || extra === "microfono") {
    z.add(new THREE.TorusGeometry(0.098, 0.009, 6, 24, Math.PI), nero, [0, 0.11, 0.01], [0, 0, 0], [1, 1.08, 1]);
    for (const l of [-1, 1]) {
      z.add(new THREE.CylinderGeometry(0.036, 0.036, 0.032, 18), nero, [l * 0.095, 0.1, 0.006], [0, 0, Math.PI / 2]);
      z.add(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 18), accento, [l * 0.112, 0.1, 0.006], [0, 0, Math.PI / 2]);
    }
    if (extra === "microfono") {
      z.add(new THREE.CapsuleGeometry(0.0035, 0.1, 2, 6), nero, [0.085, 0.06, -0.05], [0.95, 0, 0.22], 1);
      z.add(SFERA_P, nero, [0.05, 0.035, -0.09], [0, 0, 0], 0.009);
    }
  }
  if (v.donna) for (const l of [-1, 1]) z.add(SFERA_P, "#e2b04a", [l * 0.083, 0.068, -0.002], [0, 0, 0], 0.0055);
  return z.vuoto ? null : z.fondi();
}

/* ---------- Materiali condivisi (colori nei vertici) ---------- */

let normaleStoffa: THREE.CanvasTexture | null = null;
/** Mappa di rilievo del tessuto: trama fine e qualche piega morbida. */
function trama(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (normaleStoffa) return normaleStoffa;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  if (!x) return null;
  const alt = new Float32Array(256 * 256);
  for (let j = 0; j < 256; j++) for (let i = 0; i < 256; i++) {
    const trama = Math.sin(i * 1.6) * Math.sin(j * 1.6) * 0.25 + ((i + j) % 4 < 2 ? 0.12 : -0.12);
    const pieghe = Math.sin((i * 0.6 + j * 0.25) * 0.09) * 1.2 + Math.sin((i * 0.2 - j * 0.7) * 0.05 + 1) * 0.9;
    alt[j * 256 + i] = trama + pieghe;
  }
  const img = x.createImageData(256, 256);
  for (let j = 0; j < 256; j++) for (let i = 0; i < 256; i++) {
    const h = (a: number, b: number) => alt[((b + 256) % 256) * 256 + ((a + 256) % 256)];
    const dx = (h(i + 1, j) - h(i - 1, j)) * 0.5, dy = (h(i, j + 1) - h(i, j - 1)) * 0.5;
    const n = new THREE.Vector3(-dx, -dy, 1).normalize();
    const k = (j * 256 + i) * 4;
    img.data[k] = (n.x * 0.5 + 0.5) * 255; img.data[k + 1] = (n.y * 0.5 + 0.5) * 255; img.data[k + 2] = (n.z * 0.5 + 0.5) * 255; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  normaleStoffa = new THREE.CanvasTexture(c);
  normaleStoffa.wrapS = normaleStoffa.wrapT = THREE.RepeatWrapping;
  normaleStoffa.repeat.set(3, 3);
  return normaleStoffa;
}

let materiali: { stoffa: THREE.Material; pelle: THREE.Material; capelli: THREE.Material; occhi: THREE.Material; plastica: THREE.Material } | null = null;
export function materialiCorpo() {
  if (materiali) return materiali;
  const n = trama();
  // sul telefono materiali più semplici: stesso aspetto, metà del lavoro per la scheda grafica
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    materiali = {
      stoffa: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, normalMap: n, normalScale: new THREE.Vector2(0.3, 0.3) }),
      pelle: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 }),
      capelli: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, side: THREE.DoubleSide }),
      occhi: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.08 }),
      plastica: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.1 }),
    };
    return materiali;
  }
  materiali = {
    stoffa: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.82, sheen: 0.6, sheenRoughness: 0.75, sheenColor: new THREE.Color("#c9c2ff"), normalMap: n, normalScale: new THREE.Vector2(0.35, 0.35) }),
    pelle: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, sheen: 0.12, sheenRoughness: 0.6, sheenColor: new THREE.Color("#ff9f8a") }),
    capelli: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.48, sheen: 0.22, sheenRoughness: 0.4, sheenColor: new THREE.Color("#d8c4b0"), side: THREE.DoubleSide }),
    occhi: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.08, metalness: 0 }),
    plastica: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.1 }),
  };
  return materiali;
}

/* ---------- Cache: una geometria per persona, costruita una volta ---------- */

export type GeoPersona = {
  m: Misure; busto: THREE.BufferGeometry; bustoSpa: THREE.BufferGeometry; bacino: THREE.BufferGeometry; collo: THREE.BufferGeometry;
  coscia: THREE.BufferGeometry; stinco: THREE.BufferGeometry; scarpa: THREE.BufferGeometry;
  omero: THREE.BufferGeometry; avambraccio: THREE.BufferGeometry; omeroNudo: THREE.BufferGeometry; avambraccioNudo: THREE.BufferGeometry;
  manoD: THREE.BufferGeometry; manoS: THREE.BufferGeometry;
  testa: THREE.BufferGeometry; occhi: THREE.BufferGeometry; palpebre: THREE.BufferGeometry; capelli: THREE.BufferGeometry; accessori: THREE.BufferGeometry | null;
};

const cache = new Map<string, GeoPersona>();
export function geoPersona(p: { donna: boolean; barba: boolean; taglio: Taglio; extra?: "cuffie" | "microfono" | "occhiali"; colori: Colori; occhi: string }): GeoPersona {
  const k = JSON.stringify(p);
  const gia = cache.get(k);
  if (gia) return gia;
  const m = p.donna ? DONNA : UOMO, c = p.colori, v: Volto = { donna: p.donna, barba: p.barba, occhi: p.occhi };
  const polsino = scuro(c.divisa, 0.78);
  const g: GeoPersona = {
    m, busto: geoBusto(p.donna, c), bustoSpa: geoBustoSpa(p.donna, c), bacino: geoBacino(p.donna, c), collo: geoCollo(m, c),
    coscia: geoCoscia(m, c), stinco: geoStinco(m, c), scarpa: geoScarpa(c, p.donna),
    omero: geoOmero(m, c.divisa, true), avambraccio: geoAvambraccio(m, c.divisa, polsino, c.pelle),
    omeroNudo: geoOmero(m, c.pelle, true), avambraccioNudo: geoAvambraccio(m, c.pelle, null, c.pelle),
    manoD: geoMano(c, 1, p.donna), manoS: geoMano(c, -1, p.donna),
    testa: geoTesta(v, c), occhi: geoOcchi(v), palpebre: geoPalpebre(v, c), capelli: geoCapelli(p.taglio, v, c), accessori: geoAccessori(p.extra, v, c.accento),
  };
  cache.set(k, g);
  return g;
}
