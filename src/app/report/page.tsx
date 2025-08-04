import ReportClient from "@/components/report-client";
import { Header } from "@/components/header";

export default function ReportPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Laporan Keuangan" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <ReportClient />
      </main>
    </div>
  );
}
