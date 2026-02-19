'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { BRAND_COLORS, BRAND_NAME } from '@/config/brand';
import { DashboardMetrics, RecentActivity } from '@/types/dashboard';
import { 
  fetchDashboardMetrics, 
  fetchRecentActivity, 
  formatCurrency, 
  formatRelativeTime 
} from '@/services/dashboard';

// Metric card component for displaying dashboard statistics
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p 
            className="text-3xl font-bold mt-1"
            style={{ color: BRAND_COLORS.primary }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div 
          className="p-3 rounded-full"
          style={{ backgroundColor: BRAND_COLORS.secondary }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Activity item component for the recent activity feed
interface ActivityItemProps {
  activity: RecentActivity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityBadge = (type: RecentActivity['type']) => {
    const badges: Record<RecentActivity['type'], { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
      order: { variant: 'info', label: 'Order' },
      payment: { variant: 'success', label: 'Payment' },
      customer: { variant: 'default', label: 'Customer' },
      expense: { variant: 'warning', label: 'Expense' }
    };
    return badges[type];
  };

  const badge = getActivityBadge(activity.type);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <div>
          <p className="text-sm text-gray-700">{activity.description}</p>
          {activity.metadata?.amount && (
            <p className="text-xs text-gray-500">
              {formatCurrency(activity.metadata.amount)}
            </p>
          )}
        </div>
      </div>
      <span className="text-xs text-gray-400">
        {formatRelativeTime(activity.timestamp)}
      </span>
    </div>
  );
}

// Quick action button component
interface QuickActionProps {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
  icon: React.ReactNode;
}

function QuickActionButton({ label, href, variant, icon }: QuickActionProps) {
  return (
    <Link href={href}>
      <Button variant={variant} className="flex items-center gap-2 w-full justify-center">
        {icon}
        {label}
      </Button>
    </Link>
  );
}

// Icons as simple SVG components
const OrderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND_COLORS.dark }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const PendingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND_COLORS.dark }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND_COLORS.dark }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CustomersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND_COLORS.dark }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ProductionIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND_COLORS.dark }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const MonthlyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: BRAND_COLORS.dark }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ExpenseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SyncIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todaysOrders: 0,
    pendingOrders: 0,
    todaysRevenue: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    ordersInProduction: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        const [metricsData, activityData] = await Promise.all([
          fetchDashboardMetrics(),
          fetchRecentActivity()
        ]);
        
        setMetrics(metricsData);
        setActivities(activityData);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: BRAND_COLORS.dark }}
            >
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome to {BRAND_NAME} ERP System
            </p>
          </div>
          <Link href="/orders/new">
            <Button variant="primary" className="flex items-center gap-2">
              <PlusIcon />
              Create Order
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard
                title="Today's Orders"
                value={metrics.todaysOrders}
                subtitle="Orders received today"
                icon={<OrderIcon />}
              />
              <MetricCard
                title="Pending Orders"
                value={metrics.pendingOrders}
                subtitle="Awaiting processing"
                icon={<PendingIcon />}
              />
              <MetricCard
                title="Today's Revenue"
                value={formatCurrency(metrics.todaysRevenue)}
                subtitle="Total sales today"
                icon={<RevenueIcon />}
              />
              <MetricCard
                title="Total Customers"
                value={metrics.totalCustomers}
                subtitle="Registered customers"
                icon={<CustomersIcon />}
              />
              <MetricCard
                title="In Production"
                value={metrics.ordersInProduction}
                subtitle="Orders being processed"
                icon={<ProductionIcon />}
              />
              <MetricCard
                title="Monthly Revenue"
                value={formatCurrency(metrics.monthlyRevenue)}
                subtitle="This month's total"
                icon={<MonthlyIcon />}
              />
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card title="Quick Actions" className="lg:col-span-1">
                <div className="flex flex-col gap-4">
                  <QuickActionButton
                    label="Create Order"
                    href="/orders/new"
                    variant="primary"
                    icon={<PlusIcon />}
                  />
                  <QuickActionButton
                    label="Add Expense"
                    href="/expenses/new"
                    variant="outline"
                    icon={<ExpenseIcon />}
                  />
                  <QuickActionButton
                    label="Sync WooCommerce"
                    href="/woocommerce"
                    variant="outline"
                    icon={<SyncIcon />}
                  />
                  {/* <QuickActionButton
                    label="View Reports"
                    href="/reports"
                    variant="secondary"
                    icon={<ReportIcon />}
                  /> */}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card title="Recent Activity" className="lg:col-span-2">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent activity</p>
                    <p className="text-sm mt-1">Activity will appear here as you use the system</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {activities.map(activity => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
