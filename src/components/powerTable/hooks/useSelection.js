import { useState, useCallback, useEffect } from "react";
import { createSelectionColumns } from "./useAutoColumns";

/* -------------------------------------------------------------------------- */
/* 🔹 useSelection – notify parent on single/multi select changes             */
/* -------------------------------------------------------------------------- */
export const useSelection = ({
  onDelete,
  onBulkDelete,
  onBulkEdit,

  selectedInit,           // initial single id (uncontrolled)
  onSelect,               // (nextSelected, meta) => void

  selectedItems = [],     // initial multi ids (uncontrolled)
  onSelectItems,          // (nextIds, meta) => void
}) => {
  /* local state seeded from props; stays source of truth in this hook */
  const [selected, setSelected] = useState(selectedInit ?? null);
  const [selectedIds, setSelectedIds] = useState(Array.isArray(selectedItems) ? selectedItems : []);

  /* keep state in sync if parent changes initial values later */
  useEffect(() => {
    setSelected(selectedInit ?? null);
  }, [selectedInit]);

  useEffect(() => {
    setSelectedIds(Array.isArray(selectedItems) ? selectedItems : []);
  }, [selectedItems]);

  /* ---------------------------------------------------------------------- */
  /* 🔸 Single select                                                       */
  /* ---------------------------------------------------------------------- */
  const toggleSelect = useCallback((id) => {
    if (id === null || id === undefined) return; // allow id=0
    setSelected(prev => {
      const next = (prev === id ? null : id);
      onSelect?.(next, { reason: "toggleSelect", prev, next });
      return next;
    });
  }, [onSelect]);

  const clearSelect = useCallback(() => {
    setSelected(prev => {
      if (prev == null) return prev;
      const next = null;
      onSelect?.(next, { reason: "clearSelect", prev, next });
      return next;
    });
  }, [onSelect]);

  /* ---------------------------------------------------------------------- */
  /* 🔹 Multi select                                                        */
  /* ---------------------------------------------------------------------- */
  const toggleMultiSelect = useCallback((idOrIds) => {
    if (idOrIds === null || idOrIds === undefined) return;
    let nextRef;
    setSelectedIds(prev => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      const set = new Set(prev);
      ids.forEach(id => {
        if (id === null || id === undefined) return;
        set.has(id) ? set.delete(id) : set.add(id);
      });
      nextRef = Array.from(set);
      return nextRef;
    });
    onSelectItems?.(nextRef ?? [], { reason: "toggleMultiSelect", changed: Array.isArray(idOrIds) ? idOrIds : [idOrIds] });
  }, [onSelectItems]);

  const clearMultiSelect = useCallback(() => {
    setSelectedIds(prev => {
      if (!prev.length) return prev;
      onSelectItems?.([], { reason: "clearMultiSelect", prev });
      return [];
    });
  }, [onSelectItems]);

  const addManyToMultiSelect = useCallback((ids = []) => {
    if (!Array.isArray(ids) || !ids.length) return;
    let nextRef;
    setSelectedIds(prev => {
      nextRef = Array.from(new Set([...prev, ...ids]));
      return nextRef;
    });
    onSelectItems?.(nextRef, { reason: "addManyToMultiSelect", changed: ids });
  }, [onSelectItems]);

  const removeManyFromMultiSelect = useCallback((ids = []) => {
    if (!Array.isArray(ids) || !ids.length) return;
    let nextRef;
    setSelectedIds(prev => {
      nextRef = prev.filter(id => !ids.includes(id));
      return nextRef;
    });
    onSelectItems?.(nextRef, { reason: "removeManyFromMultiSelect", changed: ids });
  }, [onSelectItems]);

  /* ---------------------------------------------------------------------- */
  /* 🗑️ Single DELETE helper (optional tidy-up of selections)               */
  /* ---------------------------------------------------------------------- */
  const deleteOne = useCallback((id) => {
    if (id === null || id === undefined) return;
    if (typeof onDelete !== "function") return;

    onDelete(id);

    // if the deleted one was selected, clear it & notify
    setSelected(prev => {
      if (prev !== id) return prev;
      onSelect?.(null, { reason: "deleteOne.clearedSingle", removed: id });
      return null;
    });

    // if the deleted one was in multi, remove it & notify
    let nextRef;
    setSelectedIds(prev => {
      if (!prev.includes(id)) return prev;
      nextRef = prev.filter(x => x !== id);
      return nextRef;
    });
    if (nextRef) {
      onSelectItems?.(nextRef, { reason: "deleteOne.pruneMulti", removed: id });
    }
  }, [onDelete, onSelect, onSelectItems]);

  /* ---------------------------------------------------------------------- */
  /* 🧱 Columns flags                                                       */
  /* ---------------------------------------------------------------------- */
  const isDeleteCol = typeof onDelete === 'function';
  const isSelectCol = typeof onSelect === 'function';
  const isSelectedItemsCol =
    typeof onBulkDelete === 'function' ||
    typeof onBulkEdit === 'function' ||
    typeof onSelectItems === 'function';

  const columnActions = createSelectionColumns({ isDeleteCol, isSelectCol, isSelectedItemsCol });

  return {
    columnActions,

    // state
    selected,
    selectedIds,

    // single
    toggleSelect,
    clearSelect,

    // multi
    toggleMultiSelect,
    clearMultiSelect,
    addManyToMultiSelect,
    removeManyFromMultiSelect,

    // delete helper
    deleteOne,
  };
};
