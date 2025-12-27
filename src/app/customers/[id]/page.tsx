'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Customer } from '@/types/customer';
import { Order } from '@/types/order';
import { CustomerSource, OrderStatus } from '@/types';
import { fetchCustomer, fetchCustomerOrders } from '@/services/customers';

// Back arrow icon
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

// Source badge component
function SourceBadge({ source }: { source: CustomerSource }) {
  if (source === CustomerSource.WOOCOMMERCE) {
    return <Badge variant="info">WooCommerce</Badge>;
  }
  return <Badge variant="success">ERP</Badge>;
}

// Status badge component
function StatusBadge({ status }: { status: OrderStatus }) {
  const variants: Record<OrderStatus, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
    [OrderStatus.PENDING]: 'warning',
    [OrderStatus.PRINTING]: 'info',
    [OrderStatus.IN_PRODUCTION]: 'info',
    [OrderStatus.PAINTING]: 'info',
    [OrderStatus.FINAL_CHECKS]: 'info',
    [OrderStatus.SHIPPED]: 'success',
    [OrderStatus.DELIVERED]: 'success',
    [OrderStatus.CANCELLED]: 'danger',
    [OrderStatus.RETURNED]: 'danger',
  };
  
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Pending',
    [OrderStatus.PRINTING]: 'Printing',
    [OrderStatus.IN_PRODUCTION]: 'In Production',
    [OrderStatus.PAINTING]: 'Painting',
    [OrderStatus.FINAL_CHECKS]: 'Final Checks',
    [OrderStatus.SHIPPED]: 'Shipped',
    [OrderStatus.DELIVERED]: 'Delivered',
    [OrderStatus.CANCELLED]: 'Cancelled',
    [OrderStatus.RETURNED]: 'Returned',
  };
  
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

// Detail row component
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}


// Order row component
function OrderRow({ order }: { order: Order }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900">{order.order_number}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-600">
          {new Date(order.order_date).toLocaleDateString()}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-900">LKR {Number(order.total_amount).toFixed(2)}</span>
      </td>
      <td className="px-4 py-3">
        {order.is_fully_paid ? (
          <Badge variant="success">Paid</Badge>
        ) : (
          <Badge variant="warning">Balance: LKR {Number(order.balance).toFixed(2)}</Badge>
        )}
      </td>
    </tr>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const [customerData, ordersData] = await Promise.all([
          fetchCustomer(customerId),
          fetchCustomerOrders(customerId),
        ]);
        
        setCustomer(customerData);
        setOrders(ordersData);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load customer');
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      loadData();
    }
  }, [customerId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (loadError || !customer) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {loadError || 'Customer not found'}
          </div>
          <Link href="/customers">
            <Button variant="outline" className="flex items-center gap-2">
              <BackIcon />
              Back to Customers
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Calculate customer stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <BackIcon />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                {customer.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <SourceBadge source={customer.source} />
              </div>
            </div>
          </div>
          <Link href={`/customers/${customer.id}/edit`}>
            <Button variant="primary" className="flex items-center gap-2">
              <EditIcon />
              Edit Customer
            </Button>
          </Link>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                {totalOrders}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                LKR {totalSpent.toFixed(2)}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Avg. Order Value</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                LKR {avgOrderValue.toFixed(2)}
              </p>
            </div>
          </Card>
        </div>

        {/* Customer Details */}
        <Card>
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.dark }}>
            Customer Details
          </h2>
          <dl className="divide-y divide-gray-100">
            <DetailRow label="Name" value={customer.name} />
            <DetailRow label="Email" value={customer.email} />
            <DetailRow label="Phone" value={customer.phone || '-'} />
            <DetailRow label="Address" value={customer.address || '-'} />
            <DetailRow label="City" value={customer.city || '-'} />
            <DetailRow label="Postal Code" value={customer.postal_code || '-'} />
            <DetailRow 
              label="Source" 
              value={<SourceBadge source={customer.source} />} 
            />
            {customer.woocommerce_id && (
              <DetailRow 
                label="WooCommerce ID" 
                value={customer.woocommerce_id} 
              />
            )}
            <DetailRow 
              label="Created" 
              value={new Date(customer.created_at).toLocaleString()} 
            />
            <DetailRow 
              label="Last Updated" 
              value={new Date(customer.updated_at).toLocaleString()} 
            />
          </dl>
        </Card>

        {/* Order History */}
        <Card>
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.dark }}>
            Order History
          </h2>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found for this customer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
