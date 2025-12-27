'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { ExpenseCategory } from '@/types';
import { Expense, ExpenseUpdate } from '@/types/expense';
import { fetchExpense, updateExpense } from '@/services/expenses';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// Format category display
function formatCategory(category: ExpenseCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
}

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;
  
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ExpenseUpdate>({
    category: undefined,
    amount: undefined,
    expense_date: undefined,
    description: undefined,
    notes: undefined,
  });

  useEffect(() => {
    const loadExpense = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchExpense(expenseId);
        setExpense(data);
        setFormData({
          category: data.category,
          amount: data.amount,
          expense_date: data.expense_date,
          description: data.description,
          notes: data.notes || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load expense');
      } finally {
        setLoading(false);
      }
    };

    loadExpense();
  }, [expenseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.amount !== undefined && formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (formData.description !== undefined && !formData.description.trim()) {
      setError('Please enter a description');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      await updateExpense(expenseId, formData);
      router.push('/expenses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ExpenseUpdate, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!expense) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">Expense not found</p>
              <Link href="/expenses">
                <Button variant="primary" className="mt-4">
                  Back to Expenses
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link href="/expenses">
            <Button variant="outline" size="sm" className="flex items-center gap-2 mb-4">
              <ArrowLeftIcon />
              Back to Expenses
            </Button>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
            Edit Expense
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update expense details
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                required
              >
                {Object.values(ExpenseCategory).map(cat => (
                  <option key={cat} value={cat}>
                    {formatCategory(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                placeholder="0.00"
                required
              />
            </div>

            {/* Expense Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => handleChange('expense_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                placeholder="Brief description of the expense"
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                placeholder="Additional notes or details"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.notes?.length || 0}/1000 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/expenses">
                <Button variant="outline" type="button" disabled={saving}>
                  Cancel
                </Button>
              </Link>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
