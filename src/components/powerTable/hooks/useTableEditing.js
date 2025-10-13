import { useState, useCallback } from "react";

/**
 * useTableEditing - zarządza stanem edycji komórek w PowerTable
 *
 * @param {Function} [onCommit] - opcjonalny handler: (value, params) => void | Promise
 */
export const useTableEditing = (onCommit) => {
  const [editingCell, setEditingCell] = useState(null);
  // editingCell = { id, field }

  /** 🔹 Sprawdza, czy dana komórka jest edytowana */
  const isEditing = useCallback(
    (params) =>
      editingCell?.id === params.id && editingCell?.field === params.field,
    [editingCell]
  );

  /** 🔹 Rozpocznij edycję komórki */
  const startEdit = useCallback((params) => {
    setEditingCell({ id: params.id, field: params.field });
  }, []);

  /** 🔹 Zakończ edycję */
  const stopEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  /** 🔹 Zatwierdź wartość */
  const commitEdit = useCallback(
    async (newValue, params) => {
      if (typeof onCommit === "function") {
        try {
          await onCommit(newValue, params);
        } catch (err) {
          console.warn("Edit commit failed:", err);
        }
      } else {
        // brak handlera → log pasywny (lub no-op)
        console.debug("useTableEditing: commit ignored (no handler)");
      }
      setEditingCell(null);
    },
    [onCommit]
  );

  /** 🔹 API hooka */
  return {
    startEdit,
    stopEdit,
    commitEdit,
    isEditing,
    editingCell,
  };
};

export default useTableEditing;
