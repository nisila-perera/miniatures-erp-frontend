'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { PaymentMethod } from '@/types/payment';
import { CommissionType } from '@/types';
import { fetchPaymentMethods, deletePaymentMethod } from '@/services/paymentMethods';

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

const CreditCardIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);


// Delete confirmation modal
interface DeleteModalProps {
  paymentMethod: PaymentMethod;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteModal({ paymentMethod, onConfirm, onCancel, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Payment Method</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete the payment method &quot;{paymentMethod.name}&quot;? This action cannot be undone.
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

// Format commission display
function formatCommission(method: PaymentMethod): string {
  if (method.commission_type === CommissionType.PERCENTAGE) {
    return `${method.commission_value}%`;
  }
  return `Rs. ${method.commission_value.toFixed(2)}`;
}

// Payment method row component
interface PaymentMethodRowProps {
  paymentMethod: PaymentMethod;
  onDelete: (paymentMethod: PaymentMethod) => void;
}

function PaymentMethodRow({ paymentMethod, onDelete }: PaymentMethodRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <span className="font-medium text-gray-900">{paymentMethod.name}</span>
      </td>
      <td className="px-6 py-4">
        <Badge variant={paymentMethod.commission_type === CommissionType.PERCENTAGE ? 'info' : 'default'}>
          {paymentMethod.commission_type === CommissionType.PERCENTAGE ? 'Percentage' : 'Fixed'}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-600">{formatCommission(paymentMethod)}</span>
      </td>
      <td className="px-6 py-4">
        <Badge variant={paymentMethod.is_active ? 'success' : 'warning'}>
          {paymentMethod.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <span className="text-gray-500 text-sm">
          {new Date(paymentMethod.created_at).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link href={`/payment-methods/${paymentMethod.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <EditIcon />
              Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onDelete(paymentMethod)}
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
        <CreditCardIcon />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No payment methods yet</h3>
      <p className="text-gray-500 mb-4">Get started by creating your first payment method.</p>
      <Link href="/payment-methods/new">
        <Button variant="primary" className="flex items-center gap-2 mx-auto">
          <PlusIcon />
          Create Payment Method
        </Button>
      </Link>
    </div>
  );
}


export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      await deletePaymentMethod(deleteTarget.id);
      setPaymentMethods(prev => prev.filter(pm => pm.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment method');
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
              Payment Methods
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your payment methods and commission rates
            </p>
          </div>
          <Link href="/payment-methods/new">
            <Button variant="primary" className="flex items-center gap-2">
              <PlusIcon />
              Add Payment Method
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
          ) : paymentMethods.length === 0 ? (
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
                      Commission Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
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
                  {paymentMethods.map(paymentMethod => (
                    <PaymentMethodRow 
                      key={paymentMethod.id} 
                      paymentMethod={paymentMethod} 
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
            paymentMethod={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </MainLayout>
  );
}
