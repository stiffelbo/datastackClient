/**
 * Tworzy bezpieczny obiekt params dla komórki PowerTable.
 * Zawsze zwraca strukturę { field, value, id, row }.
 *
 * @param {object} opts
 * @param {object} [opts.row={}] - pełny wiersz danych
 * @param {object} [opts.column={}] - definicja kolumny
 * @returns {{field: string, value: any, id: string|number|null, row: object}}
 */
export function createCellParams({ value, row = {}, column = {} }) {
  const field = column?.field ?? null;
  const id = row?.id ?? null;

  return { field, value, id, row };
}
