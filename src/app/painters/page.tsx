'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Painter } from '@/types/painter';
import { fetchPainters, deletePainter } from '@/services/painters';

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

const PainterIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);


// Delete confirmation modal
interface DeleteModalProps {
  painter: Painter;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({ painter, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Painter</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete the painter &quot;{painter.name}&quot;? This action cannot be undone.
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

// Painter row component
interface PainterRowProps {
  painter: Painter;
  onDelete: (painter: Painter) => void;
}

function PainterRow({ painter, onDelete }: PainterRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <span className="font-medium text-gray-900">{painter.name}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-600">{painter.email || '-'}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-600">{painter.phone || '-'}</span>
      </td>
      <td className="px-6 py-4">
        <Badge variant={painter.is_active ? 'success' : 'warning'}>
          {painter.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">
          {new Date(painter.created_at).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link href={`/painters/${painter.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <EditIcon />
              Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onDelete(painter)}
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
        <PainterIcon />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No painters yet</h3>
      <p className="text-gray-500 mb-4">Get started by adding your first painter.</p>
      <Link href="/painters/new">
        <Button variant="primary" className="flex items-center gap-2 mx-auto">
          <PlusIcon />
          Add Painter
        </Button>
      </Link>
    </div>
  );
}


export default function PaintersPage() {
  const [painters, setPainters] = useState<Painter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Painter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPainters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPainters();
      setPainters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load painters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPainters();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      await deletePainter(deleteTarget.id);
      setPainters(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete painter');
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
              Painters
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your painters for order assignments
            </p>
          </div>
          <Link href="/painters/new">
            <Button variant="primary" className="flex items-center gap-2">
              <PlusIcon />
              Add Painter
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
          ) : painters.length === 0 ? (
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {painters.map(painter => (
                    <PainterRow 
                      key={painter.id} 
                      painter={painter} 
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
            painter={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </MainLayout>
  );
}
