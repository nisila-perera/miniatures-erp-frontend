/**
 * Property-based tests for brand color application
 * 
 * Feature: miniatures-erp, Property 65: Brand color application
 * Validates: Requirements 21.5
 * 
 * For any interface view, the Miniatures.lk brand colors (#C9A66B, #EBD3A0, #2F2F2F) 
 * SHALL be applied.
 */

import * as fc from 'fast-check';
import { BRAND_COLORS, isBrandColor, getBrandColor, getAllBrandColors, BrandColorKey } from '../config/brand';

describe('Property 65: Brand color application', () => {
  // The exact brand colors that must be used
  const REQUIRED_BRAND_COLORS = {
    primary: '#C9A66B',
    secondary: '#EBD3A0',
    dark: '#2F2F2F',
  };

  /**
   * Property: Brand colors configuration contains all required colors
   * For any brand color key, the configured value SHALL match the required brand color
   */
  test('brand colors configuration contains all required colors', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...(Object.keys(REQUIRED_BRAND_COLORS) as BrandColorKey[])),
        (colorKey) => {
          const configuredColor = BRAND_COLORS[colorKey];
          const requiredColor = REQUIRED_BRAND_COLORS[colorKey];
          
          expect(configuredColor).toBe(requiredColor);
          return configuredColor === requiredColor;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isBrandColor correctly identifies brand colors
   * For any valid brand color, isBrandColor SHALL return true
   */
  test('isBrandColor returns true for all brand colors', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(REQUIRED_BRAND_COLORS)),
        (color) => {
          const result = isBrandColor(color);
          expect(result).toBe(true);
          return result === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isBrandColor rejects non-brand colors
   * For any color not in the brand palette, isBrandColor SHALL return false
   */
  test('isBrandColor returns false for non-brand colors', () => {
    const nonBrandColors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 'red', 'blue'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...nonBrandColors),
        (color) => {
          const result = isBrandColor(color);
          expect(result).toBe(false);
          return result === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: getBrandColor returns correct color for any valid key
   * For any brand color key, getBrandColor SHALL return the corresponding hex value
   */
  test('getBrandColor returns correct color for valid keys', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...(Object.keys(REQUIRED_BRAND_COLORS) as BrandColorKey[])),
        (key) => {
          const color = getBrandColor(key);
          const expected = REQUIRED_BRAND_COLORS[key];
          
          expect(color).toBe(expected);
          return color === expected;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: getAllBrandColors returns all required colors
   * The returned array SHALL contain exactly all required brand colors
   */
  test('getAllBrandColors returns all required brand colors', () => {
    const allColors = getAllBrandColors();
    const requiredColors = Object.values(REQUIRED_BRAND_COLORS);
    
    // All required colors should be present
    requiredColors.forEach(color => {
      expect(allColors).toContain(color);
    });
    
    // Should have exactly the right number of colors
    expect(allColors.length).toBe(requiredColors.length);
  });

  /**
   * Property: Brand colors are valid hex color codes
   * For any brand color, it SHALL be a valid 6-digit hex color code
   */
  test('all brand colors are valid hex color codes', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(BRAND_COLORS)),
        (color) => {
          const isValidHex = hexColorRegex.test(color);
          expect(isValidHex).toBe(true);
          return isValidHex;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Brand color keys are consistent
   * For any brand color key, it SHALL exist in both BRAND_COLORS and REQUIRED_BRAND_COLORS
   */
  test('brand color keys are consistent between config and requirements', () => {
    const configKeys = Object.keys(BRAND_COLORS);
    const requiredKeys = Object.keys(REQUIRED_BRAND_COLORS);
    
    expect(configKeys.sort()).toEqual(requiredKeys.sort());
  });
});
