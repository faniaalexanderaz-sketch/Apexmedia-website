import type { Metadata } from "next";
import { Suspense } from "react";
import { Pannello } from "@/components/pannello/Pannello";

export const metadata: Metadata = { title: "业绩面板 · Essenza d'Oriente", robots: { index: false, follow: false } };

export default function Pagina({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <Suspense fallback={<div className="p-wrap" style={{ paddingTop: 100 }}><div className="p-skeleton" style={{ height: 140 }} /><div className="p-skeleton" style={{ height: 300, marginTop: 20 }} /></div>}>
      <Pannello percorso="/jenny" ruoloRichiesto="cliente" linguaDefault="zh" searchParams={searchParams} />
    </Suspense>
  );
}
