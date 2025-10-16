import { useMemo, useState, useCallback, useEffect } from "react";
import { createActionColumns } from "./useAutoColumns";


// 🔹 typy akcji renderowane jako kolumny
export const COLUMN_ACTIONS = ["select", "multiSelect"];

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

  useEffect(()=>{
    exec('select', selected);
  }, [selected])

  useEffect(()=>{
    exec('multiSelect', selectedIds);
  }, [selectedIds])

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
  /*  Delete                                                                */
  /* ---------------------------------------------------------------------- */

  const deleteOne = (id) => {
    exec('delete', id)
  }

  const deleteMany = () => {
    const count = selectedIds.length || 0;
      const msg = `Na pewno chcesz usunąć ${count} rekordów?`;

      if (!window.confirm(msg)) {
        return;
      }else{
          exec('multiDelete', selectedIds)
      }
  }


  /* ---------------------------------------------------------------------- */
  /* 🚀 Executor – bezpieczne wywołanie akcji                               */
  /* ---------------------------------------------------------------------- */
  const exec = useCallback(
    (type, value) => {
      const action = normalized.find((a) => a.type === type);
      if (!action) return;

      switch (type) {
        /* --- SINGLE SELECT --- */
        case "select":
        case "multiSelect":
        case "delete":
          if (typeof action.handler === "function") {
            action.handler(value);
          }
          break;

        /* --- MULTI DELETE --- */
        case "multiDelete":
          if (value.length && typeof action.handler === "function") {
            action.handler(value);
            clearMultiSelect();
          }
          break;

        default:
          return;
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

    // 🔹 Delete
    deleteOne,
    deleteMany,

    // 🔹 Executor
    exec,
  };
};
