
import { Header } from "@/components/header";
import SettingsClient from "@/components/settings-client";
import { MainLayout } from "@/components/main-layout";
import { UserNav } from "@/components/user-nav";

export default function SettingsPage() {
  return (
    <MainLayout>
      <Header title="Pengaturan">
        <UserNav />
      </Header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <SettingsClient />
      </main>
    </MainLayout>
  );
}
