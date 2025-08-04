"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { initialTransactions, initialCategories } from '@/lib/data';
import type { Transaction, Category, TransactionType } from '@/lib/types';
import { useToast } from './use-toast';

interface MockDataContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (data: Omit<Transaction, 'id' | 'category'> & { categoryId: string }) => void;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'category'> & { categoryId: string }>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export const MockDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const { toast } = useToast();

  const getCategoryById = useCallback((id: string) => categories.find(c => c.id === id), [categories]);

  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'category'> & { categoryId: string }) => {
    const category = getCategoryById(data.categoryId);
    if (!category) {
      console.error("Category not found");
      toast({ title: "Error", description: "Kategori tidak ditemukan.", variant: "destructive" });
      return;
    }
    const newTransaction: Transaction = {
      ...data,
      id: `tx-${Date.now()}`,
      category,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    toast({ title: "Sukses", description: "Transaksi berhasil ditambahkan." });
  }, [getCategoryById, toast]);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id' | 'category'> & { categoryId: string }>) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        const category = data.categoryId ? getCategoryById(data.categoryId) : tx.category;
        if (!category) return tx; // Should not happen if UI is correct
        return { ...tx, ...data, category };
      }
      return tx;
    }));
    toast({ title: "Sukses", description: "Transaksi berhasil diperbarui." });
  }, [getCategoryById, toast]);
  
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    toast({ title: "Sukses", description: "Transaksi berhasil dihapus." });
  }, [toast]);

  const addCategory = useCallback((data: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...data, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCategory]);
    toast({ title: "Sukses", description: "Kategori berhasil ditambahkan." });
  }, [toast]);

  const updateCategory = useCallback((id: string, data: Partial<Omit<Category, 'id'>>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...data } as Category : cat));
    toast({ title: "Sukses", description: "Kategori berhasil diperbarui." });
  }, [toast]);
  
  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    toast({ title: "Sukses", description: "Kategori berhasil dihapus." });
  }, [toast]);

  const value = useMemo(() => ({
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  }), [transactions, categories, addTransaction, updateTransaction, deleteTransaction, addCategory, updateCategory, deleteCategory, getCategoryById]);

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
};
