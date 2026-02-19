import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BRAND_COLORS } from '@/config/brand';

const SearchIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
    />
  </svg>
);

export default function NotFound() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl py-10">
        <Card className="border border-gray-100">
          <div className="text-center space-y-5">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: BRAND_COLORS.secondary, color: BRAND_COLORS.dark }}
            >
              <SearchIcon />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium tracking-wide uppercase text-gray-500">
                Page Not Found
              </p>
              <h1 className="text-4xl font-bold" style={{ color: BRAND_COLORS.dark }}>
                404
              </h1>
              <p className="text-gray-600">
                The page you requested does not exist or may have been moved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
              <Link href="/orders">
                <Button variant="outline">View Orders</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
