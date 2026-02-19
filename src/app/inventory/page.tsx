'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Resin, PaintBottle } from '@/types/inventory';
import { fetchResin, fetchPaintBottles, deleteResin, deletePaintBottle } from '@/services/inventory';

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

const InventoryIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

// Delete confirmation modal
interface DeleteModalProps {
  item: Resin | PaintBottle;
  type: 'resin' | 'paint';
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({ item, type, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  const itemName = type === 'resin' 
    ? `${item.color} resin` 
    : `${(item as PaintBottle).brand} - ${item.color}`;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete {type === 'resin' ? 'Resin' : 'Paint Bottle'}</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete &quot;{itemName}&quot;? This action cannot be undone.
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

// Resin row component
interface ResinRowProps {
  resin: Resin;
  onDelete: (resin: Resin) => void;
}

function ResinRow({ resin, onDelete }: ResinRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: resin.color.toLowerCase() }}
            title={resin.color}
          />
          <span className="font-medium text-gray-900">{resin.color}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-600">{resin.quantity} {resin.unit}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-600">LKR {Number(resin.cost_per_unit).toFixed(2)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">
          {new Date(resin.purchase_date).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">{resin.purchase_source || '-'}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link href={`/inventory/resin/${resin.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <EditIcon />
              Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onDelete(resin)}
          >
            <TrashIcon />
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Paint bottle row component
interface PaintBottleRowProps {
  paint: PaintBottle;
  onDelete: (paint: PaintBottle) => void;
}

function PaintBottleRow({ paint, onDelete }: PaintBottleRowProps) {
  const currentVolume = Number(paint.current_volume_ml);
  const totalVolume = Number(paint.volume_ml);
  const usagePercent = (currentVolume / totalVolume) * 100;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: paint.color.toLowerCase() }}
            title={paint.color}
          />
          <span className="font-medium text-gray-900">{paint.color}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-600">{paint.brand}</span>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            {currentVolume.toFixed(1)} / {totalVolume.toFixed(1)} ml
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${usagePercent}%`,
                backgroundColor: usagePercent > 20 ? BRAND_COLORS.primary : '#ef4444'
              }}
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-600">LKR {Number(paint.cost).toFixed(2)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">
          {new Date(paint.purchase_date).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">{paint.purchase_source || '-'}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link href={`/inventory/paint/${paint.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <EditIcon />
              Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onDelete(paint)}
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
function EmptyState({ type }: { type: 'resin' | 'paint' }) {
  const href = type === 'resin' ? '/inventory/resin/new' : '/inventory/paint/new';
  const label = type === 'resin' ? 'Resin' : 'Paint Bottle';
  
  return (
    <div className="text-center py-12">
      <div 
        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: BRAND_COLORS.secondary }}
      >
        <InventoryIcon />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No {label.toLowerCase()}s yet</h3>
      <p className="text-gray-500 mb-4">Get started by adding your first {label.toLowerCase()}.</p>
      <Link href={href}>
        <Button variant="primary" className="flex items-center gap-2 mx-auto">
          <PlusIcon />
          Add {label}
        </Button>
      </Link>
    </div>
  );
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'resin' | 'paint'>('resin');
  const [resinList, setResinList] = useState<Resin[]>([]);
  const [paintList, setPaintList] = useState<PaintBottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ item: Resin | PaintBottle; type: 'resin' | 'paint' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resin, paint] = await Promise.all([
        fetchResin(),
        fetchPaintBottles()
      ]);
      setResinList(resin);
      setPaintList(paint);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      if (deleteTarget.type === 'resin') {
        await deleteResin(deleteTarget.item.id);
        setResinList(prev => prev.filter(r => r.id !== deleteTarget.item.id));
      } else {
        await deletePaintBottle(deleteTarget.item.id);
        setPaintList(prev => prev.filter(p => p.id !== deleteTarget.item.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
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
              Raw Materials Inventory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage resin and paint bottle inventory
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/inventory/resin/new">
              <Button variant="outline" className="flex items-center gap-2">
                <PlusIcon />
                Add Resin
              </Button>
            </Link>
            <Link href="/inventory/paint/new">
              <Button variant="primary" className="flex items-center gap-2">
                <PlusIcon />
                Add Paint
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('resin')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'resin'
                  ? 'border-current text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={activeTab === 'resin' ? { borderColor: BRAND_COLORS.primary } : {}}
            >
              Resin ({resinList.length})
            </button>
            <button
              onClick={() => setActiveTab('paint')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'paint'
                  ? 'border-current text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={activeTab === 'paint' ? { borderColor: BRAND_COLORS.primary } : {}}
            >
              Paint Bottles ({paintList.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <Card>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : activeTab === 'resin' ? (
            resinList.length === 0 ? (
              <EmptyState type="resin" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Color
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost/Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resinList.map(resin => (
                      <ResinRow 
                        key={resin.id} 
                        resin={resin} 
                        onDelete={(r) => setDeleteTarget({ item: r, type: 'resin' })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            paintList.length === 0 ? (
              <EmptyState type="paint" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Color
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paintList.map(paint => (
                      <PaintBottleRow 
                        key={paint.id} 
                        paint={paint} 
                        onDelete={(p) => setDeleteTarget({ item: p, type: 'paint' })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <DeleteModal
            item={deleteTarget.item}
            type={deleteTarget.type}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </MainLayout>
  );
}
