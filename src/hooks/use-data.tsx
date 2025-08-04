
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, getDocs, setDoc } from 'firebase/firestore';
import type { Transaction, Category, TransactionData, CategoryData, Settings } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from './use-toast';

interface DataContextType {
  transactions: Transaction[];
  categories: Category[];
  settings: Settings | null;
  addTransaction: (data: TransactionData) => Promise<void>;
  updateTransaction: (id: string, data: Partial<TransactionData>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (data: CategoryData) => Promise<void>;
  updateCategory: (id: string, data: Partial<CategoryData>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateSettings: (data: Settings) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    toast({ title, description, variant });
  };
  
  const settingsDocId = user ? `settings_${user.uid}` : 'default_settings';


  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategories([]);
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'));
    const categoriesQuery = query(collection(db, 'categories'), where('userId', '==', user.uid));
    const settingsDocRef = doc(db, 'settings', settingsDocId);

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const newTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate(),
        } as Transaction;
      });
      setTransactions(newTransactions);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      showToast("Error", "Gagal memuat data transaksi.", "destructive");
      setLoading(false);
    });

    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const newCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(newCategories);
    }, (error) => {
      console.error("Error fetching categories:", error);
      showToast("Error", "Gagal memuat data kategori.", "destructive");
    });
    
    const unsubscribeSettings = onSnapshot(settingsDocRef, (doc) => {
        if(doc.exists()){
            setSettings(doc.data() as Settings);
        } else {
            setSettings({
                mosqueName: "DKM Al-Madani",
                mosqueAddress: "Jl. Raya Teknologi No. 1, Desa Canggih, Kecamatan Modern, Kota Digital",
                chairmanName: "Bapak H. Abdullah",
                treasurerName: "Bapak H. Muhammad",
            });
        }
    }, (error) => {
        console.error("Error fetching settings:", error);
        showToast("Error", "Gagal memuat data pengaturan.", "destructive");
    })

    return () => {
      unsubscribeTransactions();
      unsubscribeCategories();
      unsubscribeSettings();
    };
  }, [user, toast, settingsDocId]);

  const addTransaction = useCallback(async (data: TransactionData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'transactions'), { ...data, userId: user.uid });
      showToast("Sukses", "Transaksi berhasil ditambahkan.");
    } catch (error) {
      console.error("Error adding transaction:", error);
      showToast("Error", "Gagal menambahkan transaksi.", "destructive");
    }
  }, [user, toast]);

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionData>) => {
    try {
      await updateDoc(doc(db, 'transactions', id), data);
      showToast("Sukses", "Transaksi berhasil diperbarui.");
    } catch (error) {
      console.error("Error updating transaction:", error);
      showToast("Error", "Gagal memperbarui transaksi.", "destructive");
    }
  }, [toast]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      showToast("Sukses", "Transaksi berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      showToast("Error", "Gagal menghapus transaksi.", "destructive");
    }
  }, [toast]);

  const addCategory = useCallback(async (data: CategoryData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'categories'), { ...data, userId: user.uid });
      showToast("Sukses", "Kategori berhasil ditambahkan.");
    } catch (error) {
      console.error("Error adding category:", error);
      showToast("Error", "Gagal menambahkan kategori.", "destructive");
    }
  }, [user, toast]);

  const updateCategory = useCallback(async (id: string, data: Partial<CategoryData>) => {
    try {
      await updateDoc(doc(db, 'categories', id), data);
      showToast("Sukses", "Kategori berhasil diperbarui.");
    } catch (error) {
      console.error("Error updating category:", error);
      showToast("Error", "Gagal memperbarui kategori.", "destructive");
    }
  }, [toast]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      showToast("Sukses", "Kategori berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting category:", error);
      showToast("Error", "Gagal menghapus kategori.", "destructive");
    }
  }, [toast]);

  const updateSettings = useCallback(async (data: Settings) => {
    if(!user) return;
    try {
        await setDoc(doc(db, 'settings', settingsDocId), data);
        showToast("Sukses", "Pengaturan berhasil diperbarui.");
    } catch (error) {
        console.error("Error updating settings:", error);
        showToast("Error", "Gagal memperbarui pengaturan.", "destructive");
    }
  }, [user, toast, settingsDocId]);

  const value = useMemo(() => ({
    transactions,
    categories,
    settings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
    loading,
  }), [transactions, categories, settings, addTransaction, updateTransaction, deleteTransaction, addCategory, updateCategory, deleteCategory, updateSettings, loading]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
