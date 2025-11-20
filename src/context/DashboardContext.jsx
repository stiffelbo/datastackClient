import React, { createContext, useContext, useState, useCallback } from 'react';

const DashboardContext = createContext(null);

const defaultEntityState = {
  currentId: null,
  viewMode: 'table',
  tab: 'details',
  filters: {},
};

export const DashboardProvider = ({ children }) => {
  const [entitiesState, setEntitiesState] = useState({}); // { [entityName]: { ...state } }

  const updateEntityState = useCallback((entityName, partial) => {
    setEntitiesState(prev => {
      const prevState = prev[entityName] || defaultEntityState;
      return {
        ...prev,
        [entityName]: {
          ...prevState,
          ...partial,
        },
      };
    });
  }, []);

  const value = {
    entitiesState,
    updateEntityState,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (entityName) => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within <DashboardProvider>');
  }

  const state = ctx.entitiesState[entityName] || defaultEntityState;

  const setCurrentId = (currentId) =>
    ctx.updateEntityState(entityName, { currentId });

  const setViewMode = (viewMode) =>
    ctx.updateEntityState(entityName, { viewMode });

  const setTab = (tab) =>
    ctx.updateEntityState(entityName, { tab });

  const setFilters = (filters) =>
    ctx.updateEntityState(entityName, { filters });

  const setFilter = (key, value) =>
    ctx.updateEntityState(entityName, {
      filters: { ...(state.filters || {}), [key]: value },
    });

  const resetFilters = () =>
    ctx.updateEntityState(entityName, { filters: {} });

  return {
    entityName,

    currentId: state.currentId,
    setCurrentId,

    viewMode: state.viewMode,
    setViewMode,

    tab: state.tab,
    setTab,

    filters: state.filters || {},
    setFilters,
    setFilter,
    resetFilters,
  };
};
