
"use client";

import { useData } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "./ui/skeleton";
import type { Category } from "@/lib/types";

function formatCurrency(amount: number) {
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


export default function ReportClient() {
  const { transactions, categories, settings, loading } = useData();

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

      let runningBalance = 0;
      let totalIncome = 0;
      let totalExpense = 0;
      
      const tableBody = [] as any[];

      tableBody.push([
          { content: 'Saldo', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);
      tableBody.push([
          '1',
          'Sisa saldo awal periode',
          '-',
          '-',
          { content: formatCurrency(runningBalance), styles: { halign: 'right' } }
      ]);

      // Pemasukan
      tableBody.push([
          { content: 'Pemasukan', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);
      
      let incomeAdded = false;
      incomeCategories.forEach(cat => {
          const categoryTransactions = sortedTransactions.filter(tx => tx.categoryId === cat.id);
          
          if (categoryTransactions.length > 0) {
              incomeAdded = true;
              tableBody.push([{ content: cat.name, colSpan: 5, styles: { fontStyle: 'bold' } }]);
              
              categoryTransactions.forEach((tx, index) => {
                  runningBalance += tx.amount;
                  totalIncome += tx.amount;
                  tableBody.push([
                      `${index + 1}`,
                      tx.description || '-',
                      { content: formatCurrency(tx.amount), styles: { halign: 'right' } },
                      '-',
                      { content: formatCurrency(runningBalance), styles: { halign: 'right' } }
                  ]);
              });
          } else {
              tableBody.push([{ content: cat.name, colSpan: 5, styles: { fontStyle: 'bold' } }]);
              tableBody.push([{ content: 'Tidak ada transaksi', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }]);
          }
      });
      
      if (!incomeAdded && incomeCategories.length === 0) {
         tableBody.push([
              { content: 'Tidak ada pemasukan', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
          ]);
      }
      
      // Pengeluaran
      tableBody.push([
          { content: 'Pengeluaran', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);

      if(expenseCategories.length > 0) {
        let expenseAdded = false;
        expenseCategories.forEach(cat => {
            const categoryTransactions = sortedTransactions.filter(tx => tx.categoryId === cat.id);

            if (categoryTransactions.length > 0) {
                expenseAdded = true;
                tableBody.push([{ content: cat.name, colSpan: 5, styles: { fontStyle: 'bold' } }]);

                categoryTransactions.forEach((tx, index) => {
                    runningBalance -= tx.amount;
                    totalExpense += tx.amount;
                    tableBody.push([
                        `${index + 1}`,
                        tx.description || '-',
                        '-',
                        { content: formatCurrency(tx.amount), styles: { halign: 'right' } },
                        { content: formatCurrency(runningBalance), styles: { halign: 'right' } }
                    ]);
                });
            }
        });

        if (!expenseAdded) {
             tableBody.push([
                { content: 'Tidak ada pengeluaran', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
            ]);
        }
      } else {
           tableBody.push([
              { content: 'Tidak ada pengeluaran', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
          ]);
      }


      tableBody.push([
          { content: '', colSpan: 1, styles: { borderBottom: 'none' } },
          { content: `Pemasukan/Pengeluaran hingga ${format(new Date(), "d MMMM yyyy", { locale: id })}`, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatCurrency(totalIncome), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatCurrency(totalExpense), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: formatCurrency(totalIncome-totalExpense), styles: { fontStyle: 'bold', halign: 'right' } },
      ]);
      tableBody.push([
          { content: '', colSpan: 1, styles: { borderBottom: 'none' } },
          { content: `Total saldo akhir per ${format(new Date(), "d MMMM yyyy", { locale: id })}`, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: '', colSpan: 2 },
          { content: formatCurrency(runningBalance), styles: { fontStyle: 'bold', halign: 'right' } },
      ]);


      (doc as any).autoTable({
          startY: 60,
          head: [['#', 'Transaksi', 'Pemasukan', 'Pengeluaran', 'Saldo']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', halign: 'center' },
          styles: { font: "helvetica", fontSize: 9, cellPadding: 2.5 },
          columnStyles: {
              0: { cellWidth: 10, halign: 'center' },
              1: { cellWidth: 70 },
              2: { halign: 'right' },
              3: { halign: 'right' },
              4: { halign: 'right' },
          },
          didParseCell: function(data: any) {
              const row = data.row.raw;
              if (row[0].colSpan === 5) {
                data.cell.styles.fontStyle = 'bold';
                if (row[0].content === 'Pemasukan' || row[0].content === 'Pengeluaran' || row[0].content === 'Saldo') {
                    data.cell.styles.fillColor = '#f0f0f0';
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Unduh Laporan PDF</CardTitle>
          <Button onClick={handleExportPDF} size="sm" disabled={loading || transactions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Unduh Laporan
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tekan tombol di atas untuk mengunduh laporan keuangan dalam format PDF sesuai dengan format terbaru.
          </p>
          {loading && (
            <div className="mt-4 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-2/3" />
            </div>
          )}
          {!loading && transactions.length === 0 && (
             <p className="text-sm text-center text-muted-foreground mt-6">
                Belum ada data transaksi untuk membuat laporan.
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

    