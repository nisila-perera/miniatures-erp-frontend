import apiClient from './api';

export interface SyncResponse {
  created: number;
  updated: number;
  message: string;
}

export interface SyncHistoryItem {
  id: string;
  type: 'orders' | 'customers' | 'products';
  timestamp: Date;
  created: number;
  updated: number;
  status: 'success' | 'error';
  message: string;
}

interface StoredSyncHistoryItem extends Omit<SyncHistoryItem, 'timestamp'> {
  timestamp: string;
}

/**
 * Sync customers from WooCommerce
 */
export async function syncCustomers(): Promise<SyncResponse> {
  const response = await apiClient.post<SyncResponse>('/woocommerce/sync/customers');
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data!;
}

/**
 * Sync products from WooCommerce
 */
export async function syncProducts(): Promise<SyncResponse> {
  const response = await apiClient.post<SyncResponse>('/woocommerce/sync/products');
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data!;
}

/**
 * Sync orders from WooCommerce
 */
export async function syncOrders(): Promise<SyncResponse> {
  const response = await apiClient.post<SyncResponse>('/woocommerce/sync/orders');
  
  if (response.error) {
    throw new Error(response.error.message);
  }
  
  return response.data!;
}

/**
 * Get sync history from local storage
 */
export function getSyncHistory(): SyncHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  const history = localStorage.getItem('woocommerce_sync_history');
  if (!history) return [];
  
  try {
    const parsed = JSON.parse(history) as StoredSyncHistoryItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch {
    return [];
  }
}

/**
 * Add sync result to history
 */
export function addSyncToHistory(
  type: 'orders' | 'customers' | 'products',
  result: SyncResponse | { message: string },
  status: 'success' | 'error'
): void {
  if (typeof window === 'undefined') return;
  
  const history = getSyncHistory();
  const newItem: SyncHistoryItem = {
    id: Date.now().toString(),
    type,
    timestamp: new Date(),
    created: 'created' in result ? result.created : 0,
    updated: 'updated' in result ? result.updated : 0,
    status,
    message: result.message
  };
  
  // Keep only last 50 items
  const updatedHistory = [newItem, ...history].slice(0, 50);
  localStorage.setItem('woocommerce_sync_history', JSON.stringify(updatedHistory));
}

/**
 * Clear sync history
 */
export function clearSyncHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('woocommerce_sync_history');
}
