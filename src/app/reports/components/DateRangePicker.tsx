import { DateRangeFilter } from '@/types/report';
import { BRAND_COLORS } from '@/config/brand';

interface DateRangePickerProps {
  dateRange: DateRangeFilter;
  startDate: string;
  endDate: string;
  onDateRangeChange: (range: DateRangeFilter) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export default function DateRangePicker({
  dateRange,
  startDate,
  endDate,
  onDateRangeChange,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value as DateRangeFilter)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
          style={{ outlineColor: BRAND_COLORS.primary }}
        >
          <option value={DateRangeFilter.TODAY}>Today</option>
          <option value={DateRangeFilter.THIS_WEEK}>This Week</option>
          <option value={DateRangeFilter.THIS_MONTH}>This Month</option>
          <option value={DateRangeFilter.CUSTOM}>Custom Range</option>
        </select>
      </div>
      {dateRange === DateRangeFilter.CUSTOM && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{ outlineColor: BRAND_COLORS.primary }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{ outlineColor: BRAND_COLORS.primary }}
            />
          </div>
        </>
      )}
    </div>
  );
}
