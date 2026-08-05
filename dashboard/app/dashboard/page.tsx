import { Header } from "@/components/Header";
import { RealtimeSection } from "@/components/RealtimeSection";
import { ReportSection } from "@/components/ReportSection";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <RealtimeSection />
        <ReportSection />
      </main>
    </div>
  );
}
