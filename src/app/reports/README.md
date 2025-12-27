# Reports Module

This module provides comprehensive business reporting functionality for the Miniatures.lk ERP system.

## Features

### 1. Sales Report
- View total sales, order count, and average order value
- Group sales by product category
- Group sales by payment method
- Filter by date range (Today, This Week, This Month, Custom)
- Export to CSV

### 2. Profit & Loss Statement
- View total revenue from orders
- View total expenses by category
- Calculate net profit/loss
- Visual expense breakdown with percentages
- Filter by date range
- Export to CSV

### 3. Material Usage Report
- Track resin consumption by color
- Track paint bottle usage
- Calculate total material costs
- Filter by date range
- Export to CSV

### 4. Best Selling Products
- Rank products by quantity sold
- View revenue per product
- Filter by product category
- Filter by date range
- Visual ranking with medals for top 3
- Export to CSV

### 5. Customer Analytics
- View total customer count
- Calculate average order value per customer
- Calculate repeat customer rate
- Identify top customers by spending
- Filter by date range
- Export to CSV

## Usage

Navigate to `/reports` to access the reports dashboard. Select a report type to view detailed analytics.

## Date Range Filters

All reports support the following date range options:
- **Today**: Current day only
- **This Week**: Monday to today
- **This Month**: First day of month to today
- **Custom Range**: Specify start and end dates

## Export Functionality

Each report can be exported to CSV format for further analysis in spreadsheet applications.

## Components

- `page.tsx`: Main reports dashboard with report selection
- `components/DateRangePicker.tsx`: Shared date range filter component
- `components/SalesReport.tsx`: Sales report implementation
- `components/ProfitLossReport.tsx`: P&L statement implementation
- `components/MaterialUsageReport.tsx`: Material usage report implementation
- `components/BestSellersReport.tsx`: Best sellers report implementation
- `components/CustomerAnalyticsReport.tsx`: Customer analytics implementation

## API Integration

Reports fetch data from the following backend endpoints:
- `POST /api/reports/sales`
- `POST /api/reports/profit-loss`
- `POST /api/reports/materials`
- `POST /api/reports/best-sellers`
- `POST /api/reports/customer-analytics`

## Styling

Reports use the Miniatures.lk brand colors:
- Primary: #C9A66B (Gold)
- Secondary: #EBD3A0 (Light Gold)
- Dark: #2F2F2F (Dark Gray)
