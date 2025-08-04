import { ArrowLeftRight, BookOpen, HandCoins, Landmark, LayoutDashboard, PiggyBank, Receipt, ShoppingCart, TrendingDown, TrendingUp, Utensils, Wrench, Zap } from 'lucide-react';
import type { Category, Transaction } from './types';

export const initialCategories: Category[] = [
  { id: 'in-1', name: 'Infaq Jamaah', type: 'income', icon: HandCoins },
  { id: 'in-2', name: 'Sumbangan', type: 'income', icon: PiggyBank },
  { id: 'in-3', name: 'Zakat', type: 'income', icon: Landmark },
  { id: 'in-4', name: 'Sewa Aset', type: 'income', icon: Receipt },
  { id: 'ex-1', name: 'Listrik & Air', type: 'expense', icon: Zap },
  { id: 'ex-2', name: 'Perawatan & Kebersihan', type: 'expense', icon: Wrench },
  { id: 'ex-3', name: 'Kegiatan Dakwah', type: 'expense', icon: BookOpen },
  { id: 'ex-4', name: 'Konsumsi', type: 'expense', icon: Utensils },
  { id: 'ex-5', name: 'Belanja Operasional', type: 'expense', icon: ShoppingCart },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 500000,
    date: new Date('2024-07-26').toISOString(),
    description: 'Infaq kotak amal Jumat',
    category: initialCategories[0],
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 150000,
    date: new Date('2024-07-27').toISOString(),
    description: 'Pembayaran tagihan listrik Juli',
    category: initialCategories[4],
  },
  {
    id: 'tx-3',
    type: 'income',
    amount: 1000000,
    date: new Date('2024-07-28').toISOString(),
    description: 'Sumbangan dari Hamba Allah',
    category: initialCategories[1],
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 75000,
    date: new Date('2024-07-28').toISOString(),
    description: 'Alat kebersihan (sapu, pel)',
    category: initialCategories[5],
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 300000,
    date: new Date('2024-07-29').toISOString(),
    description: 'Konsumsi untuk pengajian rutin',
    category: initialCategories[7],
  },
];
