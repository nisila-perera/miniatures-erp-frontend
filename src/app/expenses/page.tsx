'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Expense } from '@/types/expense';
import { ExpenseCategory } from '@/types';
import { fetchExpenses, deleteExpense } from '@/services/expenses';

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ExpenseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// Delete confirmation modal
interface DeleteModalProps {
  expense: Expense;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({ expense, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Expense</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete the expense &quot;{expense.description}&quot;? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Format category display
function formatCategory(category: ExpenseCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
}

// Get category badge color
function getCategoryColor(category: ExpenseCategory): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (category) {
    case ExpenseCategory.MATERIALS:
      return 'info';
    case ExpenseCategory.UTILITIES:
      return 'warning';
    case ExpenseCategory.EQUIPMENT:
      return 'success';
    case ExpenseCategory.MARKETING:
      return 'danger';
    case ExpenseCategory.SHIPPING:
      return 'default';
    default:
      return 'default';
  }
}

// Expense row component
interface ExpenseRowProps {
  expense: Expense;
  onDelete: (expense: Expense) => void;
}

function ExpenseRow({ expense, onDelete }: ExpenseRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">
          {new Date(expense.expense_date).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <Badge variant={getCategoryColor(expense.category)}>
          {formatCategory(expense.category)}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <span className="font-medium text-gray-900">{expense.description}</span>
        {expense.notes && (
          <p className="text-sm text-gray-500 mt-1">{expense.notes}</p>
        )}
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-gray-900">LKR {parseFloat(expense.amount.toString()).toFixed(2)}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link href={`/expenses/${expense.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <EditIcon />
              Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onDelete(expense)}
          >
            <TrashIcon />
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div 
        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: BRAND_COLORS.secondary }}
      >
        <ExpenseIcon />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses yet</h3>
      <p className="text-gray-500 mb-4">Get started by recording your first expense.</p>
      <Link href="/expenses/new">
        <Button variant="primary" className="flex items-center gap-2 mx-auto">
          <PlusIcon />
          Add Expense
        </Button>
      </Link>
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchExpenses(
        selectedCategory || undefined,
        startDate || undefined,
        endDate || undefined
      );
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [selectedCategory, startDate, endDate]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      await deleteExpense(deleteTarget.id);
      setExpenses(prev => prev.filter(e => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = selectedCategory || startDate || endDate;

  // Calculate total
  const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Business Expenses
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track and manage your business expenses
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon />
              Filters
            </Button>
            <Link href="/expenses/new">
              <Button variant="primary" className="flex items-center gap-2">
                <PlusIcon />
                Add Expense
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                >
                  <option value="">All Categories</option>
                  {Object.values(ExpenseCategory).map(cat => (
                    <option key={cat} value={cat}>
                      {formatCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Summary */}
        {expenses.length > 0 && (
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                  LKR {totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Number of Expenses</p>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                  {expenses.length}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Content */}
        <Card>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <ExpenseRow 
                      key={expense.id} 
                      expense={expense} 
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <DeleteModal
            expense={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </MainLayout>
  );
}
