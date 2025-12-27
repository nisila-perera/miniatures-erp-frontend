'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { ExpenseCategory } from '@/types';
import { ExpenseCreate } from '@/types/expense';
import { createExpense } from '@/services/expenses';

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

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ExpenseCreate>({
    category: ExpenseCategory.OTHER,
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await createExpense(formData);
      router.push('/expenses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ExpenseCreate, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            Add New Expense
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Record a new business expense
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
                {formData.description.length}/500 characters
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
                <Button variant="outline" type="button" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Expense'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
