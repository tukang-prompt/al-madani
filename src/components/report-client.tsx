
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
  const { transactions, categories, subCategories, settings, loading } = useData();

  const reportData = React.useMemo(() => {
    if (loading || !settings) return null;

    const sortedTransactions = transactions.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let runningBalance = settings.openingBalance || 0;
    let totalIncome = 0;
    let totalExpense = 0;

    const allIncomeSubCategories = subCategories.filter(sc => sc.type === 'income');
    const allExpenseSubCategories = subCategories.filter(sc => sc.type === 'expense');

    const incomeReport = categories
      .filter(c => c.type === 'income')
      .map(cat => {
        const subs = allIncomeSubCategories.filter(sc => sc.parentId === cat.id);
        const subCategoryReports = subs.map(sc => {
            const subCategoryTransactions = sortedTransactions.filter(tx => tx.subCategoryId === sc.id);
            const subCategoryTotal = subCategoryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
            totalIncome += subCategoryTotal;
            runningBalance += subCategoryTotal;
            return {
                name: sc.name,
                total: subCategoryTotal,
                transactions: subCategoryTransactions.map(tx => {
                    return {
                        description: tx.description,
                        amount: tx.amount,
                    }
                })
            }
        });
        return {
            name: cat.name,
            subCategories: subCategoryReports
        }
      });
      
    const expenseReport = categories
        .filter(c => c.type === 'expense')
        .map(cat => {
            const subs = allExpenseSubCategories.filter(sc => sc.parentId === cat.id);
            const subCategoryReports = subs.map(sc => {
                const subCategoryTransactions = sortedTransactions.filter(tx => tx.subCategoryId === sc.id);
                if(subCategoryTransactions.length === 0) return null;

                const subCategoryTotal = subCategoryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
                totalExpense += subCategoryTotal;
                runningBalance -= subCategoryTotal;
                return {
                    name: sc.name,
                    total: subCategoryTotal,
                    transactions: subCategoryTransactions.map(tx => {
                        return {
                            description: tx.description,
                            amount: tx.amount,
                        }
                    })
                }
            }).filter(Boolean);
            
            if(subCategoryReports.length === 0) return null;

            return {
                name: cat.name,
                subCategories: subCategoryReports
            }
      }).filter(Boolean);


    return {
      openingBalance: settings.openingBalance,
      incomeReport,
      expenseReport,
      totalIncome,
      totalExpense,
      finalBalance: settings.openingBalance + totalIncome - totalExpense,
    };

  }, [transactions, categories, subCategories, settings, loading]);

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
  
  const { openingBalance, incomeReport, expenseReport, totalIncome, totalExpense, finalBalance } = reportData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Laporan Keuangan Kumulatif</CardTitle>
          <CardDescription>
            Berikut adalah ringkasan seluruh pemasukan dan pengeluaran yang pernah tercatat.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[55%]">Keterangan</TableHead>
                        <TableHead className="text-right w-[25%]">Jumlah</TableHead>
                        <TableHead className="text-right w-[20%]">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="font-bold bg-muted/50">
                        <TableCell>Saldo Awal (Modal)</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">{formatCurrency(openingBalance)}</TableCell>
                    </TableRow>
                    
                    <TableRow className="font-bold bg-muted/30">
                        <TableCell colSpan={3}>Pemasukan</TableCell>
                    </TableRow>
                    {incomeReport.map((catReport, catIndex) => (
                        <React.Fragment key={`inc-cat-${catIndex}`}>
                            <TableRow className="font-semibold text-sm">
                                <TableCell colSpan={3} className="pt-3 pb-1 pl-6">{catReport.name}</TableCell>
                            </TableRow>
                            {catReport.subCategories.map((scReport, scIndex) => (
                                <TableRow key={`inc-sc-${scIndex}`}>
                                    <TableCell className="pl-10 text-muted-foreground">{scReport.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(scReport.total)}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            ))}
                        </React.Fragment>
                    ))}
                    
                     <TableRow className="font-bold bg-muted/30">
                        <TableCell colSpan={3}>Pengeluaran</TableCell>
                    </TableRow>
                    {expenseReport.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-3">Tidak ada pengeluaran</TableCell></TableRow>
                    ) : expenseReport.map((catReport, catIndex) => (
                        <React.Fragment key={`exp-cat-${catIndex}`}>
                            <TableRow className="font-semibold text-sm">
                                <TableCell colSpan={3} className="pt-3 pb-1 pl-6">{catReport.name}</TableCell>
                            </TableRow>
                            {catReport.subCategories.map((scReport, scIndex) => (
                                <TableRow key={`exp-sc-${scIndex}`}>
                                    <TableCell className="pl-10 text-muted-foreground">{scReport.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(scReport.total)}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            ))}
                        </React.Fragment>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="font-bold text-base bg-muted/50">
                        <TableCell>Total Pemasukan</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalIncome)}</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                     <TableRow className="font-bold text-base bg-muted/50">
                        <TableCell>Total Pengeluaran</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalExpense)}</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                     <TableRow className="font-bold text-base bg-muted/50">
                        <TableCell>Saldo Akhir</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">{formatCurrency(finalBalance)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
