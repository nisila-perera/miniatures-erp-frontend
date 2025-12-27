'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge, Select, Input } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { Order } from '@/types/order';
import { OrderSource, OrderStatus } from '@/types';
import { fetchOrders, OrderFilters } from '@/services/orders';

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

// Order card component
interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">#{order.order_number}</h3>
          <p className="text-sm text-gray-500">{orderDate}</p>
        </div>
        <div className="flex gap-2">
          <SourceBadge source={order.source} />
          <StatusBadge status={order.status} />
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {order.customer && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Customer:</span> {order.customer.name}
          </p>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold" style={{ color: BRAND_COLORS.primary }}>
            LKR {Number(order.total_amount).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Balance:</span>
          <span className={order.is_fully_paid ? 'text-green-600' : 'text-red-600'}>
            LKR {Number(order.balance).toFixed(2)}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <Badge variant={order.is_fully_paid ? 'success' : 'warning'}>
          {order.is_fully_paid ? 'Paid' : 'Unpaid'}
        </Badge>
        <Link href={`/orders/${order.id}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <EyeIcon />
            View
          </Button>
        </Link>
      </div>
    </div>
  );
}


// Filter panel component
interface FilterPanelProps {
  filters: OrderFilters;
  onFilterChange: (filters: OrderFilters) => void;
  onClearFilters: () => void;
}

function FilterPanel({ filters, onFilterChange, onClearFilters }: FilterPanelProps) {
  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: OrderSource.WEBSITE, label: 'Website' },
    { value: OrderSource.CUSTOM, label: 'Custom' },
    { value: OrderSource.OTHER, label: 'Other' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
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

  const hasActiveFilters = filters.source || filters.status || filters.start_date || filters.end_date;

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FilterIcon />
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="ml-auto">
            Clear Filters
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Source"
          options={sourceOptions}
          value={filters.source || ''}
          onChange={(e) => onFilterChange({ ...filters, source: e.target.value as OrderSource || undefined })}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value as OrderStatus || undefined })}
        />
        <Input
          label="Start Date"
          type="date"
          value={filters.start_date || ''}
          onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value || undefined })}
        />
        <Input
          label="End Date"
          type="date"
          value={filters.end_date || ''}
          onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value || undefined })}
        />
      </div>
    </Card>
  );
}


// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center"
      >
        <ChevronLeftIcon />
      </Button>
      
      {pages.map((page, index) => (
        typeof page === 'number' ? (
          <Button
            key={index}
            variant={page === currentPage ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="px-2 text-gray-500">...</span>
        )
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}

// Empty state component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-12">
      <div 
        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: BRAND_COLORS.secondary }}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND_COLORS.primary }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        {hasFilters ? 'No orders match your filters' : 'No orders yet'}
      </h3>
      <p className="text-gray-500 mb-4">
        {hasFilters 
          ? 'Try adjusting your filters to find what you\'re looking for.'
          : 'Get started by creating your first order.'}
      </p>
      {!hasFilters && (
        <Link href="/orders/new">
          <Button variant="primary" className="flex items-center gap-2 mx-auto">
            <PlusIcon />
            Create Order
          </Button>
        </Link>
      )}
    </div>
  );
}


// Main page component
const ITEMS_PER_PAGE = 12;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders(filters);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Client-side pagination
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = !!(filters.source || filters.status || filters.start_date || filters.end_date);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track all your orders
            </p>
          </div>
          <Link href="/orders/new">
            <Button variant="primary" className="flex items-center gap-2">
              <PlusIcon />
              New Order
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <EmptyState hasFilters={hasActiveFilters} />
          </Card>
        ) : (
          <>
            {/* Order count */}
            <div className="text-sm text-gray-500">
              Showing {paginatedOrders.length} of {orders.length} orders
            </div>

            {/* Order grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}
