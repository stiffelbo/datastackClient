import { useEffect, useState } from 'react';

import {getAggregatedValues} from '../utils';

const getStorageKey = (entityName) => `powerTable_columns__${entityName}`;

const mergeColumns = (auto, user) => {
  const map = new Map();
  auto && auto.forEach((col) => map.set(col.field, { ...col }));
  user && user.forEach((col) => map.set(col.field, { ...map.get(col.field), ...col }));
  return Array.from(map.values());
};

const useColumnSchema = (autoColumns, userSchema = [], entityName = 'default') => {
  const storageKey = getStorageKey(entityName);
  const [columns, setColumns] = useState([]);
  const [sortModel, setSortModelState] = useState([]);
  const [aggregationModel, setAggregationModelState] = useState([]);
  const [groupModel, setGroupModelState] = useState([]);

  useEffect(() => {
    const merged = mergeColumns(autoColumns, userSchema);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const restored = mergeColumns(merged, parsed);
        setColumns(restored);
        return;
      } catch { }
    }
    setColumns(merged);
  }, [storageKey]);

  useEffect(() => {
    if (columns.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(columns));
    }
  }, [columns, storageKey]);

  const updateField = (field, changes) => {
    setColumns((prev) =>
      prev.map((col) => (col.field === field ? { ...col, ...changes } : col))
    );
  };

  const getColumnByField = (field) => {
    return columns.find((col) => col.field === field);
  };

  const setAllVisible = (visible = true) => {
    setColumns(prev =>
      prev.map(col => ({ ...col, hidden: !visible }))
    );
  };

  const reorderColumn = (fromIndex, toIndex) => {
    setColumns((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const toggleSort = (field, direction) => {
    setSortModelState((prev) => {
      const existing = prev.find((s) => s.field === field);
      if (existing) {
        return prev.map((s) => s.field === field ? { ...s, direction } : s);
      } else {
        return [...prev, { field, direction }];
      }
    });
  };

  const removeSort = (field) => {
    setSortModelState((prev) => prev.filter((s) => s.field !== field));
  };

  const clearSort = () => setSortModelState([]);

  const setAggregation = (field, fn) => {
    setAggregationModelState((prev) => {
      const existing = prev.find((a) => a.field === field);
      if (existing) {
        return prev.map((a) => a.field === field ? { ...a, fn } : a);
      } else {
        return [...prev, { field, fn }];
      }
    });
    updateField(field, { aggregationFn: fn });
  };

  const removeAggregation = (field) => {
    setAggregationModelState((prev) => prev.filter((a) => a.field !== field));
    updateField(field, { aggregationFn: undefined });
  };

  const clearAggregation = () => {
    setAggregationModelState([]);
    setColumns(prev =>
      prev.map(col => col.aggregationFn ? { ...col, aggregationFn: undefined } : col)
    );
  };

  const toggleGroupBy = (field) => {
    setGroupModelState((prev) => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      } else {
        return [...prev, field];
      }
    });
    const col = columns.find((c) => c.field === field);
    if (col) updateField(field, { groupBy: !col.groupBy });
  };

  const clearGroupBy = () => {
    setColumns(prev =>
      prev.map(col => col.groupBy ? { ...col, groupBy: false } : col)
    );
    setGroupModelState([]);
  };

  //Getters
  const getVisibleColumns = () => columns.filter((col) => !col.hidden);

  const getSortDirection = (field) =>
    sortModel.find((s) => s.field === field)?.direction ?? null;

  const getGroupOrder = (field) => {
    const groupFields = columns.filter(c => c.groupBy);
    return groupFields.findIndex(c => c.field === field);
  };

  const getAggregatedValuesForData = (data) => {
    return getAggregatedValues(data, getVisibleColumns());
  };


  return {
    columns,
    //Column
    getColumnByField,
    setColumnWidth: (field, width) => {
      updateField(field, { width });
    },
    reorderColumn,
    setType: (field, type) => updateField(field, { type }),
    resetColumnState: () => {
      localStorage.removeItem(storageKey);
      const merged = mergeColumns(autoColumns, userSchema);
      setColumns(merged);
    },
    setAllVisible,
    //Sorting
    sortModel,
    setSortModel: setSortModelState,
    toggleSort,
    removeSort,
    clearSort,

    //Agregation
    aggregationModel,
    setAggregation,
    removeAggregation,
    setAggregationFn: (field, fn) => {
      const col = columns.find(c => c.field === field)
      updateField(field, { aggregationFn: fn });
    },
    clearAggregation,
    //Grouping
    groupModel,
    toggleGroupBy,
    toggleColumnHidden: (field) => {
      const col = columns.find((c) => c.field === field);
      if (col) updateField(field, { hidden: !col.hidden });
    },
    clearGroupBy,

    //Getters
    getVisibleColumns,
    getSortDirection,
    getGroupOrder,
    getAggregatedValues: getAggregatedValuesForData

  };
};

export default useColumnSchema;
