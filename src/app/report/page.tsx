import ReportClient from "@/components/report-client";
import { Header } from "@/components/header";
import { MainLayout } from "@/components/main-layout";

export default function ReportPage() {
  return (
    <MainLayout>
      <Header title="Laporan Keuangan" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <ReportClient />
      </main>
    </MainLayout>
  );
}
