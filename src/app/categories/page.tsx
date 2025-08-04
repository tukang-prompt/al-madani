import { Header } from "@/components/header";
import CategoriesClient from "@/components/categories-client";
import { MainLayout } from "@/components/main-layout";

export default function CategoriesPage() {
  return (
    <MainLayout>
      <Header title="Kelola Kategori" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <CategoriesClient />
      </main>
    </MainLayout>
  );
}
