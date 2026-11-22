import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { StudioApp } from "@/components/studio/StudioApp";
import { dentroLoStudio } from "@/lib/studio/auth";
import { caricaDati } from "@/lib/studio/dati";

export default function Pagina() {
  return (
    <Suspense fallback={<div className="st-attesa" role="status"><span className="st-attesa-punto" />Apro lo studio…</div>}>
      <Studio />
    </Suspense>
  );
}

async function Studio() {
  await connection();
  if (!(await dentroLoStudio())) redirect("/studio/login");
  return <StudioApp iniziali={await caricaDati()} />;
}
