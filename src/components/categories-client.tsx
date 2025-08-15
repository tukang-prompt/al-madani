
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/hooks/use-data";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import type { Category, TransactionType, SubCategory } from "@/lib/types";
import { CategoryDialog } from "./category-dialog";
import { SubCategoryDialog } from "./subcategory-dialog";
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
import { Skeleton } from "./ui/skeleton";

export default function CategoriesClient() {
  const { categories, subCategories, deleteCategory, deleteSubCategory, loading } = useData();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | undefined>(undefined);
  const [parentCategoryForNewSub, setParentCategoryForNewSub] = useState<Category | undefined>(undefined);
  const [categoryTypeToAdd, setCategoryTypeToAdd] = useState<TransactionType>("income");

  const handleAddNewCategory = (type: TransactionType) => {
    setSelectedCategory(undefined);
    setCategoryTypeToAdd(type);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryTypeToAdd(category.type);
    setIsCategoryDialogOpen(true);
  };

  const handleAddNewSubCategory = (parentCategory: Category) => {
    setSelectedSubCategory(undefined);
    setParentCategoryForNewSub(parentCategory);
    setIsSubCategoryDialogOpen(true);
  }

  const handleEditSubCategory = (subCategory: SubCategory, parentCategory: Category) => {
    setSelectedSubCategory(subCategory);
    setParentCategoryForNewSub(parentCategory);
    setIsSubCategoryDialogOpen(true);
  }

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");
  
  const CategoryList = ({
    list,
    type,
  }: {
    list: Category[];
    type: TransactionType;
  }) => (
    <div>
        <div className="flex justify-end mb-4">
            <Button onClick={() => handleAddNewCategory(type)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Kategori Induk
            </Button>
        </div>
        {loading ? (
             <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
        ) : list.length > 0 ? list.map(cat => (
            <Card key={cat.id} className="mb-4">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 p-4">
                    <CardTitle className="text-base font-headline">{cat.name}</CardTitle>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCategory(cat)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tindakan ini akan menghapus kategori induk beserta SEMUA sub-kategorinya secara permanen.
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
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                    {subCategories.filter(sc => sc.parentId === cat.id).map(subCat => (
                        <div key={subCat.id} className="flex items-center p-2 rounded-md border">
                            <span className="flex-1 text-sm font-medium">{subCat.name}</span>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditSubCategory(subCat, cat)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini akan menghapus sub-kategori secara permanen.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteSubCategory(subCat.id)}>
                                            Lanjutkan
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                     {subCategories.filter(sc => sc.parentId === cat.id).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">Belum ada sub-kategori.</p>
                     )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                     <Button onClick={() => handleAddNewSubCategory(cat)} size="sm" variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Sub-Kategori
                    </Button>
                </CardFooter>
            </Card>
        )) : (
             <p className="text-sm text-muted-foreground text-center py-8">Belum ada kategori induk.</p>
        )}
    </div>
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
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        category={selectedCategory}
        type={categoryTypeToAdd}
      />
      <SubCategoryDialog
        open={isSubCategoryDialogOpen}
        onOpenChange={setIsSubCategoryDialogOpen}
        subCategory={selectedSubCategory}
        parentCategory={parentCategoryForNewSub}
      />
    </>
  );
}
