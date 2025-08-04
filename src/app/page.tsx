import { Header } from "@/components/header";
import DashboardClient from "@/components/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Dasbor" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <DashboardClient />
      </main>
    </div>
  );
}
