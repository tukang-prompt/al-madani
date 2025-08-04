
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
import { format } from "date-fns";
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
  const { transactions, categories, settings, loading } = useData();

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

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Lainnya';

  const handleExportPDF = async () => {
    if (!settings) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    try {
      const logoBase64 = await getImageAsBase64('/logo.png');
      doc.addImage(logoBase64, 'PNG', margin, 15, 25, 25, undefined, 'FAST');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("PENGURUS", margin + 30, 20);
      doc.setFontSize(14);
      doc.text(`MASJID ${settings.mosqueName.toUpperCase()}`, margin + 30, 26);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(settings.mosqueAddress, margin + 30, 32);
      
      doc.setLineWidth(0.5);
      doc.line(margin, 42, pageWidth - margin, 42);

      const currentMonthYear = format(new Date(), "MMMM yyyy", { locale: id });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Laporan Bulan ${currentMonthYear}`, pageWidth / 2, 52, { align: "center" });

      const sortedTransactions = transactions.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
      
      const incomeCategories = categories.filter(c => c.type === 'income');
      const expenseCategories = categories.filter(c => c.type === 'expense');

      let runningBalance = settings.openingBalance || 0;
      let totalIncome = 0;
      let totalExpense = 0;
      
      const tableBody = [] as any[];

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
      }
      
      const lastFriday = getPreviousFriday();
      const lastFridayText = `Saldo per Jumat, ${format(lastFriday, "d MMMM yyyy", { locale: id })}`;

      tableBody.push([
          { content: 'Saldo', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);
      tableBody.push([
          '1',
          lastFridayText,
          '-',
          '-',
          { content: formatCurrencyPDF(runningBalance), styles: { halign: 'right' } }
      ]);

      tableBody.push([
          { content: 'Pemasukan', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);
      
      incomeCategories.forEach(cat => {
          const categoryTransactions = sortedTransactions.filter(tx => tx.categoryId === cat.id);
          tableBody.push([{ content: cat.name, colSpan: 5, styles: { fontStyle: 'bold', halign: 'left' } }]);

          if (categoryTransactions.length > 0) {
              categoryTransactions.forEach((tx, index) => {
                  runningBalance += tx.amount;
                  totalIncome += tx.amount;
                  tableBody.push([
                      `${index + 1}`,
                      tx.description || '-',
                      { content: formatCurrencyPDF(tx.amount), styles: { halign: 'right' } },
                      '-',
                      { content: formatCurrencyPDF(runningBalance), styles: { halign: 'right' } }
                  ]);
              });
          } else {
              tableBody.push([{ content: 'Tidak ada transaksi', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }]);
          }
      });
      if (incomeCategories.length === 0) {
           tableBody.push([
              { content: 'Tidak ada kategori pemasukan', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
          ]);
      }
      
      tableBody.push([
          { content: 'Pengeluaran', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);

      if(expenseCategories.length > 0) {
        expenseCategories.forEach(cat => {
            const categoryTransactions = sortedTransactions.filter(tx => tx.categoryId === cat.id);
            tableBody.push([{ content: cat.name, colSpan: 5, styles: { fontStyle: 'bold', halign: 'left' } }]);

            if (categoryTransactions.length > 0) {
                categoryTransactions.forEach((tx, index) => {
                    runningBalance -= tx.amount;
                    totalExpense += tx.amount;
                    tableBody.push([
                        `${index + 1}`,
                        tx.description || '-',
                        '-',
                        { content: formatCurrencyPDF(tx.amount), styles: { halign: 'right' } },
                        { content: formatCurrencyPDF(runningBalance), styles: { halign: 'right' } }
                    ]);
                });
            } else {
                 tableBody.push([
                    { content: 'Tidak ada transaksi', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
                ]);
            }
        });

      } else {
           tableBody.push([
              { content: 'Tidak ada kategori pengeluaran', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
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
          { content: `Total saldo akhir per ${format(new Date(), "d MMMM yyyy", { locale: id })}`, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: '', colSpan: 2 },
          { content: formatCurrencyPDF(runningBalance), styles: { fontStyle: 'bold', halign: 'right' } },
      ]);


      (doc as any).autoTable({
          startY: 60,
          head: [['#', 'Transaksi', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Saldo (Rp)']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', halign: 'center' },
          styles: { font: "helvetica", fontSize: 9, cellPadding: 2.5 },
          columnStyles: {
              0: { cellWidth: 10, halign: 'center' },
              1: { cellWidth: 60 },
              2: { halign: 'right' },
              3: { halign: 'right' },
              4: { halign: 'right' },
          },
          didParseCell: function(data: any) {
              const row = data.row.raw;
              if (row[0].colSpan === 5 && typeof row[0] === 'object') {
                data.cell.styles.fontStyle = 'bold';
                if (['Pemasukan', 'Pengeluaran', 'Saldo'].includes(row[0].content)) {
                    data.cell.styles.fillColor = '#f0f0f0';
                } else {
                    data.cell.styles.halign = 'left';
                }
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

      doc.save(`laporan-keuangan-${settings.mosqueName.toLowerCase().replace(/\s/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    
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
            Tekan tombol di bawah untuk mengunduh laporan keuangan dalam format PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportPDF} size="sm" disabled={loading || transactions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Unduh Laporan
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

