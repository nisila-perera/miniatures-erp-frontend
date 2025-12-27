/**
 * Utility functions for handling HTML content
 */

/**
 * Sanitizes HTML content to prevent XSS attacks while allowing safe HTML tags
 * This is a basic sanitization - for production, consider using a library like DOMPurify
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

/**
 * Checks if a string contains HTML tags
 */
export function containsHtml(text: string | null | undefined): boolean {
  if (!text) return false;
  return /<[^>]+>/.test(text);
}

/**
 * Strips all HTML tags from a string
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
}

