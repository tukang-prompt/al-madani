"use client";

import { useMockData } from "@/hooks/use-mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ReportClient() {
  const { transactions } = useMockData();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = transactions.map(tx => [
        format(new Date(tx.date), "d MMM yyyy", { locale: id }),
        tx.description,
        tx.category.name,
        tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        { content: formatCurrency(tx.amount), styles: { halign: 'right' } }
    ]);
    const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const balance = totalIncome - totalExpense;

    doc.setFont("helvetica", "bold");
    doc.text("Laporan Keuangan Masjid Al Madani", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Laporan: ${format(new Date(), "d MMMM yyyy", { locale: id })}`, 14, 26);
    
    doc.setFontSize(11);
    doc.text(`Total Pemasukan: ${formatCurrency(totalIncome)}`, 14, 40);
    doc.text(`Total Pengeluaran: ${formatCurrency(totalExpense)}`, 14, 46);
    doc.setFont("helvetica", "bold");
    doc.text(`Saldo Akhir: ${formatCurrency(balance)}`, 14, 52);
    

    (doc as any).autoTable({
        startY: 60,
        head: [['Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Jumlah']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [38, 115, 108] },
        styles: { font: "helvetica", fontSize: 9 },
    });

    doc.save("laporan-keuangan-al-madani.pdf");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Ringkasan Laporan</CardTitle>
          <Button onClick={handleExportPDF} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Unduh PDF
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Berikut adalah rincian semua transaksi yang tercatat dalam sistem.
          </p>
          <div className="mt-4 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.date), "d MMM yyyy", { locale: id })}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>{tx.category.name}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === "income" ? "default" : "destructive"}>
                          {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(tx.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada transaksi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
