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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockData } from "@/hooks/use-mock-data";
import type { Category, TransactionType } from "@/lib/types";
import { useEffect } from "react";
import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;
const iconNames = Object.keys(LucideIcons).filter(
  (k) => typeof (LucideIcons as any)[k] === "object"
) as IconName[];

const formSchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi"),
  icon: z.string().min(1, "Ikon harus dipilih"),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  type: TransactionType;
}

export function CategoryDialog({ open, onOpenChange, category, type }: CategoryDialogProps) {
  const { addCategory, updateCategory } = useMockData();
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      icon: (Object.keys(LucideIcons).find(key => (LucideIcons as any)[key] === category?.icon)) || "Package"
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name || "",
        icon: (Object.keys(LucideIcons).find(key => (LucideIcons as any)[key] === category?.icon)) || "Package"
      });
    }
  }, [open, category, form]);

  function onSubmit(data: CategoryFormValues) {
    const IconComponent = LucideIcons[data.icon as IconName] as LucideIcons.LucideIcon;
    if (!IconComponent) {
        console.error("Invalid icon selected");
        return;
    }

    const payload = {
        name: data.name,
        type: type,
        icon: IconComponent,
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
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ikon</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih ikon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconNames.map((iconName) => {
                          const IconComponent = LucideIcons[iconName] as LucideIcons.LucideIcon;
                          return (
                            <SelectItem key={iconName} value={iconName}>
                                <div className="flex items-center">
                                    <IconComponent className="mr-2 h-4 w-4" />
                                    {iconName}
                                </div>
                            </SelectItem>
                          )
                      })}
                    </SelectContent>
                  </Select>
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
