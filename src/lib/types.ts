
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  userId: string;
}

export interface SubCategory {
  id: string;
  name: string;
  parentId: string; // Category ID
  type: TransactionType;
  userId: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string;
  subCategoryId: string;
  userId: string;
}

export interface Settings {
  mosqueName: string;
  mosqueAddress: string;
  chairmanName: string;
  treasurerName: string;
  openingBalance: number;
}

export type TransactionData = Omit<Transaction, 'id' | 'userId' | 'categoryId'> & { subCategoryId: string };
export type CategoryData = Omit<Category, 'id' | 'userId'>;
export type SubCategoryData = Omit<SubCategory, 'id' | 'userId'>;
