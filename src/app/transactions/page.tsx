
import { Header } from "@/components/header";
import TransactionsClient from "@/components/transactions-client";
import { MainLayout } from "@/components/main-layout";
import { UserNav } from "@/components/user-nav";

export default function TransactionsPage() {
  return (
    <MainLayout>
      <Header title="Semua Transaksi">
        <UserNav />
      </Header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <TransactionsClient />
      </main>
    </MainLayout>
  );
}
