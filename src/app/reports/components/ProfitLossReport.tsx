'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { DateRangeFilter, ProfitLossResponse } from '@/types/report';
import { fetchProfitLossReport } from '@/services/reports';
import DateRangePicker from './DateRangePicker';

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function ProfitLossReport() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>(DateRangeFilter.THIS_MONTH);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ProfitLossResponse | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfitLossReport({
        date_range: dateRange,
        start_date: dateRange === DateRangeFilter.CUSTOM ? startDate : undefined,
        end_date: dateRange === DateRangeFilter.CUSTOM ? endDate : undefined,
      });
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [dateRange, startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const exportToCSV = () => {
    if (!report) return;

    let csv = 'Profit & Loss Statement\n\n';
    csv += `Period: ${report.start_date} to ${report.end_date}\n\n`;
    csv += `Total Revenue,${report.total_revenue}\n`;
    csv += `Total Expenses,${report.total_expenses}\n`;
    csv += `Net Profit,${report.net_profit}\n\n`;

    if (report.expense_breakdown.length > 0) {
      csv += '\nExpense Breakdown\n';
      csv += 'Category,Amount\n';
      report.expense_breakdown.forEach(exp => {
        csv += `${exp.category},${exp.amount}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-${report.start_date}-${report.end_date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCategory = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  };

  const netProfit = report ? parseFloat(report.net_profit) : 0;
  const isProfitable = netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <DateRangePicker
          dateRange={dateRange}
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={setDateRange}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card>
      )}

      {/* Report */}
      {!loading && report && (
        <>
          {/* Summary */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profit & Loss Statement</h3>
                <p className="text-sm text-gray-500">
                  {report.start_date} to {report.end_date}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={exportToCSV}
              >
                <DownloadIcon />
                Export CSV
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700">Total Revenue</span>
                <span className="text-xl font-semibold text-green-600">
                  LKR {parseFloat(report.total_revenue).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-700">Total Expenses</span>
                <span className="text-xl font-semibold text-red-600">
                  LKR {parseFloat(report.total_expenses).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                <span className="text-lg font-semibold text-gray-900">Net Profit</span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: isProfitable ? '#10b981' : '#ef4444' }}
                >
                  LKR {Math.abs(netProfit).toFixed(2)}
                  {!isProfitable && ' (Loss)'}
                </span>
              </div>
            </div>
          </Card>

          {/* Expense Breakdown */}
          {report.expense_breakdown.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                {report.expense_breakdown.map((exp, index) => {
                  const amount = parseFloat(exp.amount);
                  const totalExpenses = parseFloat(report.total_expenses);
                  const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{formatCategory(exp.category)}</span>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">
                            LKR {amount.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: BRAND_COLORS.primary,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
