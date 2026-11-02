import type { Metadata } from "next";
import { Suspense } from "react";
import { Pannello } from "@/components/pannello/Pannello";

export const metadata: Metadata = { title: "数据面板 · Essenza d'Oriente", robots: { index: false, follow: false } };

/** Pannello cliente: sola lettura, si apre in cinese. */
export default function JennyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <Suspense fallback={<p className="label-mono p-10 text-ink/50">…</p>}>
        <Pannello percorso="/jenny" ruoloRichiesto="cliente" linguaDefault="zh" searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
