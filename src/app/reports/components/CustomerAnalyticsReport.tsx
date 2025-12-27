'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { DateRangeFilter, CustomerAnalyticsResponse } from '@/types/report';
import { fetchCustomerAnalyticsReport } from '@/services/reports';
import DateRangePicker from './DateRangePicker';

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function CustomerAnalyticsReport() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>(DateRangeFilter.THIS_MONTH);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<CustomerAnalyticsResponse | null>(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCustomerAnalyticsReport({
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
  };

  useEffect(() => {
    loadReport();
  }, [dateRange, startDate, endDate]);

  const exportToCSV = () => {
    if (!report) return;

    let csv = 'Customer Analytics Report\n\n';
    csv += `Period: ${report.start_date} to ${report.end_date}\n\n`;
    csv += `Total Customers,${report.total_customers}\n`;
    csv += `Average Order Value per Customer,${report.average_order_value_per_customer}\n`;
    csv += `Repeat Customer Rate,${report.repeat_customer_rate}%\n\n`;

    if (report.top_customers.length > 0) {
      csv += '\nTop Customers\n';
      csv += 'Customer,Total Spending,Order Count\n';
      report.top_customers.forEach(customer => {
        csv += `${customer.customer_name},${customer.total_spending},${customer.order_count}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-analytics-${report.start_date}-${report.end_date}.csv`;
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
                <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
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
                <p className="text-sm text-gray-500 mb-1">Total Customers</p>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                  {report.total_customers}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Order Value per Customer</p>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                  LKR {parseFloat(report.average_order_value_per_customer).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Repeat Customer Rate</p>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                  {parseFloat(report.repeat_customer_rate).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Top Customers */}
          {report.top_customers.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total Spending
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Order Count
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Avg Order Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.top_customers.map((customer, index) => {
                      const avgOrderValue =
                        parseFloat(customer.total_spending) / customer.order_count;
                      return (
                        <tr key={customer.customer_id} className="border-b border-gray-100">
                          <td className="px-4 py-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                              style={{
                                backgroundColor:
                                  index === 0
                                    ? '#fbbf24'
                                    : index === 1
                                    ? '#9ca3af'
                                    : index === 2
                                    ? '#cd7f32'
                                    : BRAND_COLORS.primary,
                              }}
                            >
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {customer.customer_name}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            LKR {parseFloat(customer.total_spending).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            {customer.order_count}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            LKR {avgOrderValue.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
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
