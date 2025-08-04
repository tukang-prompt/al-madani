
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
import type { SubCategory, Category } from "@/lib/types";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Nama sub-kategori harus diisi"),
});

type SubCategoryFormValues = z.infer<typeof formSchema>;

interface SubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subCategory?: SubCategory;
  parentCategory?: Category;
}

export function SubCategoryDialog({ open, onOpenChange, subCategory, parentCategory }: SubCategoryDialogProps) {
  const { addSubCategory, updateSubCategory } = useData();
  
  const form = useForm<SubCategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: subCategory?.name || "",
      });
    }
  }, [open, subCategory, form]);

  function onSubmit(data: SubCategoryFormValues) {
    if (!parentCategory) return;

    const payload = {
      name: data.name,
      parentId: parentCategory.id,
      type: parentCategory.type,
    };

    if (subCategory) {
      updateSubCategory(subCategory.id, payload);
    } else {
      addSubCategory(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{subCategory ? 'Edit' : 'Tambah'} Sub-Kategori</DialogTitle>
          <DialogDescription>
            Induk Kategori: <span className="font-semibold">{parentCategory?.name}</span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Sub-Kategori</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Kotak Amal" {...field} />
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
