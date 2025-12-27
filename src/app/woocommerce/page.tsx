'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import {
  syncCustomers,
  syncProducts,
  syncOrders,
  getSyncHistory,
  addSyncToHistory,
  clearSyncHistory,
  SyncHistoryItem
} from '@/services/woocommerce';

// Icons
const SyncIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CustomersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ProductsIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Sync card component
interface SyncCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onSync: () => void;
  loading: boolean;
  result: { created: number; updated: number; message: string } | null;
  error: string | null;
}

function SyncCard({ title, description, icon, onSync, loading, result, error }: SyncCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-full"
            style={{ backgroundColor: BRAND_COLORS.secondary }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.dark }}>
              {title}
            </h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-green-600 mt-0.5">
              <CheckIcon />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{result.message}</p>
              <div className="flex gap-4 mt-2 text-xs text-green-700">
                <span>Created: {result.created}</span>
                <span>Updated: {result.updated}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-red-600 mt-0.5">
              <ErrorIcon />
            </div>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Sync Button */}
      <Button
        variant="primary"
        onClick={onSync}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2"
      >
        <SyncIcon />
        {loading ? 'Syncing...' : 'Sync Now'}
      </Button>
    </Card>
  );
}

// History item component
interface HistoryItemProps {
  item: SyncHistoryItem;
}

function HistoryItem({ item }: HistoryItemProps) {
  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTypeBadge = (type: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (type) {
      case 'orders':
        return 'info';
      case 'customers':
        return 'success';
      case 'products':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 flex-1">
        <Badge variant={getTypeBadge(item.type)}>
          {getTypeLabel(item.type)}
        </Badge>
        <div className="flex-1">
          <p className="text-sm text-gray-700">{item.message}</p>
          {item.status === 'success' && (
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span>Created: {item.created}</span>
              <span>Updated: {item.updated}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {item.status === 'success' ? (
          <div className="text-green-600">
            <CheckIcon />
          </div>
        ) : (
          <div className="text-red-600">
            <ErrorIcon />
          </div>
        )}
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatRelativeTime(item.timestamp)}
        </span>
      </div>
    </div>
  );
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function WooCommerceSyncPage() {
  const [history, setHistory] = useState<SyncHistoryItem[]>([]);
  
  // Sync states
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersResult, setCustomersResult] = useState<{ created: number; updated: number; message: string } | null>(null);
  const [customersError, setCustomersError] = useState<string | null>(null);

  const [productsLoading, setProductsLoading] = useState(false);
  const [productsResult, setProductsResult] = useState<{ created: number; updated: number; message: string } | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersResult, setOrdersResult] = useState<{ created: number; updated: number; message: string } | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(getSyncHistory());
  }, []);

  const handleSyncCustomers = async () => {
    setCustomersLoading(true);
    setCustomersResult(null);
    setCustomersError(null);

    try {
      const result = await syncCustomers();
      setCustomersResult(result);
      addSyncToHistory('customers', result, 'success');
      setHistory(getSyncHistory());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync customers';
      setCustomersError(errorMessage);
      addSyncToHistory('customers', { message: errorMessage }, 'error');
      setHistory(getSyncHistory());
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleSyncProducts = async () => {
    setProductsLoading(true);
    setProductsResult(null);
    setProductsError(null);

    try {
      const result = await syncProducts();
      setProductsResult(result);
      addSyncToHistory('products', result, 'success');
      setHistory(getSyncHistory());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync products';
      setProductsError(errorMessage);
      addSyncToHistory('products', { message: errorMessage }, 'error');
      setHistory(getSyncHistory());
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSyncOrders = async () => {
    setOrdersLoading(true);
    setOrdersResult(null);
    setOrdersError(null);

    try {
      const result = await syncOrders();
      setOrdersResult(result);
      addSyncToHistory('orders', result, 'success');
      setHistory(getSyncHistory());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync orders';
      setOrdersError(errorMessage);
      addSyncToHistory('orders', { message: errorMessage }, 'error');
      setHistory(getSyncHistory());
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearSyncHistory();
    setHistory([]);
  };

  const anySyncing = customersLoading || productsLoading || ordersLoading;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
            WooCommerce Sync
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Import orders, customers, and products from your WooCommerce store
          </p>
        </div>

        {/* Info Card */}
        <Card>
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: BRAND_COLORS.secondary }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND_COLORS.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">About WooCommerce Sync</h3>
              <p className="text-sm text-gray-600">
                Sync data from your WooCommerce store on demand. Existing records will be updated, 
                and new records will be created. This process is idempotent and safe to run multiple times.
              </p>
            </div>
          </div>
        </Card>

        {/* Sync Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SyncCard
            title="Customers"
            description="Import customer data from WooCommerce"
            icon={<CustomersIcon />}
            onSync={handleSyncCustomers}
            loading={customersLoading}
            result={customersResult}
            error={customersError}
          />
          <SyncCard
            title="Products"
            description="Import product catalog from WooCommerce"
            icon={<ProductsIcon />}
            onSync={handleSyncProducts}
            loading={productsLoading}
            result={productsResult}
            error={productsError}
          />
          <SyncCard
            title="Orders"
            description="Import orders from WooCommerce"
            icon={<OrdersIcon />}
            onSync={handleSyncOrders}
            loading={ordersLoading}
            result={ordersResult}
            error={ordersError}
          />
        </div>

        {/* Sync All Button */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Sync All Data</h3>
              <p className="text-sm text-gray-600 mt-1">
                Sync customers, products, and orders in sequence
              </p>
            </div>
            <Button
              variant="primary"
              onClick={async () => {
                await handleSyncCustomers();
                await handleSyncProducts();
                await handleSyncOrders();
              }}
              disabled={anySyncing}
              className="flex items-center gap-2"
            >
              <SyncIcon />
              {anySyncing ? 'Syncing...' : 'Sync All'}
            </Button>
          </div>
        </Card>

        {/* Sync History */}
        <Card 
          title="Sync History"
          action={
            history.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="flex items-center gap-1"
              >
                <TrashIcon />
                Clear History
              </Button>
            ) : undefined
          }
        >
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No sync history yet</p>
              <p className="text-sm mt-1">Sync history will appear here after you perform a sync</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {history.map(item => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
