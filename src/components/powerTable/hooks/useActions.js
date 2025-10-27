import { useState, useCallback } from "react";
import { createActionColumns } from "./useAutoColumns";

/* -------------------------------------------------------------------------- */
/* 🔹 useActions – centralne API do obsługi akcji                            */
/* -------------------------------------------------------------------------- */
export const useActions = (actions = []) => {
  const [selected, setSelected] = useState(null);       // pojedynczy wybór
  const [selectedIds, setSelectedIds] = useState([]);   // multi-wybór

  /* ---------------------------------------------------------------------- */
  /* 🔸 Pojedynczy wybór (select)                                           */
  /* ---------------------------------------------------------------------- */
  const toggleSelect = useCallback((id) => {
    if (!id) return;
    setSelected((prev) => (prev === id ? null : id));
  }, []);

  const clearSelect = useCallback(() => setSelected(null), []);

  /* ---------------------------------------------------------------------- */
  /* 🔹 Multi-select (tablica id)                                           */
  /* ---------------------------------------------------------------------- */
  const toggleMultiSelect = useCallback((idOrIds) => {
    if (!idOrIds) return;
    setSelectedIds((prev) => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      const set = new Set(prev);
      ids.forEach((id) =>
        set.has(id) ? set.delete(id) : set.add(id)
      );
      return Array.from(set);
    });
  }, []);

  const clearMultiSelect = useCallback(() => setSelectedIds([]), []);

  const addManyToMultiSelect = useCallback((ids = []) => {
    if (!Array.isArray(ids) || !ids.length) return;
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  }, []);

  const removeManyFromMultiSelect = useCallback((ids = []) => {
    if (!Array.isArray(ids) || !ids.length) return;
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  }, []);
 
  /* ---------------------------------------------------------------------- */
  /* 🧱 GENEROWANIE KOLUMN AKCJI                                            */
  /* ---------------------------------------------------------------------- */
  const columnActions = createActionColumns(actions);

  /* ---------------------------------------------------------------------- */
  /* 🧾 RETURN API                                                          */
  /* ---------------------------------------------------------------------- */
  return {
    columnActions,

    // 🔹 Stan
    selected : selected,
    selectedIds: selectedIds,

    // 🔹 Single select
    toggleSelect,
    clearSelect,

    // 🔹 Multi select
    toggleMultiSelect,
    clearMultiSelect,
    addManyToMultiSelect,
    removeManyFromMultiSelect,
  };
};
