import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/data/site";

export const alt = "Apex Media — Il marketing che fa squillare il telefono. Agenzia di marketing ad Alessandria.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Immagine Open Graph: logo, H1 dell’hero con evidenziatore, striscia tricolore, sfondo carta. */
export default async function OpenGraphImage() {
  const font = await readFile(join(process.cwd(), "src/app/fonts/SpaceGrotesk-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F6F5F1",
          color: "#0B0D14",
          fontFamily: "Space Grotesk",
          padding: "64px 72px 56px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="40" height="37" viewBox="0 0 28 26" fill="#0B0D14">
            <path d="M14 0 L0 26 L7.2 26 L17.6 6.6 Z" />
            <path d="M18.9 9.2 L28 26 L20.9 26 L15.2 15.6 Z" />
            <path d="M13.4 14.2 L17.3 21.4 L9.5 21.4 Z" />
          </svg>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: -1 }}>
            <span>APEX</span>
            <span style={{ color: "#5B2EFF", marginLeft: 10 }}>MEDIA</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 72, fontSize: 92, lineHeight: 0.98, letterSpacing: -3.5 }}>
          <div style={{ display: "flex" }}>Il marketing che fa</div>
          <div style={{ display: "flex", marginTop: 6 }}>
            <span
              style={{
                background: "#FFD84D",
                padding: "0 14px",
                margin: "0 -14px",
                transform: "rotate(-0.6deg)",
              }}
            >
              squillare il telefono.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", alignItems: "flex-end", fontSize: 24 }}>
          <div style={{ display: "flex", color: "#5c5e66" }}>Agenzia di marketing per attività locali — {site.city}</div>
          <div style={{ display: "flex" }}>{site.domain}</div>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, display: "flex" }}>
          <div style={{ flex: 1, background: "#5B2EFF" }} />
          <div style={{ flex: 1, background: "#2F6BFF" }} />
          <div style={{ flex: 1, background: "#FFD84D" }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Space Grotesk", data: font, weight: 700, style: "normal" }] },
  );
}
