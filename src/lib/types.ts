
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  userId: string;
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

export interface Settings {
  mosqueName: string;
  mosqueAddress: string;
  chairmanName: string;
  treasurerName: string;
  openingBalance: number;
}

export type TransactionData = Omit<Transaction, 'id' | 'userId'>;
export type CategoryData = Omit<Category, 'id' | 'userId'>;
