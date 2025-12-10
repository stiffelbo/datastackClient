import React from 'react';

const DEFAULT_LOCALE = 'pl-PL';

// --- Cache dla Intl.NumberFormat (żeby nie tworzyć na każdą komórkę)
const intlCache = new Map();
const getIntl = (locale, options) => {
  const key = locale + '|' + JSON.stringify(options);
  if (!intlCache.has(key)) intlCache.set(key, new Intl.NumberFormat(locale, options));
  return intlCache.get(key);
};

// --- Parser liczb uwzględniający polskie zapisy: "1 234,56", "1.234,56", NBSP itp.
const toNumberLike = (val) => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number' && Number.isFinite(val)) return val;

  if (typeof val === 'string') {
    // usuń spacje, NBSP ( ), cienką spację ( )
    let s = val.replace(/[\s\u00A0\u202F]/g, '').trim();

    // jeżeli jest znak % – potraktuj to jako procent (zwróć liczbę w skali 0–1)
    const isPercent = s.endsWith('%');
    if (isPercent) s = s.slice(0, -1);

    // heurystyki separatorów
    const hasComma = s.includes(',');
    const hasDot = s.includes('.');

    if (hasComma && hasDot) {
      // przyjmij, że ostatni separator to separator dziesiętny
      const lastComma = s.lastIndexOf(',');
      const lastDot = s.lastIndexOf('.');
      if (lastComma > lastDot) {
        // PL: 1.234,56
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        // US: 1,234.56
        s = s.replace(/,/g, '');
      }
    } else if (hasComma) {
      // PL: 1234,56 lub 1,234 (rzadziej)
      // usuń kropki tysięczne jeśli były, zamień przecinek na kropkę
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // US: 1,234.56 lub 1234.56
      s = s.replace(/,/g, '');
    }

    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    return isPercent ? n / 100 : n;
  }
  return null;
};

// --- Główny formatter liczbowy
const fmtNumber = (val, { decimals = 0, locale = DEFAULT_LOCALE } = {}) => {
  const n = toNumberLike(val);
  if (n === null) return val ?? '';
  return getIntl(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

const booleanYesNo = (val) => {
  if (val === true || val === 1 || val === '1') return '✅';
  if (val === false || val === 0 || val === '0') return '❌';
  if (val === null || val === undefined || val === '') return '⬜';

  // dla niepoprawnych wartości
  return '⚠️';
};

export const valueFormatters = {
  // ===== Liczbowe
  number: (value, opts) => fmtNumber(value, { decimals: 0, ...(opts || {}) }),
  number2: (value, opts) => fmtNumber(value, { decimals: 2, ...(opts || {}) }),
  number4: (value, opts) => fmtNumber(value, { decimals: 4, ...(opts || {}) }),

  PLN: (value, { currency = 'PLN', locale = DEFAULT_LOCALE } = {}) => {
    const n = toNumberLike(value);
    if (n === null) return value ?? '';
    return getIntl(locale, { style: 'currency', currency }).format(n);
  },
  USD: (value, { currency = 'USD', locale = DEFAULT_LOCALE } = {}) => {
    const n = toNumberLike(value);
    if (n === null) return value ?? '';
    return getIntl(locale, { style: 'currency', currency }).format(n);
  },
  EURO: (value, { currency = 'EUR', locale = DEFAULT_LOCALE } = {}) => {
    const n = toNumberLike(value);
    if (n === null) return value ?? '';
    return getIntl(locale, { style: 'currency', currency }).format(n);
  },

  // percent z autodetekcją skali:
  //  - jeśli |n| <= 1 -> traktuj jako ułamek (0.123 => 12%)
  //  - jeśli |n| > 1  -> traktuj jako już procent (12 => 12%)
  percent: (value, { decimals = 2, locale = DEFAULT_LOCALE } = {}) => {
    const n = toNumberLike(value);
    if (n === null) return value ?? '';
    const scaled = Math.abs(n) <= 1 ? n * 100 : n;
    return getIntl(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(scaled) + '%';
  },

  // ===== Tekst / boolean
  uppercase: (val) => (val ? String(val).toUpperCase() : ''),
  lowercase: (val) => (val ? String(val).toLowerCase() : ''),
  booleanYesNo: (val) => booleanYesNo(val),
  link: (value) => {
    if (!value) return '';

    const url = String(value).trim();

    // prosta ochrona – tylko http/https
    const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    return safeUrl;
  },
};
