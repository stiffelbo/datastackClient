/**
 * Funkcje pomocnicze do przetwarzania presetów i konfiguracji widoku.
 * - Serializacja ustawień z MRT do formatu preset.
 * - Generowanie unikalnego ID.
 * - Łączenie konfiguracji z domyślnymi wartościami.
 */

/**
 * Tworzy nowy preset z bieżącego stanu widoku.
 * @param {string} name - nazwa presetu
 * @param {object} config - konfiguracja MRT (filtry, kolumny itd.)
 */
export const createPreset = (name, config) => ({
  id: `preset-${Date.now()}`,
  name,
  entity: config.entity,
  createdAt: new Date().toISOString(),
  config,
});


import React from 'react';

/**
 * Sprawdza, czy kolumna zawiera tylko wartości liczbowe (lub puste).
 * @param {any[]} values - wartości z kolumny
 * @returns {boolean}
 */
const isNumericColumn = (values) => {
  return values.every(
    (v) => v === null || v === undefined || (!isNaN(parseFloat(v)) && isFinite(v))
  );
};

/**
 * Automatycznie generuje kolumny MRT na podstawie danych.
 * @param {object[]} rows - tablica obiektów (np. dane z API)
 * @returns {MRT_ColumnDef[]}
 */
export const generateColumns = (rows) => {
  if (!Array.isArray(rows) || !rows.length) return [];

  return Object.keys(rows[0]).map((key) => {
    const values = rows.map((r) => r[key]);
    const numeric = isNumericColumn(values);
    const isId = key === 'id' || key.toLowerCase().includes('_id');

    const maxLen = Math.max(
      key.length,
      ...values.map((val) => String(val || '').length)
    );
    const size = maxLen <= 6 ? 60 : maxLen <= 10 ? 100 : maxLen <= 20 ? 140 : 200;

    return {
      accessorKey: key,
      header: key.replace(/_/g, ' ').toUpperCase(),
      size,
      aggregationFn: numeric ? 'sum' : 'uniqueCount',
      AggregatedCell: ({ cell }) => <div>{cell.getValue()}</div>,
      Footer:
        numeric && !isId
          ? ({ table }) => {
              const total = table
                .getFilteredRowModel()
                .rows.reduce(
                  (acc, row) => acc + parseFloat(row.getValue(key) || 0),
                  0
                );
              return total.toFixed(2);
            }
          : null,
    };
  });
};

