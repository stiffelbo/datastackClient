import { useContext } from "react";

import { FiltersContext } from "../context/FiltersContext";

export const useFilters = (entity) => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within FiltersProvider");
  }

  if (!entity) {
    return {
      filters: {},
      setFilters: () => {},
      clearFilters: () => {},
    };
  }

  const { filters, dispatch } = context;

  return {
    filters: filters[entity] || {},
    setFilters: (payload) => dispatch({ type: "SET_FILTERS", entity, payload }),
    clearFilters: () => dispatch({ type: "CLEAR_FILTERS", entity }),
  };
};