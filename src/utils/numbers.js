/**
 * Formatuje liczbę dziesiętną do np. "1,25"
 *
 * @param {number|string} value - liczba do sformatowania
 * @param {number} fractionDigits - liczba miejsc po przecinku (default: 2)
 * @param {string} locale - język/region (default: 'pl-PL')
 * @returns {string}
 */
export function formatDecimal(value, fractionDigits = 2, locale = 'pl-PL') {
  const num = typeof value === 'number' ? value : parseFloat(value);

  if (isNaN(num)) return '–';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}
