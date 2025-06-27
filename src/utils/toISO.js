export const toISODate = (val) => {
  if (typeof val === 'number') {
    const date = new Date(Date.UTC(0, 0, val - 1));
    return date.toISOString().slice(0, 10);
  }
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10);
  }
  return val;
};

export const toISOTime = (val) => {
  if (typeof val === 'string' && val.includes(':')) return val;
  return null;
};