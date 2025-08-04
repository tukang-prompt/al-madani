import jsPDF from "jspdf";
import "jspdf-autotable";
import { format, startOfMonth, endOfMonth, subDays, addDays } from "date-fns";
import { id } from "date-fns/locale";
import type { Settings, Transaction, Category, SubCategory } from "./types";

interface PdfGeneratorParams {
    reportType: 'weekly' | 'monthly';
    settings: Settings;
    transactions: Transaction[];
    categories: Category[];
    subCategories: SubCategory[];
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

export const generatePdf = async ({ reportType, settings, transactions, categories, subCategories }: PdfGeneratorParams) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    try {
      const logoBase64 = await getImageAsBase64('/logo.png');
      doc.addImage(logoBase64, 'PNG', margin, 15, 20, 20, undefined, 'FAST');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(settings.mosqueName.toUpperCase(), pageWidth / 2, 22, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(settings.mosqueAddress, pageWidth / 2, 28, { align: "center" });
      
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
      
      let incomeTxFound = false;
      incomeCategories.forEach(cat => {
          const categorySubCategories = subCategories.filter(sc => sc.parentId === cat.id);
          
          if(categorySubCategories.length === 0) return;

          tableBody.push([{ content: cat.name, colSpan: 5, styles: { fontStyle: 'bold', halign: 'left' } }]);

          categorySubCategories.forEach(sc => {
              const subCategoryTransactions = sortedTransactions.filter(tx => tx.subCategoryId === sc.id);

              if (subCategoryTransactions.length > 0) {
                  subCategoryTransactions.forEach(tx => {
                       const description = `${sc.name}${tx.description && tx.description !== format(tx.date, "EEEE, d MMMM yyyy", { locale: id }) ? ` (${tx.description})` : ''}`;
                       tableBody.push([
                          '-',
                          description,
                          { content: formatCurrencyPDF(tx.amount), styles: { halign: 'right' } },
                          '-',
                          ''
                      ]);
                      totalIncome += tx.amount;
                      incomeTxFound = true;
                  });
              } else {
                  // Show subcategory even if no transactions
                  tableBody.push([
                      '-',
                      sc.name,
                      { content: formatCurrencyPDF(0), styles: { halign: 'right' } },
                      '-',
                      ''
                  ]);
              }
          });
      });
      if (!incomeTxFound && incomeCategories.every(cat => subCategories.filter(sc => sc.parentId === cat.id).length === 0)) {
           tableBody.push([
              { content: 'Tidak ada sub-kategori pemasukan', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
          ]);
      }
      
      tableBody.push([
          { content: 'Pengeluaran', colSpan: 5, styles: { fontStyle: 'bold', fillColor: '#f0f0f0' } }
      ]);
      
      let expenseTxFound = false;
      expenseCategories.forEach(cat => {
          const categorySubCategories = subCategories.filter(sc => sc.parentId === cat.id);
          const categoryTransactions = sortedTransactions.filter(tx => categorySubCategories.some(sc => sc.id === tx.subCategoryId));

          if (categoryTransactions.length > 0) {
              tableBody.push([{ content: cat.name, colSpan: 5, styles: { fontStyle: 'bold', halign: 'left' } }]);
              
              categoryTransactions.forEach(tx => {
                  const subCategory = subCategories.find(sc => sc.id === tx.subCategoryId);
                  const description = `${subCategory?.name || ''}${tx.description && tx.description !== format(tx.date, "EEEE, d MMMM yyyy", { locale: id }) ? ` (${tx.description})` : ''}`;

                  tableBody.push([
                      '-',
                      description,
                      '-',
                      { content: formatCurrencyPDF(tx.amount), styles: { halign: 'right' } },
                      ''
                  ]);
                  totalExpense += tx.amount;
                  expenseTxFound = true;
              });
           }
      });
      if (!expenseTxFound) {
           tableBody.push([
              { content: 'Tidak ada pengeluaran periode ini', colSpan: 5, styles: { halign: 'center', textColor: '#888' } }
          ]);
      }
      
      const closingBalance = runningBalance + totalIncome - totalExpense;

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
          { content: formatCurrencyPDF(closingBalance), styles: { fontStyle: 'bold', halign: 'right' } },
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

      doc.text("Bendahara DKM", margin, finalY + 21);
      doc.text("Ketua DKM", pageWidth - margin, finalY + 21, { align: 'right' });
      
      doc.setFont("helvetica", "bold");
      doc.text(settings.treasurerName, margin, finalY + 42);
      doc.text(settings.chairmanName, pageWidth - margin, finalY + 42, { align: 'right' });
      
      doc.setLineWidth(0.2);
      doc.line(margin, finalY + 43, margin + 40, finalY + 43);
      doc.line(pageWidth - margin - 40, finalY + 43, pageWidth - margin, finalY + 43);

      doc.save(`laporan-${reportType}-${settings.mosqueName.toLowerCase().replace(/\s/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Gagal membuat laporan PDF. Pastikan file /logo.png ada di folder public.");
    }
};
