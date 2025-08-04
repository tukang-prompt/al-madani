import type { LucideIcon } from "lucide-react";

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: LucideIcon;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string for simplicity
  description: string;
  category: Category;
}
