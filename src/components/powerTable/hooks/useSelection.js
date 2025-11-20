import { useState } from "react";
import { createSelectionColumns } from "./useAutoColumns";

/* -------------------------------------------------------------------------- */
/* 🔹 useSelection – notify parent on single/multi select changes             */
/* -------------------------------------------------------------------------- */
export const useSelection = ({
  onDelete,
  onBulkDelete,
  onBulkEdit,

  selected,           // initial single id (uncontrolled)
  onSelect,               // (nextSelected, meta) => void
}) => {
  /* local state seeded from props; stays source of truth in this hook */
  const [selectedIds, setSelectedIds] = useState([]);
  /* ---------------------------------------------------------------------- */
  /* 🔸 Single select                                                       */
  /* ---------------------------------------------------------------------- */
  const toggleSelect = (id) => {
    if(typeof onSelect === 'function'){
      if(id !== selected){
        onSelect(id);
      }else{
        onSelect(null);
      }
    }    
  };

  const clearSelect =() => {
    if(typeof onSelect === 'function'){
      onSelect(null);
    }  
  }

  /* ---------------------------------------------------------------------- */
  /* 🔹 Multi select                                                        */
  /* ---------------------------------------------------------------------- */
  const toggleMultiSelect = (idOrIds) => {
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
  }

  const clearMultiSelect = () => {
    setSelectedIds(prev => {
      if (!prev.length) return prev;
      return [];
    });
  }

  const addManyToMultiSelect = (ids = []) => {
    if (!Array.isArray(ids) || !ids.length) return;
    let nextRef;
    setSelectedIds(prev => {
      nextRef = Array.from(new Set([...prev, ...ids]));
      return nextRef;
    });
  }

  const removeManyFromMultiSelect = (ids = []) => {
    if (!Array.isArray(ids) || !ids.length) return;
    let nextRef;
    setSelectedIds(prev => {
      nextRef = prev.filter(id => !ids.includes(id));
      return nextRef;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 🗑️ Single DELETE helper (optional tidy-up of selections)               */
  /* ---------------------------------------------------------------------- */
  const deleteOne = (id) => {
    if (id === null || id === undefined) return;
    if (typeof onDelete !== "function") return;

    onDelete(id);

    // if the deleted one was selected, clear it & notify
    if (typeof onSelect === 'function' && selected === id) {
      onSelect(null);
    }

    // if the deleted one was in multi, remove it & notify
    let nextRef;
    setSelectedIds(prev => {
      if (!prev.includes(id)) return prev;
      nextRef = prev.filter(x => x !== id);
      return nextRef;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 🧱 Columns flags                                                       */
  /* ---------------------------------------------------------------------- */
  const isDeleteCol = typeof onDelete === 'function';
  const isSelectCol = typeof onSelect === 'function';
  const isSelectedItemsCol =
    typeof onBulkDelete === 'function' ||
    typeof onBulkEdit === 'function'

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
