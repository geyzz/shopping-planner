/**
 * Formats a number or numeric string into Philippine Peso currency format (e.g. ₱1,000.00)
 * @param {number|string} value - The numeric value to format
 * @param {boolean} includeSymbol - Whether to prepend the '₱' symbol (defaults to true)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, includeSymbol = true) {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (value == null || Number.isNaN(num)) {
    return includeSymbol ? '₱0.00' : '0.00';
  }

  const isNegative = num < 0;
  const absFormatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (includeSymbol) {
    return isNegative ? `-₱${absFormatted}` : `₱${absFormatted}`;
  }
  return isNegative ? `-${absFormatted}` : absFormatted;
}
