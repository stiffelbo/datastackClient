// Parsuje string/Date do Date (lub null jeśli nieprawidłowe)
export const parseDate = (val) => {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// Usuwa część godzinową (start dnia)
export const startOfDay = (date) => {
  const d = parseDate(date);
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// Porównania
export const isBefore = (a, b) => {
  const d1 = parseDate(a);
  const d2 = parseDate(b);
  if (!d1 || !d2) return false;
  return d1.getTime() < d2.getTime();
};

export const isAfter = (a, b) => {
  const d1 = parseDate(a);
  const d2 = parseDate(b);
  if (!d1 || !d2) return false;
  return d1.getTime() > d2.getTime();
};

export const isEqual = (a, b) => {
  const d1 = startOfDay(a);
  const d2 = startOfDay(b);
  if (!d1 || !d2) return false;
  return d1.getTime() === d2.getTime();
};

// Offsety
export const subDays = (date, n) => {
  const d = parseDate(date);
  if (!d) return null;
  const copy = new Date(d);
  copy.setDate(copy.getDate() - n);
  return copy;
};

export const addDays = (date, n) => {
  const d = parseDate(date);
  if (!d) return null;
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};
