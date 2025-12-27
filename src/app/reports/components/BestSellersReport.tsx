'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { DateRangeFilter, BestSellersResponse } from '@/types/report';
import { fetchBestSellersReport } from '@/services/reports';
import { fetchProductCategories } from '@/services/productCategories';
import { ProductCategory } from '@/types';
import DateRangePicker from './DateRangePicker';

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function BestSellersReport() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>(DateRangeFilter.THIS_MONTH);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BestSellersResponse | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchProductCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBestSellersReport({
        date_range: dateRange,
        start_date: dateRange === DateRangeFilter.CUSTOM ? startDate : undefined,
        end_date: dateRange === DateRangeFilter.CUSTOM ? endDate : undefined,
        category_id: categoryId || undefined,
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
  }, [dateRange, startDate, endDate, categoryId]);

  const exportToCSV = () => {
    if (!report) return;

    let csv = 'Best Selling Products Report\n\n';
    csv += `Period: ${report.start_date} to ${report.end_date}\n\n`;
    csv += 'Product,Category,Quantity Sold,Revenue\n';
    report.products.forEach(product => {
      csv += `${product.product_name},${product.category_name},${product.quantity_sold},${product.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `best-sellers-${report.start_date}-${report.end_date}.csv`;
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
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
            style={{ outlineColor: BRAND_COLORS.primary }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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
        <Card>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Best Selling Products</h3>
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

          {report.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Quantity Sold
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.products.map((product, index) => (
                    <tr key={product.product_id || index} className="border-b border-gray-100">
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
                        {product.product_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{product.category_name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {product.quantity_sold}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        LKR {parseFloat(product.revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales data for this period</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
