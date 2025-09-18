import { createContext, useContext, useState, useMemo } from 'react';

/**
 * @typedef {Object} Filter
 * @property {string} id        - Unikalny identyfikator filtra
 * @property {string} field     - Nazwa pola (np. "status")
 * @property {string} op        - Operator (np. "eq", "gt", "contains")
 * @property {any} value        - Wartość filtra
 * @property {string} [label]   - Opcjonalna etykieta dla UI
 */

export const FiltersContext = createContext();

/**
 * Generator ID filtra, jeśli nie podano ręcznie
 * @param {Filter} filter
 * @returns {string}
 */
const generateFilterId = ({ field, op, value }) =>
  `${field}_${op}_${String(value).replace(/\s+/g, '_')}`;

/**
 * Provider filtrów globalnych dla wielu encji
 */
export const FiltersProvider = ({ children }) => {
  const [filtersMap, setFiltersMap] = useState({}); // { entityName: Filter[] }

  const setFilters = (entity, filters) => {
    setFiltersMap((prev) => ({ ...prev, [entity]: filters }));
  };

  const addFilter = (entity, filter) => {
    const id = filter.id || generateFilterId(filter);
    setFiltersMap((prev) => ({
      ...prev,
      [entity]: [...(prev[entity] || []), { ...filter, id }],
    }));
  };

  const removeFilter = (entity, id) => {
    setFiltersMap((prev) => ({
      ...prev,
      [entity]: (prev[entity] || []).filter((f) => f.id !== id),
    }));
  };

  const clearFieldFilters = (entity, field) => {
    setFiltersMap((prev) => ({
      ...prev,
      [entity]: (prev[entity] || []).filter((f) => f.field !== field),
    }));
  };

  const clearFilters = (entity) => {
    setFiltersMap((prev) => ({ ...prev, [entity]: [] }));
  };

  const value = {
    filtersMap,
    getFilters: (entity) => filtersMap[entity] || [],
    setFilters,
    addFilter,
    removeFilter,
    clearFilters,
    clearFieldFilters,
  };

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
};

/**
 * Hook do globalnego kontekstu filtrów
 */
export const useFiltersContext = () => useContext(FiltersContext);

/**
 * Hook do pracy z filtrami konkretnej encji
 * @param {string} entity
 */
export const useFilters = (entity) => {
  const ctx = useFiltersContext();

  const filters = useMemo(() => ctx.getFilters(entity), [ctx.filtersMap, entity]);

  return {
    filters,
    set: (filters) => ctx.setFilters(entity, filters),
    add: (filter) => ctx.addFilter(entity, filter),
    remove: (id) => ctx.removeFilter(entity, id),
    clear: () => ctx.clearFilters(entity),
    clearField: (field) => ctx.clearFieldFilters(entity, field),
  };
};
