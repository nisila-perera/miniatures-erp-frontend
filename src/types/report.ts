export enum DateRangeFilter {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  CUSTOM = 'custom',
}

// Sales Report Types
export interface SalesReportRequest {
  date_range: DateRangeFilter;
  start_date?: string;
  end_date?: string;
  group_by_category?: boolean;
  group_by_payment_method?: boolean;
}

export interface CategorySales {
  category_id: string;
  category_name: string;
  total_sales: string;
  order_count: number;
  average_order_value: string;
}

export interface PaymentMethodSales {
  payment_method_id: string;
  payment_method_name: string;
  total_sales: string;
  order_count: number;
  average_order_value: string;
}

export interface SalesReportResponse {
  total_sales: string;
  order_count: number;
  average_order_value: string;
  start_date: string;
  end_date: string;
  by_category?: CategorySales[];
  by_payment_method?: PaymentMethodSales[];
}

// Profit & Loss Report Types
export interface ProfitLossRequest {
  date_range: DateRangeFilter;
  start_date?: string;
  end_date?: string;
}

export interface ExpenseBreakdown {
  category: string;
  amount: string;
}

export interface ProfitLossResponse {
  total_revenue: string;
  total_expenses: string;
  net_profit: string;
  start_date: string;
  end_date: string;
  expense_breakdown: ExpenseBreakdown[];
}

// Material Usage Report Types
export interface MaterialUsageRequest {
  date_range: DateRangeFilter;
  start_date?: string;
  end_date?: string;
}

export interface ResinUsage {
  color: string;
  total_quantity: string;
  unit: string;
  total_cost: string;
}

export interface PaintBottleUsage {
  bottle_id: string;
  color: string;
  brand: string;
  volume_ml: string;
  cost: string;
}

export interface MaterialUsageResponse {
  start_date: string;
  end_date: string;
  resin_by_color: ResinUsage[];
  paint_bottles: PaintBottleUsage[];
  total_material_cost: string;
}

// Best Sellers Report Types
export interface BestSellersRequest {
  date_range: DateRangeFilter;
  start_date?: string;
  end_date?: string;
  category_id?: string;
}

export interface BestSellingProduct {
  product_id?: string;
  product_name: string;
  category_id: string;
  category_name: string;
  quantity_sold: number;
  revenue: string;
}

export interface BestSellersResponse {
  start_date: string;
  end_date: string;
  products: BestSellingProduct[];
}

// Customer Analytics Report Types
export interface CustomerAnalyticsRequest {
  date_range: DateRangeFilter;
  start_date?: string;
  end_date?: string;
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  total_spending: string;
  order_count: number;
}

export interface CustomerAnalyticsResponse {
  start_date: string;
  end_date: string;
  total_customers: number;
  average_order_value_per_customer: string;
  repeat_customer_rate: string;
  top_customers: TopCustomer[];
}
