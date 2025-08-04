import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DataProvider } from '@/hooks/use-data';
import { AuthProvider } from '@/hooks/use-auth';
import AuthGuard from '@/components/auth-guard';
import { Pwa } from '@/components/pwa';

export const metadata: Metadata = {
  title: 'Al Madani Finance Tracker',
  description: 'Aplikasi pencatatan keuangan DKM Masjid Al Madani',
  manifest: '/manifest.json',
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
        <meta name="theme-color" content="#90EE90" />
      </head>
      <body className="font-body antialiased h-full bg-muted/20">
        <AuthProvider>
          <DataProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </DataProvider>
        </AuthProvider>
        <Toaster />
        <Pwa />
      </body>
    </html>
  );
}
