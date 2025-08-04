"use client";

import React, { useMemo, useState } from "react";
import { useMockData } from "@/hooks/use-mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import type { Transaction } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardClient() {
  const { transactions } = useMockData();

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
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  return (
    <>
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-xs font-medium">Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-base font-bold">{formatCurrency(stats.income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-xs font-medium">Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-base font-bold">{formatCurrency(stats.expense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-xs font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-base font-bold">{formatCurrency(stats.balance)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={tx.type === 'income' ? 'bg-primary/20' : 'bg-destructive/20'}>
                      <tx.category.icon className={`h-4 w-4 ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1 flex-1">
                    <p className="text-sm font-medium leading-none">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{tx.category.name}</p>
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
    </>
  );
}
