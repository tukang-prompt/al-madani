import { Header } from "@/components/header";
import TransactionsClient from "@/components/transactions-client";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Semua Transaksi" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <TransactionsClient />
      </main>
    </div>
  );
}
