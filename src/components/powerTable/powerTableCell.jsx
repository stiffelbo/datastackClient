import React from 'react';

import DisplayCell from './cell/displayCell';
import EditCell from './cell/editCell';
import ActionCell from './cell/actionCell';

/**
 * PowerTableCell – kontroler renderowania komórki.
 * Decyduje, czy renderować tryb wyświetlania, czy edycji.
 */
const PowerTableCell = ({
  value,
  column,
  columnSchema,
  settings,
  params,
  editing, // obiekt z hooka useTableEditing()
  parent = 'body',
  actionsApi = {}
}) => {

  const { startEdit, stopEdit, isEditing, commitEdit } = editing || {};
  const isEditMode = isEditing ? isEditing(params) : false;

  /** Kliknięcie 2× = wejście w edycję */
  const handleDoubleClick = () => {
    const editable =
      typeof column.editable === 'function'
        ? column.editable(params)
        : column.editable;

    if (editable && typeof startEdit === 'function') startEdit(params);
  };

  /** Commit z EditCell */
  const handleCommit = (newValue, cellParams) => {
    if (typeof commitEdit === 'function')
      commitEdit(newValue, cellParams);
  };

  /** Obsługa anulowania */
  const handleCancel = () => {
    if (typeof stopEdit === 'function') stopEdit();
  };

  if (column.type === 'action') {
    return (
      <ActionCell
        column={column}
        columnSchema={columnSchema}
        params={params || {}}
        parent={parent}
        actionsApi={actionsApi}
      />
    );
  }else{
     return isEditMode ? (
      <EditCell
        type={column.type}
        value={value}
        onCommit={handleCommit}
        onCancel={handleCancel}
        column={column}
        params={params}
        parent={parent}
      />
    ) : (
      <DisplayCell
        value={value}
        column={column}
        settings={settings}
        params={params}
        onDoubleClick={handleDoubleClick}
        parent={parent}
      />
    );
  } 
};

export default PowerTableCell;
