// hooks/useDashboardState.js
import { useEffect, useState } from 'react';

/**
 * useDashboardState
 *
 * Trzyma stan dashboardu dla danej encji:
 * - currentId: wybrany rekord (null = brak)
 * - viewMode: tryb widoku zbiorczego (domyślnie 'table')
 * - filters: obiekt filtrów (domyślnie pusty)
 * - tab: aktualna zakładka strony (domyślnie 'details')
 *
 * Wszystko jest *per encja* - zmiana entityName resetuje stan.
 */
export const useDashboardState = ({
  entityName,
  initialViewMode = 'table',
  initialTab = 'edit',
  initialFilters = {},
} = {}) => {
  const [currentId, setCurrentId] = useState(null);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [filters, setFilters] = useState(initialFilters);
  const [tab, setTab] = useState(initialTab);

  // reset stanu przy zmianie encji
  useEffect(() => {
    setCurrentId(null);
    setViewMode(initialViewMode);
    setFilters(initialFilters);
    setTab(initialTab);
  }, [entityName, initialViewMode, initialFilters, initialTab]);

  // helpery do filtrów
  const setFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters || {});
  };

  return {
    entityName,

    currentId,
    setCurrentId,

    viewMode,
    setViewMode,

    filters,
    setFilters,
    setFilter,
    resetFilters,

    tab,
    setTab,
  };
};

export default useDashboardState;
