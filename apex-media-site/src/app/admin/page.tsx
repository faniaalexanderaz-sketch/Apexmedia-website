import type { Metadata } from "next";
import { Suspense } from "react";
import { Pannello } from "@/components/pannello/Pannello";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <Suspense fallback={<p className="label-mono p-10 text-ink/50">…</p>}>
        <Pannello percorso="/admin" ruoloRichiesto="admin" linguaDefault="it" searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
