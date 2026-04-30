/**
 * Converts a number into a human-readable format for large numbers.
 * 
 * Examples:
 * - 1000    -> "1K"
 * - 1500    -> "1.5K"
 * - 100000  -> "100K"
 * - 1200000 -> "1.2M"
 * - 999     -> "999"
 * - 1234567890 -> "1.23B"
 */

export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + "B"
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M"
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + "K"
  } else {
    return num.toString()
  }
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format play counts (e.g., 1200 → "1.2K", 500 → "500", 3000000 → "3M")
 */

export function formatPlays(plays: number | null | undefined): string {
  if (plays == null) return "0";
  if (plays >= 1_000_000_000) return (plays / 1_000_000_000).toFixed(1) + "B";
  if (plays >= 1_000_000) return (plays / 1_000_000).toFixed(1) + "M";
  if (plays >= 1_000) return (plays / 1_000).toFixed(1) + "K";
  return plays.toString();
}