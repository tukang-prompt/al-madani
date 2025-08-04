
import { Header } from "@/components/header";
import DashboardClient from "@/components/dashboard-client";
import { MainLayout } from "@/components/main-layout";
import { UserNav } from "@/components/user-nav";

export default function DashboardPage() {
  return (
    <MainLayout>
      <Header title="Dasbor">
        <UserNav />
      </Header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <DashboardClient />
      </main>
    </MainLayout>
  );
}
