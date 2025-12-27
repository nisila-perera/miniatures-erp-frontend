'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { ProductCategory } from '@/types';
import { fetchProductCategories, deleteProductCategory } from '@/services/productCategories';

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

// Delete confirmation modal
interface DeleteModalProps {
  category: ProductCategory;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({ category, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete the category &quot;{category.name}&quot;? This action cannot be undone.
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


// Category row component
interface CategoryRowProps {
  category: ProductCategory;
  onDelete: (category: ProductCategory) => void;
}

function CategoryRow({ category, onDelete }: CategoryRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <span className="font-medium text-gray-900">{category.name}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-600">{category.description || '-'}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">
          {new Date(category.created_at).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link href={`/product-categories/${category.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <EditIcon />
              Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onDelete(category)}
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
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND_COLORS.primary }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No categories yet</h3>
      <p className="text-gray-500 mb-4">Get started by creating your first product category.</p>
      <Link href="/product-categories/new">
        <Button variant="primary" className="flex items-center gap-2 mx-auto">
          <PlusIcon />
          Create Category
        </Button>
      </Link>
    </div>
  );
}

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      await deleteProductCategory(deleteTarget.id);
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Product Categories
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product categories
            </p>
          </div>
          <Link href="/product-categories/new">
            <Button variant="primary" className="flex items-center gap-2">
              <PlusIcon />
              Add Category
            </Button>
          </Link>
        </div>

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
          ) : categories.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <CategoryRow 
                      key={category.id} 
                      category={category} 
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
            category={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </MainLayout>
  );
}
