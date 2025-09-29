// utils/money.js
const FORMATTERS = new Map();

/**
 * Formatea moneda (ARS por defecto).
 * - decimals: cantidad fija de decimales (por defecto 0 → $ 35.000)
 */
export function money(value, {
  currency = 'ARS',
  locale = 'es-AR',
  decimals = 0,
} = {}) {
  const n = Number(value ?? 0);
  if (!isFinite(n)) return '$ 0';

  const key = `${locale}|${currency}|${decimals}`;
  let fmt = FORMATTERS.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    FORMATTERS.set(key, fmt);
  }
  return fmt.format(n);
}

// Si alguna vez querés dos decimales:
// money(35000, { decimals: 2 })  // → $ 35.000,00
