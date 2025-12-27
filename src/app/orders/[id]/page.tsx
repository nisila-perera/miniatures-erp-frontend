'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge, Select } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Order, OrderItem, OrderPainter } from '@/types/order';
import { Payment } from '@/types/payment';
import { OrderSource, OrderStatus, DiscountType } from '@/types';
import {
  fetchOrder,
  updateOrder,
  sendInvoice,
  downloadInvoicePdf
} from '@/services/orders';
import PainterAssignmentModal from '@/components/PainterAssignmentModal';
import PaymentRecordingModal from '@/components/PaymentRecordingModal';
import { sanitizeHtml } from '@/utils/html';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const PrinterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);


// Source badge component
function SourceBadge({ source }: { source: OrderSource }) {
  const variants: Record<OrderSource, { variant: 'info' | 'success' | 'warning'; label: string }> = {
    [OrderSource.WEBSITE]: { variant: 'info', label: 'Website' },
    [OrderSource.CUSTOM]: { variant: 'success', label: 'Custom' },
    [OrderSource.OTHER]: { variant: 'warning', label: 'Other' },
  };
  
  const config = variants[source] || { variant: 'warning', label: source };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Status badge component
function StatusBadge({ status }: { status: OrderStatus }) {
  const variants: Record<OrderStatus, { variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; label: string }> = {
    [OrderStatus.PENDING]: { variant: 'warning', label: 'Pending' },
    [OrderStatus.PRINTING]: { variant: 'info', label: 'Printing' },
    [OrderStatus.IN_PRODUCTION]: { variant: 'info', label: 'In Production' },
    [OrderStatus.PAINTING]: { variant: 'info', label: 'Painting' },
    [OrderStatus.FINAL_CHECKS]: { variant: 'info', label: 'Final Checks' },
    [OrderStatus.SHIPPED]: { variant: 'success', label: 'Shipped' },
    [OrderStatus.DELIVERED]: { variant: 'success', label: 'Delivered' },
    [OrderStatus.CANCELLED]: { variant: 'danger', label: 'Cancelled' },
    [OrderStatus.RETURNED]: { variant: 'danger', label: 'Returned' },
  };
  
  const config = variants[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Format currency
function formatCurrency(amount: number | string): string {
  return `LKR ${Number(amount).toFixed(2)}`;
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format datetime
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Order Items Section
interface OrderItemsSectionProps {
  items: OrderItem[];
}

function OrderItemsSection({ items }: OrderItemsSectionProps) {
  if (!items || items.length === 0) {
    return (
      <Card title="Order Items">
        <p className="text-gray-500 text-center py-4">No items in this order</p>
      </Card>
    );
  }

  return (
    <Card title="Order Items">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Product</th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-600">Qty</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Unit Price</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Discount</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 px-2">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    {item.custom_description && (
                      <div
                        className="text-sm text-gray-500"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.custom_description) }}
                      />
                    )}
                    <div className="flex gap-2 mt-1">
                      {item.is_colored && (
                        <Badge variant="info">Colored</Badge>
                      )}
                      {item.dimensions && (
                        <span className="text-xs text-gray-500">{item.dimensions}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-center">{item.quantity}</td>
                <td className="py-3 px-2 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="py-3 px-2 text-right">
                  {item.discount_amount > 0 ? (
                    <span className="text-red-600">
                      -{item.discount_type === DiscountType.PERCENTAGE 
                        ? `${item.discount_amount}%` 
                        : formatCurrency(item.discount_amount)}
                    </span>
                  ) : '-'}
                </td>
                <td className="py-3 px-2 text-right font-medium">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}


// Customer Info Section
interface CustomerInfoSectionProps {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
  };
}

function CustomerInfoSection({ customer }: CustomerInfoSectionProps) {
  if (!customer) {
    return (
      <Card title="Customer Information">
        <p className="text-gray-500 text-center py-4">No customer information available</p>
      </Card>
    );
  }

  return (
    <Card title="Customer Information">
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: BRAND_COLORS.secondary }}
        >
          <UserIcon />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-semibold text-gray-900">{customer.name}</h4>
          {customer.email && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {customer.email}
            </p>
          )}
          {customer.phone && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Phone:</span> {customer.phone}
            </p>
          )}
          {(customer.address || customer.city || customer.postal_code) && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Address:</span>{' '}
              {[customer.address, customer.city, customer.postal_code].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Currency Icon
const CurrencyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Payments Section
interface PaymentsSectionProps {
  payments: Payment[];
  totalAmount: number;
  paidAmount: number;
  balance: number;
  onRecordPayment: () => void;
}

function PaymentsSection({ payments, totalAmount, paidAmount, balance, onRecordPayment }: PaymentsSectionProps) {
  return (
    <Card title="Payments">
      {/* Payment Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.secondary + '40' }}>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.dark }}>
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(paidAmount)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Balance</p>
          <p className={`text-lg font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Record Payment Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={onRecordPayment}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          style={{ 
            backgroundColor: BRAND_COLORS.secondary, 
            color: BRAND_COLORS.dark 
          }}
        >
          <CurrencyIcon />
          Record Payment
        </button>
      </div>

      {/* Payment Transactions */}
      {payments && payments.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Payment History</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Method</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">Commission</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-sm">{formatDate(payment.payment_date)}</td>
                    <td className="py-2 px-2 text-sm">{payment.payment_method?.name || 'N/A'}</td>
                    <td className="py-2 px-2 text-sm text-right font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-2 px-2 text-sm text-right text-gray-500">
                      {formatCurrency(payment.commission_amount)}
                    </td>
                    <td className="py-2 px-2 text-sm text-gray-500">
                      {payment.reference_number || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No payments recorded yet</p>
      )}
    </Card>
  );
}


// Add Painter Icon
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// Painters Section
interface PaintersSectionProps {
  painters: OrderPainter[];
  onAssignPainter: () => void;
}

function PaintersSection({ painters, onAssignPainter }: PaintersSectionProps) {
  return (
    <Card title="Assigned Painters">
      <div className="space-y-4">
        {/* Assign Painter Button */}
        <div className="flex justify-end">
          <button
            onClick={onAssignPainter}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            style={{ 
              backgroundColor: BRAND_COLORS.secondary, 
              color: BRAND_COLORS.dark 
            }}
          >
            <PlusIcon />
            Assign Painter
          </button>
        </div>

        {/* Painters List */}
        {painters && painters.length > 0 ? (
          <div className="space-y-3">
            {painters.map((assignment) => (
              <div 
                key={assignment.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: BRAND_COLORS.secondary }}
                  >
                    <PaletteIcon />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{assignment.painter_name || 'Unknown Painter'}</p>
                    <p className="text-sm text-gray-500">
                      Assigned: {formatDate(assignment.assigned_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium" style={{ color: BRAND_COLORS.primary }}>
                    {formatCurrency(assignment.painting_cost)}
                  </p>
                  {assignment.notes && (
                    <p className="text-xs text-gray-500">{assignment.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No painters assigned yet</p>
        )}
      </div>
    </Card>
  );
}

// Status Update Section
interface StatusUpdateSectionProps {
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  isUpdating: boolean;
}

function StatusUpdateSection({ currentStatus, onStatusChange, isUpdating }: StatusUpdateSectionProps) {
  const statusOptions = [
    { value: OrderStatus.PENDING, label: 'Pending' },
    { value: OrderStatus.PRINTING, label: 'Printing' },
    { value: OrderStatus.IN_PRODUCTION, label: 'In Production' },
    { value: OrderStatus.PAINTING, label: 'Painting' },
    { value: OrderStatus.FINAL_CHECKS, label: 'Final Checks' },
    { value: OrderStatus.SHIPPED, label: 'Shipped' },
    { value: OrderStatus.DELIVERED, label: 'Delivered' },
    { value: OrderStatus.CANCELLED, label: 'Cancelled' },
    { value: OrderStatus.RETURNED, label: 'Returned' },
  ];

  return (
    <Card title="Update Status">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Current Status:</span>
          <StatusBadge status={currentStatus} />
        </div>
        <Select
          label="Change Status"
          options={statusOptions}
          value={currentStatus}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
          disabled={isUpdating}
        />
        {isUpdating && (
          <p className="text-sm text-gray-500">Updating status...</p>
        )}
      </div>
    </Card>
  );
}

// Order Summary Section
interface OrderSummarySectionProps {
  order: Order;
}

function OrderSummarySection({ order }: OrderSummarySectionProps) {
  return (
    <Card title="Order Summary">
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>
              Discount
              {order.discount_type === DiscountType.PERCENTAGE && ` (${order.discount_amount}%)`}
            </span>
            <span>
              -{order.discount_type === DiscountType.PERCENTAGE 
                ? formatCurrency(order.subtotal * order.discount_amount / 100)
                : formatCurrency(order.discount_amount)}
            </span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-semibold text-lg" style={{ color: BRAND_COLORS.primary }}>
            {formatCurrency(order.total_amount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Paid</span>
          <span className="text-green-600">{formatCurrency(order.paid_amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Balance</span>
          <span className={order.balance > 0 ? 'text-red-600' : 'text-green-600'}>
            {formatCurrency(order.balance)}
          </span>
        </div>
        <div className="pt-2">
          <Badge variant={order.is_fully_paid ? 'success' : 'warning'}>
            {order.is_fully_paid ? 'Fully Paid' : 'Payment Pending'}
          </Badge>
        </div>
      </div>
    </Card>
  );
}


// Main Page Component
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPainterModalOpen, setIsPainterModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || newStatus === order.status) return;

    try {
      setIsUpdatingStatus(true);
      setError(null);
      const updatedOrder = await updateOrder(orderId, { status: newStatus });
      setOrder(updatedOrder);
      setSuccessMessage('Status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendInvoice = async () => {
    try {
      setIsSendingInvoice(true);
      setError(null);
      await sendInvoice(orderId);
      setSuccessMessage('Invoice sent successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      setIsDownloadingPdf(true);
      setError(null);
      const blob = await downloadInvoicePdf(orderId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${order?.order_number || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('Invoice downloaded successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download invoice');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error && !order) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Link href="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon />
            Back to Orders
          </Link>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Link href="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon />
            Back to Orders
          </Link>
          <div className="text-center py-12">
            <p className="text-gray-500">Order not found</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
              <ArrowLeftIcon />
              Back to Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                Order #{order.order_number}
              </h1>
              <SourceBadge source={order.source} />
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Created on {formatDateTime(order.created_at)}
            </p>
          </div>
          
          {/* Invoice Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrintInvoice}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2"
            >
              <PrinterIcon />
              {isDownloadingPdf ? 'Downloading...' : 'Print Invoice'}
            </Button>
            <Button
              variant="primary"
              onClick={handleSendInvoice}
              disabled={isSendingInvoice}
              className="flex items-center gap-2"
            >
              <MailIcon />
              {isSendingInvoice ? 'Sending...' : 'Send Invoice'}
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <OrderItemsSection items={order.items || []} />
            <PaymentsSection 
              payments={order.payments || []}
              totalAmount={order.total_amount}
              paidAmount={order.paid_amount}
              balance={order.balance}
              onRecordPayment={() => setIsPaymentModalOpen(true)}
            />
            <PaintersSection 
              painters={order.painters || []} 
              onAssignPainter={() => setIsPainterModalOpen(true)}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <StatusUpdateSection
              currentStatus={order.status}
              onStatusChange={handleStatusChange}
              isUpdating={isUpdatingStatus}
            />
            <OrderSummarySection order={order} />
            <CustomerInfoSection customer={order.customer} />
            
            {/* Order Notes */}
            {order.notes && (
              <Card title="Notes">
                <p className="text-gray-600 whitespace-pre-wrap">{order.notes}</p>
              </Card>
            )}

            {/* Discount Reason */}
            {order.discount_reason && (
              <Card title="Discount Reason">
                <p className="text-gray-600">{order.discount_reason}</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Painter Assignment Modal */}
      <PainterAssignmentModal
        isOpen={isPainterModalOpen}
        onClose={() => setIsPainterModalOpen(false)}
        orderId={orderId}
        onAssignmentComplete={loadOrder}
      />

      {/* Payment Recording Modal */}
      <PaymentRecordingModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderId={orderId}
        orderTotal={order.total_amount}
        paidAmount={order.paid_amount}
        balance={order.balance}
        existingPayments={order.payments || []}
        onPaymentComplete={loadOrder}
      />
    </MainLayout>
  );
}
