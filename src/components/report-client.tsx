
"use client";

import { useData } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "./ui/skeleton";
import React from "react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ReportClient() {
  const { transactions, categories, settings, loading } = useData();

  const getPreviousFriday = (date = new Date()) => {
    const previous = new Date(date.getTime());
    const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
    const daysToSubtract = (dayOfWeek + 7 - 5) % 7; // Days to subtract to get to last Friday
     if(daysToSubtract === 0 && date.getDay() === 5) { // if today is Friday
       previous.setDate(date.getDate() - 7);
    } else {
       previous.setDate(date.getDate() - daysToSubtract);
    }
    return previous;
  };

  const reportData = React.useMemo(() => {
    if (loading || !settings) return null;

    const sortedTransactions = transactions.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    let runningBalance = settings.openingBalance || 0;
    let totalIncome = 0;
    let totalExpense = 0;
    
    const openingBalanceRow = {
        description: `Saldo per Jumat, ${format(getPreviousFriday(), "d MMMM yyyy", { locale: id })}`,
        income: 0,
        expense: 0,
        balance: runningBalance,
    };
    
    const reportRows: { category: string; description: string; income: number; expense: number; balance: number; isCategoryHeader?: boolean; isTotal?: boolean; }[] = [];

    // Pemasukan
    incomeCategories.forEach(cat => {
        reportRows.push({ category: cat.name, description: '', income: 0, expense: 0, balance: 0, isCategoryHeader: true });
        const categoryTransactions = sortedTransactions.filter(tx => tx.categoryId === cat.id);
        if (categoryTransactions.length > 0) {
            categoryTransactions.forEach(tx => {
                runningBalance += tx.amount;
                totalIncome += tx.amount;
                reportRows.push({
                    category: cat.name,
                    description: tx.description,
                    income: tx.amount,
                    expense: 0,
                    balance: runningBalance,
                });
            });
        }
    });

    // Pengeluaran
    expenseCategories.forEach(cat => {
        reportRows.push({ category: cat.name, description: '', income: 0, expense: 0, balance: 0, isCategoryHeader: true });
        const categoryTransactions = sortedTransactions.filter(tx => tx.categoryId === cat.id);
        if (categoryTransactions.length > 0) {
            categoryTransactions.forEach(tx => {
                runningBalance -= tx.amount;
                totalExpense += tx.amount;
                reportRows.push({
                    category: cat.name,
                    description: tx.description,
                    income: 0,
                    expense: tx.amount,
                    balance: runningBalance,
                });
            });
        }
    });

    return {
      openingBalanceRow,
      rows: reportRows.filter(r => !r.isCategoryHeader || reportRows.some(i => i.category === r.category && !i.isCategoryHeader)), // only show category if it has items
      totalIncome,
      totalExpense,
      finalBalance: runningBalance
    };

  }, [transactions, categories, settings, loading]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Laporan Keuangan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center text-muted-foreground py-8">
            Data laporan tidak tersedia. Mohon atur pengaturan aplikasi terlebih dahulu.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const { openingBalanceRow, rows, totalIncome, totalExpense, finalBalance } = reportData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Ringkasan Keuangan</CardTitle>
          <CardDescription>
            Berikut adalah ringkasan pemasukan dan pengeluaran yang tercatat.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50%]">Keterangan</TableHead>
                        <TableHead className="text-right">Pemasukan</TableHead>
                        <TableHead className="text-right">Pengeluaran</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="font-bold bg-muted/50">
                        <TableCell>{openingBalanceRow.description}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">{formatCurrency(openingBalanceRow.balance)}</TableCell>
                    </TableRow>
                    
                    <TableRow className="font-bold bg-muted/30">
                        <TableCell colSpan={4}>Pemasukan</TableCell>
                    </TableRow>
                    {rows.filter(r => categories.find(c => c.id === r.category)?.type === 'income').length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Tidak ada pemasukan</TableCell></TableRow>
                    ) : (
                        rows.filter(r => categories.find(c => c.id === r.category)?.type === 'income').map((row, index) => (
                             <React.Fragment key={`income-${index}`}>
                                { (index === 0 || rows[index-1].category !== row.category) && 
                                    <TableRow className="font-semibold text-sm"><TableCell colSpan={4} className="py-1.5 pl-6">{row.category}</TableCell></TableRow>
                                }
                               <TableRow>
                                    <TableCell className="pl-8 text-muted-foreground">{row.description}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.income)}</TableCell>
                                    <TableCell className="text-right">-</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                                </TableRow>
                             </React.Fragment>
                        ))
                    )}
                    
                    <TableRow className="font-bold bg-muted/30">
                        <TableCell colSpan={4}>Pengeluaran</TableCell>
                    </TableRow>
                    {rows.filter(r => categories.find(c => c.id === r.category)?.type === 'expense').length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Tidak ada pengeluaran</TableCell></TableRow>
                    ) : (
                         rows.filter(r => categories.find(c => c.id === r.category)?.type === 'expense').map((row, index) => (
                             <React.Fragment key={`expense-${index}`}>
                                { (index === 0 || rows.filter(r => categories.find(c => c.id === r.category)?.type === 'expense')[index-1]?.category !== row.category) && 
                                    <TableRow className="font-semibold text-sm"><TableCell colSpan={4} className="py-1.5 pl-6">{row.category}</TableCell></TableRow>
                                }
                               <TableRow>
                                    <TableCell className="pl-8 text-muted-foreground">{row.description}</TableCell>
                                    <TableCell className="text-right">-</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.expense)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow className="font-bold text-base">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalIncome)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalExpense)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(finalBalance)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
