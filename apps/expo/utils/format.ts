/**
 * Formats a price in cents to a currency string
 * @param price Price in cents
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(price?: number): string {
  if (!price) return '$0.00';
  return `$${(price / 100).toFixed(2)}`;
}
