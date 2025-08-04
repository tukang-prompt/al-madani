export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string;
  categoryId: string;
  userId: string;
}

export type TransactionData = Omit<Transaction, 'id' | 'userId'>;
export type CategoryData = Omit<Category, 'id'>;
