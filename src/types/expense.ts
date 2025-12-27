import { ExpenseCategory } from './index';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description: string;
  notes?: string;
}

export interface ExpenseUpdate {
  category?: ExpenseCategory;
  amount?: number;
  expense_date?: string;
  description?: string;
  notes?: string;
}
