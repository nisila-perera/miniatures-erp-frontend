/**
 * Brand configuration for Miniatures.lk ERP System
 * These colors are used throughout the application for consistent branding
 */
export const BRAND_COLORS = {
  primary: '#C9A66B',
  secondary: '#EBD3A0',
  dark: '#2F2F2F',
} as const;

export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || 'Miniatures.lk';

export type BrandColorKey = keyof typeof BRAND_COLORS;

/**
 * Validates that a color string matches one of the brand colors
 */
export function isBrandColor(color: string): boolean {
  return Object.values(BRAND_COLORS).includes(color as typeof BRAND_COLORS[BrandColorKey]);
}

/**
 * Gets the brand color value by key
 */
export function getBrandColor(key: BrandColorKey): string {
  return BRAND_COLORS[key];
}

/**
 * Returns all brand colors as an array
 */
export function getAllBrandColors(): string[] {
  return Object.values(BRAND_COLORS);
}
