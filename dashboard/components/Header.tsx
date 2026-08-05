"use client";

import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-bg-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-purple text-sm font-bold text-white">
            EO
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-white sm:text-base">
              Essenza d&apos;Oriente
            </h1>
            <p className="text-[11px] leading-tight text-gray-500">essenzadoriente.it — Traffic Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Gestito da</p>
            <p className="text-xs font-semibold text-brand-yellow">Apex Media</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-bg-border px-2.5 py-1.5 text-xs text-gray-400 transition hover:border-negative/40 hover:text-negative"
          >
            Esci
          </button>
        </div>
      </div>
    </header>
  );
}
