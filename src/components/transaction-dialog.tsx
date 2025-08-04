
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useData } from "@/hooks/use-data";
import type { Transaction, TransactionType } from "@/lib/types";
import { useEffect, useCallback, useRef } from "react";

const formSchema = z.object({
  type: z.enum(["income", "expense"], { required_error: "Tipe harus dipilih" }),
  amount: z.coerce.number().min(1, "Jumlah harus lebih dari 0"),
  date: z.date({ required_error: "Tanggal harus diisi" }),
  description: z.string().optional(),
  categoryId: z.string({ required_error: "Kategori harus dipilih" }),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export function TransactionDialog({ open, onOpenChange, transaction }: TransactionDialogProps) {
  const { categories, addTransaction, updateTransaction } = useData();
  const isOpening = useRef(true);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "income",
      amount: 0,
      date: new Date(),
      description: "",
      categoryId: "",
    }
  });
  
  const transactionType = form.watch("type");

  const resetForm = useCallback(() => {
    form.reset({
      type: transaction?.type || "income",
      amount: transaction?.amount || 0,
      date: transaction ? transaction.date : new Date(),
      description: transaction?.description || "",
      categoryId: transaction?.categoryId || "",
    });
  }, [transaction, form]);

  useEffect(() => {
    if (open) {
      isOpening.current = true;
      resetForm();
    }
  }, [transaction, open, resetForm]);
  
  useEffect(() => {
    if(open) {
      if (isOpening.current) {
        isOpening.current = false;
        return;
      }
      form.setValue('categoryId', '');
    }
  }, [transactionType, form, open]);

  const filteredCategories = categories.filter((c) => c.type === transactionType);

  function onSubmit(data: TransactionFormValues) {
    const payload = {
      ...data,
      amount: Number(String(data.amount).replace(/[^0-9]/g, '')),
      description: data.description || "",
    };
    if (transaction) {
      updateTransaction(transaction.id, payload);
    } else {
      addTransaction(payload);
    }
    onOpenChange(false);
  }
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
      const rawValue = e.target.value;
      const numericValue = rawValue.replace(/[^0-9]/g, '');
      if (numericValue === '') {
        field.onChange(0);
        return;
      }
      const formattedValue = new Intl.NumberFormat('id-ID').format(Number(numericValue));
      e.target.value = formattedValue;
      field.onChange(Number(numericValue));
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{transaction ? 'Edit' : 'Tambah'} Transaksi</DialogTitle>
          <DialogDescription>
            Isi detail di bawah ini untuk {transaction ? 'memperbarui' : 'menambahkan'} transaksi baru.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipe Transaksi</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" />
                        </FormControl>
                        <FormLabel className="font-normal">Pemasukan</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expense" />
                        </FormControl>
                        <FormLabel className="font-normal">Pengeluaran</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="50.000" 
                      {...field}
                      onChange={(e) => handleAmountChange(e, field)}
                      value={field.value > 0 ? new Intl.NumberFormat('id-ID').format(field.value) : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP", {locale: id}) : <span>Pilih tanggal</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="cth: Infaq kotak amal Jumat" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
