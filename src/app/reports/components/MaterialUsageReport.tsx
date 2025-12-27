'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';
import { DateRangeFilter, MaterialUsageResponse } from '@/types/report';
import { fetchMaterialUsageReport } from '@/services/reports';
import DateRangePicker from './DateRangePicker';

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function MaterialUsageReport() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>(DateRangeFilter.THIS_MONTH);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<MaterialUsageResponse | null>(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMaterialUsageReport({
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

    let csv = 'Material Usage Report\n\n';
    csv += `Period: ${report.start_date} to ${report.end_date}\n\n`;
    csv += `Total Material Cost,${report.total_material_cost}\n\n`;

    if (report.resin_by_color.length > 0) {
      csv += '\nResin Usage by Color\n';
      csv += 'Color,Quantity,Unit,Cost\n';
      report.resin_by_color.forEach(resin => {
        csv += `${resin.color},${resin.total_quantity},${resin.unit},${resin.total_cost}\n`;
      });
    }

    if (report.paint_bottles.length > 0) {
      csv += '\nPaint Bottles\n';
      csv += 'Color,Brand,Volume (ml),Cost\n';
      report.paint_bottles.forEach(paint => {
        csv += `${paint.color},${paint.brand},${paint.volume_ml},${paint.cost}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-usage-${report.start_date}-${report.end_date}.csv`;
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
                <h3 className="text-lg font-semibold text-gray-900">Material Usage Summary</h3>
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
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Material Cost</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                LKR {parseFloat(report.total_material_cost).toFixed(2)}
              </p>
            </div>
          </Card>

          {/* Resin Usage */}
          {report.resin_by_color.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resin Usage by Color</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Color
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.resin_by_color.map((resin, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-4 py-3 text-gray-900">{resin.color}</td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {parseFloat(resin.total_quantity).toFixed(2)} {resin.unit}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          LKR {parseFloat(resin.total_cost).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Paint Bottles */}
          {report.paint_bottles.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Paint Bottles</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Color
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Brand
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Volume (ml)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.paint_bottles.map((paint) => (
                      <tr key={paint.bottle_id} className="border-b border-gray-100">
                        <td className="px-4 py-3 text-gray-900">{paint.color}</td>
                        <td className="px-4 py-3 text-gray-900">{paint.brand}</td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {parseFloat(paint.volume_ml).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          LKR {parseFloat(paint.cost).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {report.resin_by_color.length === 0 && report.paint_bottles.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500">No material usage data for this period</p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
