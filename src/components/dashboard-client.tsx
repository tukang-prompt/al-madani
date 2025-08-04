"use client";

import React, { useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardClient() {
  const { transactions, categories, loading } = useData();

  const stats = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === "income") {
          acc.income += tx.amount;
        } else {
          acc.expense += tx.amount;
        }
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions
      .slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [transactions]);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Lainnya';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-xs font-medium">Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-base font-bold">{formatCurrency(stats.income)}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-xs font-medium">Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-base font-bold">{formatCurrency(stats.expense)}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-xs font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loading ? <Skeleton className="h-6 w-3/4" /> : <div className="text-base font-bold">{formatCurrency(stats.balance)}</div>}
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
                    <p className="text-sm text-muted-foreground">{getCategoryName(tx.categoryId)}</p>
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
