import { Header } from "@/components/header";
import CategoriesClient from "@/components/categories-client";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Kelola Kategori" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <CategoriesClient />
      </main>
    </div>
  );
}
