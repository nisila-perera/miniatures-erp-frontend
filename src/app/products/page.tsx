'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Product } from '@/types/product';
import { ProductSource } from '@/types';
import { fetchProducts, deleteProduct, syncProductsFromWooCommerce, SyncResponse } from '@/services/products';
import { sanitizeHtml } from '@/utils/html';

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

const SyncIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);


// Delete confirmation modal
interface DeleteModalProps {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({ product, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete the product &quot;{product.name}&quot;? This action cannot be undone.
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

// Sync result modal
interface SyncModalProps {
  result: SyncResponse | null;
  error: string | null;
  onClose: () => void;
}

function SyncModal({ result, error, onClose }: SyncModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error ? 'Sync Failed' : 'Sync Complete'}
        </h3>
        {error ? (
          <p className="text-red-600 mb-4">{error}</p>
        ) : result ? (
          <div className="mb-4">
            <p className="text-gray-600">{result.message}</p>
            <div className="mt-2 flex gap-4">
              <span className="text-sm text-green-600">Created: {result.created}</span>
              <span className="text-sm text-blue-600">Updated: {result.updated}</span>
            </div>
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Source badge component
function SourceBadge({ source }: { source: ProductSource }) {
  if (source === ProductSource.WOOCOMMERCE) {
    return <Badge variant="info">WooCommerce</Badge>;
  }
  return <Badge variant="success">ERP</Badge>;
}

// Product row component
interface ProductRowProps {
  product: Product;
  onDelete: (product: Product) => void;
}

function ProductRow({ product, onDelete }: ProductRowProps) {
  const isWooCommerce = product.source === ProductSource.WOOCOMMERCE;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <span className="font-medium text-gray-900">{product.name}</span>
          {product.description && (
            <div
              className="text-sm text-gray-500 truncate max-w-xs"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <SourceBadge source={product.source} />
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-900">LKR {typeof product.base_price === 'number' ? product.base_price.toFixed(2) : Number(product.base_price).toFixed(2)}</span>
      </td>
      <td className="px-6 py-4">
        {product.is_colored ? (
          <Badge variant="success">Colored</Badge>
        ) : (
          <Badge variant="default">Uncolored</Badge>
        )}
      </td>
      <td className="px-6 py-4">
        <Badge variant={product.is_active ? 'success' : 'danger'}>
          {product.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {isWooCommerce ? (
            <Link href={`/products/${product.id}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <EyeIcon />
                View
              </Button>
            </Link>
          ) : (
            <>
              <Link href={`/products/${product.id}/edit`}>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <EditIcon />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="danger" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => onDelete(product)}
              >
                <TrashIcon />
                Delete
              </Button>
            </>
          )}
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No products yet</h3>
      <p className="text-gray-500 mb-4">Get started by creating your first product or syncing from WooCommerce.</p>
      <div className="flex justify-center gap-3">
        <Link href="/products/new">
          <Button variant="primary" className="flex items-center gap-2">
            <PlusIcon />
            Create Product
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      await deleteProduct(deleteTarget.id);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      setSyncResult(null);
      const result = await syncProductsFromWooCommerce();
      setSyncResult(result);
      setShowSyncModal(true);
      // Reload products after sync
      await loadProducts();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Failed to sync products');
      setShowSyncModal(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const closeSyncModal = () => {
    setShowSyncModal(false);
    setSyncResult(null);
    setSyncError(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Products
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product catalog
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <SyncIcon />
              {isSyncing ? 'Syncing...' : 'Sync from WooCommerce'}
            </Button>
            <Link href="/products/new">
              <Button variant="primary" className="flex items-center gap-2">
                <PlusIcon />
                Add Product
              </Button>
            </Link>
          </div>
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <ProductRow 
                      key={product.id} 
                      product={product} 
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
            product={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}

        {/* Sync Result Modal */}
        {showSyncModal && (
          <SyncModal
            result={syncResult}
            error={syncError}
            onClose={closeSyncModal}
          />
        )}
      </div>
    </MainLayout>
  );
}
