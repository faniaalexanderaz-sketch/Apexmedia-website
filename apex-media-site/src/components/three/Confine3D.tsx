"use client";

import { Component, type ReactNode } from "react";

/* Se una scena 3D va in errore (WebGL disattivato o rotto dal browser, scheda grafica
   in difficoltà), qui si ferma l'errore: si vede `alternativa` e il resto della pagina
   continua a funzionare, invece di cadere tutta su "This page couldn't load". */
export class Confine3D extends Component<{ children: ReactNode; alternativa: ReactNode; onErrore?: () => void }, { errore: boolean }> {
  state = { errore: false };
  static getDerivedStateFromError() { return { errore: true }; }
  componentDidCatch(e: unknown) { console.warn("[3D] scena fermata:", e); this.props.onErrore?.(); }
  render() { return this.state.errore ? this.props.alternativa : this.props.children; }
}

/** Prova se il browser può davvero creare un contesto WebGL adesso. */
export function webglDisponibile(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    const ok = !gl.isContextLost();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}
