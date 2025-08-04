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
import { useData } from "@/hooks/use-data";
import type { Category, TransactionType } from "@/lib/types";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi"),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  type: TransactionType;
}

export function CategoryDialog({ open, onOpenChange, category, type }: CategoryDialogProps) {
  const { addCategory, updateCategory } = useData();
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name || "",
      });
    }
  }, [open, category, form]);

  function onSubmit(data: CategoryFormValues) {
    const payload = {
      name: data.name,
      type: type,
    };

    if (category) {
      updateCategory(category.id, payload);
    } else {
      addCategory(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{category ? 'Edit' : 'Tambah'} Kategori</DialogTitle>
          <DialogDescription>
            Isi detail untuk {category ? 'memperbarui' : 'menambahkan'} kategori {type === 'income' ? 'pemasukan' : 'pengeluaran'}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Infaq" {...field} />
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
