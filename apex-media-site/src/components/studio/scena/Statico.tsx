"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* =============================================================
   Unisce gli oggetti fermi in pochi pezzi grandi.
   L'ufficio è fatto di quasi duemila pezzi (gambe, piani, foglie,
   libri…): disegnarli uno per uno a ogni fotogramma metteva in
   crisi le schede grafiche meno recenti. Qui, appena montati, i
   pezzi con lo stesso materiale vengono fusi in un'unica geometria:
   l'aspetto non cambia, i disegni per fotogramma crollano.
   Restano separati: ciò che si tocca (ha un onClick), ciò che si
   muove (dentro un gruppo con userData.dinamico) e le scritte.
   Quando cambia `chiave` (es. un cliente in più) si rifà la fusione.
   ============================================================= */

type Fuso = { mesh: THREE.Mesh; originali: THREE.Mesh[] };

function toccabile(o: THREE.Object3D): boolean {
  const h = (o as unknown as { __r3f?: { handlers?: Record<string, unknown> } }).__r3f?.handlers;
  return Boolean(h && Object.keys(h).length);
}

/** Geometria pronta per la fusione: posizione nel gruppo, solo posizione/normali/uv, con indice. */
function prepara(m: THREE.Mesh, inversa: THREE.Matrix4): THREE.BufferGeometry | null {
  const g = m.geometry.clone();
  if (!g.getAttribute("position")) return null;
  for (const nome of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(nome)) g.deleteAttribute(nome);
  if (!g.getAttribute("normal")) g.computeVertexNormals();
  if (!g.getAttribute("uv")) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(g.getAttribute("position").count * 2), 2));
  if (!g.index) { const n = g.getAttribute("position").count; g.setIndex(Array.from({ length: n }, (_, i) => i)); }
  g.morphAttributes = {};
  g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inversa, m.matrixWorld));
  return g;
}

export function Statico({ chiave, children }: { chiave: string; children: React.ReactNode }) {
  const gruppo = useRef<THREE.Group>(null);
  const fusi = useRef<Fuso[]>([]);

  useEffect(() => {
    const g = gruppo.current;
    if (!g) return;
    let annullato = false;
    // aspetta che tutti i figli siano montati e posizionati
    const t = setTimeout(() => {
      if (annullato) return;
      g.updateMatrixWorld(true);
      const inversa = g.matrixWorld.clone().invert();
      const gruppi = new Map<string, { mat: THREE.Material; ombra: boolean; riceve: boolean; mesh: THREE.Mesh[] }>();
      const visita = (o: THREE.Object3D) => {
        if (o.userData.dinamico || o.userData.fuso) return;
        const m = o as THREE.Mesh;
        if (m.isMesh && !(m as unknown as THREE.InstancedMesh).isInstancedMesh && m.visible && !Array.isArray(m.material) && !toccabile(m)) {
          const mat = m.material as THREE.Material;
          // le trasparenze restano separate: vanno ordinate per distanza
          if (!mat.transparent) {
            const k = `${mat.uuid}|${m.castShadow}|${m.receiveShadow}`;
            if (!gruppi.has(k)) gruppi.set(k, { mat, ombra: m.castShadow, riceve: m.receiveShadow, mesh: [] });
            gruppi.get(k)!.mesh.push(m);
          }
        }
        for (const c of o.children) visita(c);
      };
      for (const c of g.children) visita(c);

      for (const { mat, ombra, riceve, mesh } of gruppi.values()) {
        if (mesh.length < 2) continue;
        const geo = mesh.map((m) => prepara(m, inversa)).filter((x): x is THREE.BufferGeometry => x !== null);
        const unita = geo.length === mesh.length ? mergeGeometries(geo, false) : null;
        for (const x of geo) x.dispose();
        if (!unita) continue;
        const nuovo = new THREE.Mesh(unita, mat);
        nuovo.castShadow = ombra; nuovo.receiveShadow = riceve; nuovo.userData.fuso = true;
        nuovo.matrixAutoUpdate = false;
        g.add(nuovo);
        for (const m of mesh) m.visible = false;
        fusi.current.push({ mesh: nuovo, originali: mesh });
      }
    }, 300);

    return () => {
      annullato = true;
      clearTimeout(t);
      // disfa la fusione: tornano visibili i pezzi originali
      for (const f of fusi.current) {
        f.mesh.removeFromParent();
        f.mesh.geometry.dispose();
        for (const m of f.originali) m.visible = true;
      }
      fusi.current = [];
    };
  }, [chiave]);

  return <group ref={gruppo}>{children}</group>;
}
