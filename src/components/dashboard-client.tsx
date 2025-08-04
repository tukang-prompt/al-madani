"use client";

import React, { useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import { generatePdf } from "@/lib/pdf-generator";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardClient() {
  const { transactions, categories, subCategories, settings, loading } = useData();

  const stats = useMemo(() => {
    const openingBalance = settings?.openingBalance || 0;
    const result = transactions.reduce(
      (acc, tx) => {
        if (tx.type === "income") {
          acc.income += tx.amount;
        } else {
          acc.expense += tx.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
    
    const balance = openingBalance + result.income - result.expense;

    return { ...result, balance };
  }, [transactions, settings]);

  const recentTransactions = useMemo(() => {
    return transactions
      .slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [transactions]);

  const getSubCategoryName = (id: string) => subCategories.find(sc => sc.id === id)?.name || 'Lainnya';

  const handleExportPDF = async (reportType: 'weekly' | 'monthly') => {
    if (!settings) {
      alert("Pengaturan aplikasi belum dimuat.");
      return;
    }
    await generatePdf({ reportType, settings, transactions, categories, subCategories });
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Unduh Laporan PDF</CardTitle>
           <CardDescription>
            Pilih jenis laporan keuangan yang ingin diunduh dalam format PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => handleExportPDF('weekly')} size="sm" disabled={loading || transactions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Unduh Mingguan
          </Button>
          <Button onClick={() => handleExportPDF('monthly')} size="sm" disabled={loading || transactions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Unduh Bulanan
          </Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.income)}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.expense)}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-sm font-medium">Saldo Akhir</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.balance)}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                   <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                       <Skeleton className="h-4 w-3/4" />
                       <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-1/4" />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4">
                  <div className="grid gap-1 flex-1">
                    <p className="text-sm font-medium leading-none">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{getSubCategoryName(tx.subCategoryId)}</p>
                  </div>
                  <div className={`font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada transaksi.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
    
