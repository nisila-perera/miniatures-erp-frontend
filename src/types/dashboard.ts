/**
 * Dashboard types for Miniatures.lk ERP System
 */

export interface DashboardMetrics {
  todaysOrders: number;
  pendingOrders: number;
  todaysRevenue: number;
  totalCustomers: number;
  monthlyRevenue: number;
  ordersInProduction: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'payment' | 'customer' | 'expense';
  description: string;
  timestamp: string;
  metadata?: {
    orderId?: string;
    customerId?: string;
    amount?: number;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
}
