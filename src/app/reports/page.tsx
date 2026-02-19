'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import SalesReport from './components/SalesReport';
import ProfitLossReport from './components/ProfitLossReport';
import MaterialUsageReport from './components/MaterialUsageReport';
import BestSellersReport from './components/BestSellersReport';
import CustomerAnalyticsReport from './components/CustomerAnalyticsReport';

// Icons
const ChartIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SalesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ProfitIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const MaterialIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

type ReportType = 'sales' | 'profit-loss' | 'materials' | 'best-sellers' | 'customers';

interface ReportOption {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const reportOptions: ReportOption[] = [
  {
    id: 'sales',
    title: 'Sales Report',
    description: 'View sales performance by category and payment method',
    icon: <SalesIcon />,
  },
  {
    id: 'profit-loss',
    title: 'Profit & Loss',
    description: 'Analyze revenue, expenses, and net profit',
    icon: <ProfitIcon />,
  },
  {
    id: 'materials',
    title: 'Material Usage',
    description: 'Track resin and paint consumption',
    icon: <MaterialIcon />,
  },
  {
    id: 'best-sellers',
    title: 'Best Sellers',
    description: 'Identify top-performing products',
    icon: <TrophyIcon />,
  },
  {
    id: 'customers',
    title: 'Customer Analytics',
    description: 'Understand customer behavior and spending',
    icon: <UsersIcon />,
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);

  const renderReport = () => {
    switch (selectedReport) {
      case 'sales':
        return <SalesReport />;
      case 'profit-loss':
        return <ProfitLossReport />;
      case 'materials':
        return <MaterialUsageReport />;
      case 'best-sellers':
        return <BestSellersReport />;
      case 'customers':
        return <CustomerAnalyticsReport />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
              Business Reports
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Analyze your business performance with detailed reports
            </p>
          </div>
          {selectedReport && (
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Back to Reports
            </Button>
          )}
        </div>

        {/* Report Selection or Report View */}
        {!selectedReport ? (
          <>
            {/* Report Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportOptions.map((option) => (
                <div
                  key={option.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedReport(option.id)}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: BRAND_COLORS.secondary }}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Info Card */}
            <Card>
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: BRAND_COLORS.secondary }}
                >
                  <ChartIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    About Reports
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Our reporting system provides comprehensive insights into your business operations.
                    Each report can be filtered by date range and exported for further analysis.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Filter by Today, This Week, This Month, or Custom Range</li>
                    <li>• Export reports to CSV or PDF format</li>
                    <li>• View detailed breakdowns and visualizations</li>
                    <li>• Track trends over time</li>
                  </ul>
                </div>
              </div>
            </Card>
          </>
        ) : (
          renderReport()
        )}
      </div>
    </MainLayout>
  );
}
