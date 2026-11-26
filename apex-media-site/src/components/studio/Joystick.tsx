"use client";

import { useRef } from "react";
import { comandi } from "./scena/comandi";

/* =============================================================
   Due joystick per il telefono: a sinistra ti muovi nell'ufficio,
   a destra giri la vista. Si vedono solo sugli schermi touch.
   ============================================================= */

function Levetta({ lato, etichetta }: { lato: "movimento" | "visuale"; etichetta: string }) {
  const pomello = useRef<HTMLSpanElement>(null);
  const centro = useRef({ x: 0, y: 0, r: 1, id: -1 });
  const scrivi = (x: number, y: number) => {
    if (lato === "movimento") { comandi.mx = x; comandi.my = y; } else { comandi.vx = x; comandi.vy = y; }
    if (pomello.current) pomello.current.style.transform = `translate(${x * centro.current.r}px, ${y * centro.current.r}px)`;
  };
  return (
    <div
      className="st-joy"
      data-lato={lato}
      role="application"
      aria-label={etichetta}
      onPointerDown={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        centro.current = { x: b.left + b.width / 2, y: b.top + b.height / 2, r: b.width * 0.32, id: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.dataset.attivo = "1";
      }}
      onPointerMove={(e) => {
        const c = centro.current;
        if (e.pointerId !== c.id) return;
        let x = (e.clientX - c.x) / c.r, y = (e.clientY - c.y) / c.r;
        const l = Math.hypot(x, y);
        if (l > 1) { x /= l; y /= l; }
        scrivi(x, y);
      }}
      onPointerUp={(e) => { centro.current.id = -1; delete e.currentTarget.dataset.attivo; scrivi(0, 0); }}
      onPointerCancel={(e) => { centro.current.id = -1; delete e.currentTarget.dataset.attivo; scrivi(0, 0); }}
    >
      <span ref={pomello} className="st-joy-pomello" />
      <small>{lato === "movimento" ? "muoviti" : "guarda"}</small>
    </div>
  );
}

export function Joystick() {
  return (
    <>
      <Levetta lato="movimento" etichetta="Joystick: muoviti nell'ufficio" />
      <Levetta lato="visuale" etichetta="Joystick: gira la vista" />
    </>
  );
}
