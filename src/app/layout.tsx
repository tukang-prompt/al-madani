import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { MockDataProvider } from '@/hooks/use-mock-data';
import { SideNav } from '@/components/side-nav';

export const metadata: Metadata = {
  title: 'Al Madani Finance Tracker',
  description: 'Aplikasi pencatatan keuangan DKM Masjid Al Madani',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased h-full">
        <MockDataProvider>
          <SidebarProvider>
            <div className="flex h-full">
              <SideNav />
              <SidebarInset className="flex-1 flex flex-col h-full">
                {children}
              </SidebarInset>
            </div>
          </SidebarProvider>
        </MockDataProvider>
        <Toaster />
      </body>
    </html>
  );
}
