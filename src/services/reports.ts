import { apiClient } from './api';
import {
  SalesReportRequest,
  SalesReportResponse,
  ProfitLossRequest,
  ProfitLossResponse,
  MaterialUsageRequest,
  MaterialUsageResponse,
  BestSellersRequest,
  BestSellersResponse,
  CustomerAnalyticsRequest,
  CustomerAnalyticsResponse,
} from '@/types/report';

export async function fetchSalesReport(
  request: SalesReportRequest
): Promise<SalesReportResponse> {
  const response = await apiClient.post<SalesReportResponse>(
    '/api/reports/sales',
    request
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data!;
}

export async function fetchProfitLossReport(
  request: ProfitLossRequest
): Promise<ProfitLossResponse> {
  const response = await apiClient.post<ProfitLossResponse>(
    '/api/reports/profit-loss',
    request
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data!;
}

export async function fetchMaterialUsageReport(
  request: MaterialUsageRequest
): Promise<MaterialUsageResponse> {
  const response = await apiClient.post<MaterialUsageResponse>(
    '/api/reports/materials',
    request
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data!;
}

export async function fetchBestSellersReport(
  request: BestSellersRequest
): Promise<BestSellersResponse> {
  const response = await apiClient.post<BestSellersResponse>(
    '/api/reports/best-sellers',
    request
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data!;
}

export async function fetchCustomerAnalyticsReport(
  request: CustomerAnalyticsRequest
): Promise<CustomerAnalyticsResponse> {
  const response = await apiClient.post<CustomerAnalyticsResponse>(
    '/api/reports/customer-analytics',
    request
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data!;
}
