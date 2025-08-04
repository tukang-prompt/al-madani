
"use client";

import React, { useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/lib/types";
import { Button } from "./ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format, startOfMonth, endOfMonth, subDays, addDays } from "date-fns";
import { id } from "date-fns/locale";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatCurrencyPDF(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
  }).format(amount);
}

const getImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      } else {
        reject(new Error("Gagal membuat canvas context"));
      }
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};


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
    if (!settings) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    try {
      const logoBase64 = await getImageAsBase64('/logo.png');
      doc.addImage(logoBase64, 'PNG', margin, 15, 20, 20, undefined, 'FAST');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("PENGURUS", margin + 25, 18);
      doc.setFontSize(12);
      doc.text(`MASJID ${settings.mosqueName.toUpperCase()}`, margin + 25, 24);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(settings.mosqueAddress, margin + 25, 30);
      
      doc.setLineWidth(0.5);
      doc.line(margin, 40, pageWidth - margin, 40);

      const now = new Date();
      let startDate, endDate, reportTitle, balanceTitle;

      if (reportType === 'monthly') {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        reportTitle = `Laporan Bulan ${format(now, "MMMM yyyy", { locale: id })}`;
        
        const prevMonthEnd = subDays(startDate, 1);
        balanceTitle = `Saldo s/d ${format(prevMonthEnd, "d MMMM yyyy", { locale: id })}`;

      } else { // weekly
        const dayOfWeek = now.getDay(); // Sunday = 0, Friday = 5
        const daysSinceLastFriday = (dayOfWeek + 7 - 5) % 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysSinceLastFriday);
        startDate.setHours(0, 0, 0, 0); // Start of Friday
        
        endDate = addDays(startDate, 6); // The upcoming Thursday
        endDate.setHours(23, 59, 59, 999); // End of Thursday
        reportTitle = `Laporan Mingguan (${format(startDate, "d MMM", { locale: id })} - ${format(endDate, "d MMM yyyy", { locale: id })})`;
        
        const prevThursday = subDays(startDate, 1);
        balanceTitle = `Saldo s/d Kamis, ${format(prevThursday, "d MMMM yyyy", { locale: id })}`;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(reportTitle, pageWidth / 2, 50, { align: "center" });

      const periodTransactions = transactions.filter(tx => tx.date >= startDate && tx.date <= endDate);
      const previousTransactions = transactions.filter(tx => tx.date < startDate);

      let runningBalance = settings.openingBalance;
      previousTransactions.forEach(tx => {
          runningBalance += tx.type === 'income' ? tx.amount : -tx.amount;
      });
      
      const sortedTransactions = periodTransactions.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
      
      const incomeCategories = categories.filter(c => c.type === 'income');
      const expenseCategories = categories.filter(c => c.type === 'expense');

      let totalIncome = 0;
      let totalExpense = 0;
      
      const tableBody = [] as any[];

      tableBody.push([
          { content: 'Saldo', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);
      tableBody.push([
          '1',
          balanceTitle,
          '-',
          '-',
          { content: formatCurrencyPDF(runningBalance), styles: { halign: 'right' } }
      ]);

      tableBody.push([
          { content: 'Pemasukan', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);
      
      incomeCategories.forEach(cat => {
          const categorySubCategories = subCategories.filter(sc => sc.parentId === cat.id);
          const categoryTransactions = sortedTransactions.filter(tx => categorySubCategories.some(sc => sc.id === tx.subCategoryId));
          
          if(categorySubCategories.length > 0) {
            tableBody.push([{ content: cat.name, colSpan: 5, styles: { fontStyle: 'bold', halign: 'left' } }]);

            categorySubCategories.forEach(sc => {
                const subCategoryTransactions = sortedTransactions.filter(tx => tx.subCategoryId === sc.id);
                const subCategoryTotal = subCategoryTransactions.reduce((sum, tx) => sum + tx.amount, 0);

                // Always show income subcategories
                tableBody.push([
                    '-',
                    sc.name,
                    { content: formatCurrencyPDF(subCategoryTotal), styles: { halign: 'right' } },
                    '-',
                    ''
                ]);
                totalIncome += subCategoryTotal;
                runningBalance += subCategoryTotal;
            });
          }
      });
       if (sortedTransactions.filter(tx => tx.type === 'income').length === 0) {
           tableBody.push([
              { content: 'Tidak ada pemasukan periode ini', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
          ]);
      }
      
      tableBody.push([
          { content: 'Pengeluaran', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);
      
      expenseCategories.forEach(cat => {
          const categorySubCategories = subCategories.filter(sc => sc.parentId === cat.id);
          const categoryTransactions = sortedTransactions.filter(tx => categorySubCategories.some(sc => sc.id === tx.subCategoryId));

          if (categoryTransactions.length > 0) {
              tableBody.push([{ content: cat.name, colSpan: 5, styles: { fontStyle: 'bold', halign: 'left' } }]);
              
              categorySubCategories.forEach(sc => {
                  const subCategoryTransactions = sortedTransactions.filter(tx => tx.subCategoryId === sc.id);
                  if (subCategoryTransactions.length > 0) {
                    const subCategoryTotal = subCategoryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
                    tableBody.push([
                        '-',
                        sc.name,
                        '-',
                        { content: formatCurrencyPDF(subCategoryTotal), styles: { halign: 'right' } },
                        ''
                    ]);
                    totalExpense += subCategoryTotal;
                    runningBalance -= subCategoryTotal;
                  }
              });
           }
      });
      if (sortedTransactions.filter(tx => tx.type === 'expense').length === 0) {
           tableBody.push([
              { content: 'Tidak ada pengeluaran periode ini', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
          ]);
      }

      tableBody.push([
          { content: '', colSpan: 1, styles: { borderBottom: 'none' } },
          { content: `Total Pemasukan/Pengeluaran`, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatCurrencyPDF(totalIncome), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatCurrencyPDF(totalExpense), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatCurrencyPDF(totalIncome-totalExpense), styles: { fontStyle: 'bold', halign: 'right' } },
      ]);
      tableBody.push([
          { content: '', colSpan: 1, styles: { borderBottom: 'none' } },
          { content: `Total saldo akhir per ${format(endDate, "d MMMM yyyy", { locale: id })}`, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: '', colSpan: 2 },
          { content: formatCurrencyPDF(runningBalance), styles: { fontStyle: 'bold', halign: 'right' } },
      ]);


      (doc as any).autoTable({
          startY: 58,
          head: [['#', 'Transaksi', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Saldo (Rp)']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 9 },
          styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
          columnStyles: {
              0: { cellWidth: 8, halign: 'center' },
              1: { cellWidth: 62 },
              2: { halign: 'right' },
              3: { halign: 'right' },
              4: { halign: 'right' },
          },
          didParseCell: function(data: any) {
              const row = data.row.raw;
              if (row[0].colSpan === 5 && typeof row[0] === 'object') {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 8.5;
                if (['Pemasukan', 'Pengeluaran', 'Saldo'].includes(row[0].content)) {
                    data.cell.styles.fillColor = '#f0f0f0';
                } else {
                    data.cell.styles.halign = 'left';
                    data.cell.styles.fontSize = 9;
                }
              }
              if (data.section === 'body' && data.column.index > 1) {
                if (data.cell.raw === '-') {
                    data.cell.text = '';
                }
              }
              if(data.row.index === tableBody.length - 1 || data.row.index === tableBody.length - 2) {
                  data.cell.styles.borderBottom = 'none';
              }
          }
      });
      
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      const todayFormatted = format(new Date(), "d MMMM yyyy", { locale: id });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Bandung, ${todayFormatted}`, pageWidth - margin, finalY, { align: 'right' });

      doc.text("Bendahara DKM", margin, finalY + 7);
      doc.text("Ketua DKM", pageWidth - margin, finalY + 7, { align: 'right' });
      
      doc.setFont("helvetica", "bold");
      doc.text(settings.treasurerName, margin, finalY + 28);
      doc.text(settings.chairmanName, pageWidth - margin, finalY + 28, { align: 'right' });
      
      doc.setLineWidth(0.2);
      doc.line(margin, finalY + 29, margin + 40, finalY + 29);
      doc.line(pageWidth - margin - 40, finalY + 29, pageWidth - margin, finalY + 29);

      doc.save(`laporan-${reportType}-${settings.mosqueName.toLowerCase().replace(/\s/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Gagal membuat laporan PDF. Pastikan file /logo.png ada di folder public.");
    }
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
