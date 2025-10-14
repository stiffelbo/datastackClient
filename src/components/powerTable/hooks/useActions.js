import { useMemo, useState, useCallback } from "react";
import { createActionColumns } from "./useAutoColumns";


// 🔹 typy akcji renderowane jako kolumny
export const COLUMN_ACTIONS = ["delete", "select", "multiSelect"];

/* -------------------------------------------------------------------------- */
/* 🔹 KATALOG AKCJI WBUDOWANYCH                                              */
/* -------------------------------------------------------------------------- */
const BUILTIN_ACTIONS = {
  delete: { label: "Usuń", confirm: true },
  select: { label: "Wybierz", confirm: false },
  multiDelete: { label: "Usuń zaznaczone", confirm: true },
  multiSelect: { label: "Zaznacz", confirm: false },
};

/* -------------------------------------------------------------------------- */
/* 🔹 useActions – centralne API do obsługi akcji                            */
/* -------------------------------------------------------------------------- */
export const useActions = (actions = []) => {
  const [selected, setSelected] = useState(null);       // pojedynczy wybór
  const [selectedIds, setSelectedIds] = useState([]);   // multi-wybór

/* -------------------------------------------------------------------------- */
/* 🔹 GŁÓWNY HOOK                                                            */
/* -------------------------------------------------------------------------- */
 /* ---------------------------------------------------------------------- */
  /* ⚙️ Normalizacja akcji                                                  */
  /* ---------------------------------------------------------------------- */
  const normalized = useMemo(
    () =>
      actions.map((a) => ({
        ...BUILTIN_ACTIONS[a.type],
        ...a,
        id: a.type,
      })),
    [actions]
  );

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
  /* 🚀 Executor – bezpieczne wywołanie akcji                               */
  /* ---------------------------------------------------------------------- */
  const exec = useCallback(
    (type, params = {}, scope = "body") => {
      const action = normalized.find((a) => a.type === type);
      if (!action) return;

      const ctx = {
        type,
        scope,
        id: params?.id ?? null,
        row: params?.row ?? null,
        selected,
        selectedIds,
      };

      // confirm (jeśli potrzebny)
      if (action.confirm && !window.confirm(`Potwierdź: ${action.label}`)) return;

      switch (type) {
        /* --- SINGLE SELECT --- */
        case "select":
          toggleSelect(ctx.id);
          action.handler?.(ctx);
          break;

        /* --- MULTI SELECT --- */
        case "multiSelect":
          if (scope === "group") {
            toggleMultiSelect(params.ids || []);
          } else {
            toggleMultiSelect(ctx.id);
          }
          action.handler?.(ctx);
          break;

        /* --- DELETE --- */
        case "delete":
          action.handler?.(ctx);
          break;

        /* --- MULTI DELETE --- */
        case "multiDelete":
          if (selectedIds.length && typeof action.handler === "function") {
            action.handler(ctx);
            clearMultiSelect();
          }
          break;

        default:
          action.handler?.(ctx);
      }
    },
    [normalized, selected, selectedIds, toggleSelect, toggleMultiSelect, clearMultiSelect]
  );

  /* ---------------------------------------------------------------------- */
  /* 🧱 GENEROWANIE KOLUMN AKCJI                                            */
  /* ---------------------------------------------------------------------- */
  const columnActions = useMemo(
    () => createActionColumns(normalized, exec, COLUMN_ACTIONS),
    [normalized, exec]
  );

  /* ---------------------------------------------------------------------- */
  /* 🧾 RETURN API                                                          */
  /* ---------------------------------------------------------------------- */
  return {
    actions: normalized,
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

    // 🔹 Executor
    exec,
  };
};
