import React from 'react';
import DisplayCell from './cell/displayCell';
import EditCell from './cell/editCell';

/**
 * PowerTableCell – kontroler renderowania komórki.
 * Decyduje, czy renderować tryb wyświetlania, czy edycji.
 */
const PowerTableCell = ({
  value,
  column,
  settings,
  params,
  editing, // obiekt z hooka useTableEditing()
}) => {

  const { startEdit, stopEdit, isEditing, commitEdit } = editing || {};
  const isEditMode = isEditing ? isEditing(params) : false;

  /** Kliknięcie 2× = wejście w edycję */
  const handleDoubleClick = () => {
    console.log('Edytuj', editing, column);
    const editable =
      typeof column.editable === 'function'
        ? column.editable(params)
        : column.editable;

    if (editable && typeof startEdit === 'function') startEdit(params);
  };

  /** Commit z EditCell */
  const handleCommit = (newValue, cellParams) => {
    if (typeof commitEdit === 'function')
      commitEdit(newValue, cellParams, (id, field, val) => {
        console.log('commit', id, field, val);
      });
  };

  /** Obsługa anulowania */
  const handleCancel = () => {
    if (typeof stopEdit === 'function') stopEdit();
  };

  return isEditMode ? (
    <EditCell
      type={column.inputType}
      value={value}
      onCommit={handleCommit}
      onCancel={handleCancel}
      column={column}
      params={params}
    />
  ) : (
    <DisplayCell
      value={value}
      column={column}
      settings={settings}
      params={params}
      onDoubleClick={handleDoubleClick}
    />
  );
};

export default PowerTableCell;
