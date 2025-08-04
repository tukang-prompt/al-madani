import { Header } from "@/components/header";
import DashboardClient from "@/components/dashboard-client";
import { MainLayout } from "@/components/main-layout";

export default function DashboardPage() {
  return (
    <MainLayout>
      <Header title="Dasbor" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <DashboardClient />
      </main>
    </MainLayout>
  );
}
