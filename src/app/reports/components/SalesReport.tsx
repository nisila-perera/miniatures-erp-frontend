'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { DateRangeFilter, SalesReportResponse } from '@/types/report';
import { fetchSalesReport } from '@/services/reports';
import DateRangePicker from './DateRangePicker';

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function SalesReport() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>(DateRangeFilter.THIS_MONTH);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [groupByPaymentMethod, setGroupByPaymentMethod] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SalesReportResponse | null>(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSalesReport({
        date_range: dateRange,
        start_date: dateRange === DateRangeFilter.CUSTOM ? startDate : undefined,
        end_date: dateRange === DateRangeFilter.CUSTOM ? endDate : undefined,
        group_by_category: groupByCategory,
        group_by_payment_method: groupByPaymentMethod,
      });
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateRange, startDate, endDate, groupByCategory, groupByPaymentMethod]);

  const exportToCSV = () => {
    if (!report) return;

    let csv = 'Sales Report\n\n';
    csv += `Period: ${report.start_date} to ${report.end_date}\n\n`;
    csv += `Total Sales,${report.total_sales}\n`;
    csv += `Order Count,${report.order_count}\n`;
    csv += `Average Order Value,${report.average_order_value}\n\n`;

    if (report.by_category && report.by_category.length > 0) {
      csv += '\nSales by Category\n';
      csv += 'Category,Total Sales,Order Count,Average Order Value\n';
      report.by_category.forEach(cat => {
        csv += `${cat.category_name},${cat.total_sales},${cat.order_count},${cat.average_order_value}\n`;
      });
    }

    if (report.by_payment_method && report.by_payment_method.length > 0) {
      csv += '\nSales by Payment Method\n';
      csv += 'Payment Method,Total Sales,Order Count,Average Order Value\n';
      report.by_payment_method.forEach(pm => {
        csv += `${pm.payment_method_name},${pm.total_sales},${pm.order_count},${pm.average_order_value}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${report.start_date}-${report.end_date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        <div className="mt-4 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={groupByCategory}
              onChange={(e) => setGroupByCategory(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Group by Category</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={groupByPaymentMethod}
              onChange={(e) => setGroupByPaymentMethod(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Group by Payment Method</span>
          </label>
        </div>
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
                <h3 className="text-lg font-semibold text-gray-900">Sales Summary</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Sales</p>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                  LKR {parseFloat(report.total_sales).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Count</p>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                  {report.order_count}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Order Value</p>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                  LKR {parseFloat(report.average_order_value).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* By Category */}
          {report.by_category && report.by_category.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total Sales
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Orders
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Avg Order Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.by_category.map((cat) => (
                      <tr key={cat.category_id} className="border-b border-gray-100">
                        <td className="px-4 py-3 text-gray-900">{cat.category_name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          LKR {parseFloat(cat.total_sales).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {cat.order_count}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          LKR {parseFloat(cat.average_order_value).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* By Payment Method */}
          {report.by_payment_method && report.by_payment_method.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Payment Method</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Payment Method
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total Sales
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Orders
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Avg Order Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.by_payment_method.map((pm) => (
                      <tr key={pm.payment_method_id} className="border-b border-gray-100">
                        <td className="px-4 py-3 text-gray-900">{pm.payment_method_name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          LKR {parseFloat(pm.total_sales).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {pm.order_count}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          LKR {parseFloat(pm.average_order_value).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
