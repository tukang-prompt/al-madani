"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockData } from "@/hooks/use-mock-data";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { Category, TransactionType } from "@/lib/types";
import { CategoryDialog } from "./category-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export default function CategoriesClient() {
  const { categories, deleteCategory } = useMockData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [dialogType, setDialogType] = useState<TransactionType>("income");

  const handleAddNew = (type: TransactionType) => {
    setSelectedCategory(undefined);
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogType(category.type);
    setIsDialogOpen(true);
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  const CategoryList = ({
    list,
    type,
  }: {
    list: Category[];
    type: TransactionType;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          Kategori {type === "income" ? "Pemasukan" : "Pengeluaran"}
        </CardTitle>
        <CardDescription>
          Kelola kategori untuk {type === "income" ? "pemasukan" : "pengeluaran"} Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => handleAddNew(type)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
        <div className="rounded-md border">
          {list.length > 0 ? list.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center p-3 pr-4 border-b last:border-b-0"
            >
              <cat.icon className="mr-3 h-5 w-5 text-muted-foreground" />
              <span className="flex-1 font-medium">{cat.name}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak bisa dibatalkan. Ini akan menghapus kategori secara permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCategory(cat.id)}>
                        Lanjutkan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center p-4">Belum ada kategori.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList>
          <TabsTrigger value="income">Pemasukan</TabsTrigger>
          <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
        </TabsList>
        <TabsContent value="income">
          <CategoryList list={incomeCategories} type="income" />
        </TabsContent>
        <TabsContent value="expense">
          <CategoryList list={expenseCategories} type="expense" />
        </TabsContent>
      </Tabs>
      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        type={dialogType}
      />
    </>
  );
}
