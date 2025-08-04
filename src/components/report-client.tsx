"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { generateWeeklyReport } from "@/ai/flows/generate-weekly-report";
import { useMockData } from "@/hooks/use-mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const reportFormSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "Tanggal mulai harus diisi." }),
    to: z.date({ required_error: "Tanggal selesai harus diisi." }),
  }),
  incomeCategories: z.array(z.string()).optional(),
  expenseCategories: z.array(z.string()).optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function ReportClient() {
  const { categories } = useMockData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      dateRange: {
        from: subDays(new Date(), 7),
        to: new Date(),
      },
      incomeCategories: [],
      expenseCategories: [],
    },
  });

  async function onSubmit(data: ReportFormValues) {
    setIsLoading(true);
    setReportUrl(null);
    try {
      const input = {
        startDate: format(data.dateRange.from, "yyyy-MM-dd"),
        endDate: format(data.dateRange.to, "yyyy-MM-dd"),
        incomeCategories: data.incomeCategories,
        expenseCategories: data.expenseCategories,
      };
      const result = await generateWeeklyReport(input);
      setReportUrl(result.reportDataUri);
      toast({
        title: "Laporan Dihasilkan!",
        description: "Laporan PDF Anda siap untuk diunduh.",
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        title: "Gagal Menghasilkan Laporan",
        description: "Terjadi kesalahan saat membuat laporan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generator Laporan Keuangan</CardTitle>
        <CardDescription>
          Pilih rentang tanggal dan kategori untuk menghasilkan laporan PDF mingguan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Rentang Tanggal</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !field.value.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value.from}
                        selected={{ from: field.value.from, to: field.value.to }}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="incomeCategories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Kategori Pemasukan</FormLabel>
                      <FormDescription>Pilih kategori untuk dimasukkan dalam laporan.</FormDescription>
                    </div>
                    {incomeCategories.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="incomeCategories"
                        render={({ field }) => (
                          <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(field.value?.filter((value) => value !== item.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.name}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expenseCategories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Kategori Pengeluaran</FormLabel>
                      <FormDescription>Pilih kategori untuk dimasukkan dalam laporan.</FormDescription>
                    </div>
                    {expenseCategories.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="expenseCategories"
                        render={({ field }) => (
                          <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(field.value?.filter((value) => value !== item.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.name}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hasilkan Laporan
            </Button>
          </form>
        </Form>
        {reportUrl && (
          <div className="mt-8 p-4 bg-primary/10 rounded-lg">
            <h3 className="font-semibold mb-2">Laporan Berhasil Dibuat!</h3>
            <a href={reportUrl} download={`Laporan_Keuangan_Al_Madani.pdf`}>
              <Button>Unduh Laporan PDF</Button>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
