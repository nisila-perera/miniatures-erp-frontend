/**
 * Dashboard service for fetching metrics and activity data
 */
import apiClient from './api';
import { DashboardMetrics, RecentActivity } from '@/types/dashboard';

interface Order {
  id: string;
  order_number: string;
  status: string;
  source: string;
  total_amount: number;
  order_date: string;
  customer?: {
    id: string;
    name: string;
  };
}

interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface SalesReportResponse {
  total_sales: number;
  order_count: number;
  average_order_value: number;
  start_date: string;
  end_date: string;
}

/**
 * Fetches dashboard metrics from various API endpoints
 */
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  // Fetch orders to calculate today's orders and pending orders
  const ordersResponse = await apiClient.get<Order[]>('/api/orders');
  const customersResponse = await apiClient.get<Customer[]>('/api/customers');
  
  // Fetch today's sales report
  const todaySalesResponse = await apiClient.post<SalesReportResponse>('/api/reports/sales', {
    date_range: 'today'
  });
  
  // Fetch this month's sales report
  const monthSalesResponse = await apiClient.post<SalesReportResponse>('/api/reports/sales', {
    date_range: 'this_month'
  });

  const orders = ordersResponse.data || [];
  const customers = customersResponse.data || [];
  const todaySales = todaySalesResponse.data;
  const monthSales = monthSalesResponse.data;

  // Calculate today's orders
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(order => 
    order.order_date.startsWith(today)
  ).length;

  // Calculate pending orders
  const pendingOrders = orders.filter(order => 
    order.status === 'pending'
  ).length;

  // Calculate orders in production
  const ordersInProduction = orders.filter(order => 
    ['printing', 'in_production', 'painting'].includes(order.status)
  ).length;

  return {
    todaysOrders: todaySales?.order_count ?? todaysOrders,
    pendingOrders,
    todaysRevenue: todaySales?.total_sales ?? 0,
    totalCustomers: customers.length,
    monthlyRevenue: monthSales?.total_sales ?? 0,
    ordersInProduction
  };
}

/**
 * Fetches recent activity from orders and other sources
 */
export async function fetchRecentActivity(): Promise<RecentActivity[]> {
  const ordersResponse = await apiClient.get<Order[]>('/api/orders');
  const orders = ordersResponse.data || [];

  // Sort orders by date and take the most recent ones
  const sortedOrders = [...orders]
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 10);

  // Convert orders to activity items
  const activities: RecentActivity[] = sortedOrders.map(order => ({
    id: order.id,
    type: 'order' as const,
    description: `Order #${order.order_number} - ${formatStatus(order.status)}`,
    timestamp: order.order_date,
    metadata: {
      orderId: order.id,
      customerId: order.customer?.id,
      amount: order.total_amount
    }
  }));

  return activities;
}

/**
 * Formats order status for display
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    printing: 'Printing',
    in_production: 'In Production',
    painting: 'Painting',
    final_checks: 'Final Checks',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned'
  };
  return statusMap[status] || status;
}

/**
 * Formats currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats relative time for activity feed
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
