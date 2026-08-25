import React from 'react';

import DisplayCell from './cell/displayCell';
import EditCell from './cell/editCell';
import ActionCell from './cell/actionCell';

const PowerTableCell = ({
  value,
  column,
  columnSchema,
  settings = {},
  params,
  editing,
  parent = 'body',
  actionsApi = {}
}) => {
  const { startEdit, stopEdit, isEditing, commitEdit } = editing || {};

  const isEditMode = isEditing ? isEditing(params) : false;

  const isVirtualized = !!settings.isVirtualized;

  const rowHeight =
    isVirtualized && settings.rowHeight
      ? Number(settings.rowHeight)
      : null;

  const cellSettings = {
    ...settings,

    isVirtualized,
    rowHeight,

    // przy absolute/flex rows
    virtualFlex: !!settings.virtualFlex,

    // geometria kolumny dostępna w każdym cell rendererze
    columnWidth: column?.width,
    columnMinWidth: column?.minWidth,
    columnMaxWidth: column?.maxWidth,
  };

  const handleDoubleClick = () => {
    const editable =
      typeof column.editable === 'function'
        ? column.editable(params)
        : column.editable;

    if (
      editable &&
      typeof startEdit === 'function'
    ) {
      startEdit(params);
    }
  };

  const handleCommit = (newValue, cellParams) => {
    if (typeof commitEdit === 'function') {
      commitEdit(newValue, cellParams);
    }
  };

  const handleCancel = () => {
    if (typeof stopEdit === 'function') {
      stopEdit();
    }
  };

  if (column.type === 'action') {
    return (
      <ActionCell
        column={column}
        columnSchema={columnSchema}
        params={params || {}}
        parent={parent}
        actionsApi={actionsApi}
        settings={cellSettings}
      />
    );
  }

  if (isEditMode) {
    return (
      <EditCell
        value={value}
        onCommit={handleCommit}
        onCancel={handleCancel}
        settings={cellSettings}
        column={column}
        params={params}
        parent={parent}
      />
    );
  }

  return (
    <DisplayCell
      value={value}
      column={column}
      settings={cellSettings}
      params={params}
      onDoubleClick={handleDoubleClick}
      parent={parent}
      editing={editing}
    />
  );
};

export default PowerTableCell;