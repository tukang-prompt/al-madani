"use client";

import { useData } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Skeleton } from "./ui/skeleton";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ReportClient() {
  const { transactions, categories, loading } = useData();
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Lainnya';


  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = transactions.map(tx => [
        format(tx.date, "d MMM yyyy", { locale: id }),
        tx.description,
        getCategoryName(tx.categoryId),
        tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        { content: formatCurrency(tx.amount), styles: { halign: 'right' } }
    ]);
    const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const balance = totalIncome - totalExpense;
    
    const chairmanName = "Bapak H. Abdullah";
    const treasurerName = "Bapak H. Muhammad";

    // Header Laporan
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("DEWAN KEMAKMURAN MASJID (DKM) AL-MADANI", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Jl. Raya Teknologi No. 1, Desa Canggih, Kecamatan Modern, Kota Digital", doc.internal.pageSize.getWidth() / 2, 26, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(14, 32, doc.internal.pageSize.getWidth() - 14, 32);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Keuangan Periodik", doc.internal.pageSize.getWidth() / 2, 40, { align: 'center'});
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Laporan: ${format(new Date(), "d MMMM yyyy", { locale: id })}`, doc.internal.pageSize.getWidth() / 2, 45, { align: 'center'});


    // Ringkasan Saldo
    doc.setFontSize(11);
    doc.text(`Total Pemasukan: ${formatCurrency(totalIncome)}`, 14, 60);
    doc.text(`Total Pengeluaran: ${formatCurrency(totalExpense)}`, 14, 66);
    doc.setFont("helvetica", "bold");
    doc.text(`Saldo Akhir: ${formatCurrency(balance)}`, 14, 72);
    

    // Tabel Transaksi
    (doc as any).autoTable({
        startY: 80,
        head: [['Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Jumlah']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [38, 115, 108] },
        styles: { font: "helvetica", fontSize: 9 },
    });
    
    // Tanda Tangan
    const finalY = (doc as any).lastAutoTable.finalY || 180;
    const signatureY = finalY + 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(10);
    doc.text("Mengetahui,", 30, signatureY);
    doc.text("Mengetahui,", pageWidth - 80, signatureY);
    doc.text("Ketua DKM,", 30, signatureY + 5);
    doc.text("Bendahara,", pageWidth - 80, signatureY + 5);
    
    doc.setFont("helvetica", "bold");
    doc.text(chairmanName, 30, signatureY + 25);
    doc.text(treasurerName, pageWidth - 80, signatureY + 25);
    doc.setFont("helvetica", "normal");
    doc.setLineWidth(0.2);
    doc.line(30, signatureY + 26, 80, signatureY + 26);
    doc.line(pageWidth - 80, signatureY + 26, pageWidth - 30, signatureY + 26);


    doc.save("laporan-keuangan-al-madani.pdf");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Ringkasan Laporan</CardTitle>
          <Button onClick={handleExportPDF} size="sm" disabled={loading || transactions.length === 0}>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(tx.date, "d MMM yyyy", { locale: id })}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>{getCategoryName(tx.categoryId)}</TableCell>
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
