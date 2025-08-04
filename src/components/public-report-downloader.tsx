"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import type { Transaction, Category, SubCategory, Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { generatePdf } from '@/lib/pdf-generator';

// This component fetches the LATEST user data to generate a public report.
// It assumes the most recently updated user account is the one to be used for public reports.
// This is a workaround to avoid exposing a specific user ID on the client-side.
// A more robust solution would involve a backend function or a specific 'public' document.

export default function PublicReportDownloader() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    transactions: Transaction[];
    categories: Category[];
    subCategories: SubCategory[];
    settings: Settings | null;
  } | null>(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      setIsDataLoading(true);
      try {
        // 1. Find the most recently active user by looking at the latest transaction.
        const latestTransactionQuery = query(collection(db, "transactions"), orderBy("date", "desc"), limit(1));
        const latestTransactionSnapshot = await getDocs(latestTransactionQuery);
        
        if (latestTransactionSnapshot.empty) {
          console.log("No transactions found. Cannot determine public user.");
          setReportData({ transactions: [], categories: [], subCategories: [], settings: null });
          return;
        }

        const latestTransaction = latestTransactionSnapshot.docs[0].data();
        const publicUserId = latestTransaction.userId;
        const settingsDocId = `settings_${publicUserId}`;

        if (!publicUserId) {
            console.log("Latest transaction has no userId.");
            setReportData({ transactions: [], categories: [], subCategories: [], settings: null });
            return;
        }

        // 2. Fetch all data for that user.
        const transactionsQuery = query(collection(db, 'transactions'), orderBy('date', 'desc'));
        const categoriesQuery = query(collection(db, 'categories'), orderBy('name', 'asc'));
        const subCategoriesQuery = query(collection(db, 'subcategories'), orderBy('name', 'asc'));
        const settingsDocRef = doc(db, 'settings', settingsDocId);

        const [
          transactionsSnapshot, 
          categoriesSnapshot, 
          subCategoriesSnapshot, 
          settingsSnap
        ] = await Promise.all([
          getDocs(transactionsQuery),
          getDocs(categoriesQuery),
          getDocs(subCategoriesQuery),
          getDoc(settingsDocRef)
        ]);

        const transactions = transactionsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data(), date: (doc.data().date as Timestamp).toDate() } as Transaction))
            .filter(tx => tx.userId === publicUserId);

        const categories = categoriesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Category))
            .filter(cat => cat.userId === publicUserId);

        const subCategories = subCategoriesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as SubCategory))
            .filter(sc => sc.userId === publicUserId);
            
        const settings = settingsSnap.exists() ? settingsSnap.data() as Settings : null;

        setReportData({ transactions, categories, subCategories, settings });

      } catch (error) {
        console.error("Error fetching public report data:", error);
        setReportData(null);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  const handleExportPDF = async (reportType: 'weekly' | 'monthly') => {
    setIsLoading(true);
    if (!reportData || !reportData.settings) {
      alert("Data laporan publik tidak dapat dimuat. Silakan coba lagi.");
      setIsLoading(false);
      return;
    }
    try {
        await generatePdf({ reportType, ...reportData });
    } catch(error) {
        console.error("Failed to generate PDF", error);
        alert("Gagal membuat laporan PDF.");
    } finally {
        setIsLoading(false);
    }
  };

  const hasData = reportData && reportData.transactions.length > 0 && reportData.settings;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Laporan Publik</CardTitle>
        <CardDescription>
          Unduh laporan keuangan publik dalam format PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-2 justify-center">
        {isDataLoading ? (
             <Button disabled size="lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat Data...
            </Button>
        ) : hasData ? (
          <>
            <Button onClick={() => handleExportPDF('weekly')} size="sm" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Unduh Mingguan
            </Button>
            <Button onClick={() => handleExportPDF('monthly')} size="sm" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Unduh Bulanan
            </Button>
          </>
        ) : (
            <p className="text-sm text-muted-foreground">Laporan publik tidak tersedia.</p>
        )}
      </CardContent>
    </Card>
  );
}
