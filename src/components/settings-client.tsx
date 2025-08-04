
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Settings } from "@/lib/types";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

const formSchema = z.object({
  mosqueName: z.string().min(1, "Nama mesjid harus diisi"),
  mosqueAddress: z.string().min(1, "Alamat mesjid harus diisi"),
  chairmanName: z.string().min(1, "Nama ketua DKM harus diisi"),
  treasurerName: z.string().min(1, "Nama bendahara harus diisi"),
  openingBalance: z.coerce.number().min(0, "Saldo awal tidak boleh negatif"),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function SettingsClient() {
  const { settings, updateSettings, loading } = useData();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mosqueName: "",
      mosqueAddress: "",
      chairmanName: "",
      treasurerName: "",
      openingBalance: 0,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  function onSubmit(data: SettingsFormValues) {
    updateSettings(data);
  }

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-9 w-24 ml-auto" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pengaturan Aplikasi</CardTitle>
        <CardDescription>
          Informasi ini akan digunakan pada kop surat laporan PDF dan perhitungan saldo awal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="openingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Awal (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                   <FormDescription>
                    Saldo sisa dari periode sebelumnya. Akan menjadi titik awal perhitungan laporan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mosqueName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Masjid</FormLabel>
                  <FormControl>
                    <Input placeholder="DKM Al-Madani" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mosqueAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Masjid</FormLabel>
                  <FormControl>
                    <Input placeholder="Jl. Raya Teknologi No. 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chairmanName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Ketua DKM</FormLabel>
                  <FormControl>
                    <Input placeholder="Bapak H. Abdullah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="treasurerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Bendahara</FormLabel>
                  <FormControl>
                    <Input placeholder="Bapak H. Muhammad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
