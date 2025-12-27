import apiClient from './api';
import { Expense, ExpenseCreate, ExpenseUpdate } from '@/types/expense';
import { ExpenseCategory } from '@/types';

export async function fetchExpenses(
  category?: ExpenseCategory,
  startDate?: string,
  endDate?: string
): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/api/expenses?${queryString}` : '/api/expenses';
  
  const response = await apiClient.get<Expense[]>(endpoint);
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data || [];
}

export async function fetchExpense(id: string): Promise<Expense> {
  const response = await apiClient.get<Expense>(`/api/expenses/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Expense not found');
  }
  return response.data;
}

export async function createExpense(data: ExpenseCreate): Promise<Expense> {
  const response = await apiClient.post<Expense>('/api/expenses', data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to create expense');
  }
  return response.data;
}

export async function updateExpense(id: string, data: ExpenseUpdate): Promise<Expense> {
  const response = await apiClient.put<Expense>(`/api/expenses/${id}`, data);
  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('Failed to update expense');
  }
  return response.data;
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await apiClient.delete(`/api/expenses/${id}`);
  if (response.error) {
    throw new Error(response.error.message);
  }
}
