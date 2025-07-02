import { useEffect, useState } from 'react';

import { getAggregatedValues } from '../utils';

const getStorageKey = (entityName) => `powerTable_columns__${entityName}`;

const mergeColumns = (auto, user) => {
  const map = new Map();
  auto && auto.forEach((col) => map.set(col.field, { ...col }));
  user && user.forEach((col) => map.set(col.field, { ...map.get(col.field), ...col }));
  return Array.from(map.values());
};

const reindexGroupBy = (columns) => {
  const grouped = columns
    .filter(col => col.groupBy)
    .sort((a, b) => {
      const aIndex = a.groupIndex ?? Infinity;
      const bIndex = b.groupIndex ?? Infinity;
      return aIndex - bIndex;
    });

  return columns.map(col => {
    if (!col.groupBy) return { ...col, groupIndex: null };

    const newIndex = grouped.findIndex(g => g.field === col.field);
    return { ...col, groupIndex: newIndex };
  });
};


const useColumnSchema = (autoColumns, userSchema = [], entityName = 'default') => {
  const storageKey = getStorageKey(entityName);
  const [columns, setColumns] = useState([]);
  const [sortModel, setSortModelState] = useState([]);

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

  const toggleColumnHidden = (field) => {
    const col = columns.find((c) => c.field === field);
    if (!col) return;

    if (!col.hidden) {
      // Chowamy — usuń powiązane stany
      const updated = { hidden: true };
      if (col.groupBy) {
        updated.groupBy = false;
        updated.groupIndex = null;
        const reindexed = reindexGroupBy(
          columns.map(c =>
            c.field === field ? { ...c, ...updated } : c
          )
        );
        setColumns(reindexed); //to już updateuje pole
      } else {
        updateField(field, updated);
      }
    } else {
      // Pokazujemy — tylko update hidden, nic poza tym nie trzeba robić.
      updateField(field, { hidden: false });
    }
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
    updateField(field, { aggregationFn: fn });
  };

  const removeAggregation = (field) => {
    updateField(field, { aggregationFn: undefined });
  };

  const clearAggregation = () => {
    setColumns(prev =>
      prev.map(col => col.aggregationFn ? { ...col, aggregationFn: undefined } : col)
    );
  };

  const toggleGroupBy = (field) => {
    const col = columns.find(c => c.field === field);
    if (!col) return;

    if (col.groupBy) {
      const updated = columns.map(c =>
        c.field === field
          ? { ...c, groupBy: false, groupIndex: null }
          : c
      );
      setColumns(reindexGroupBy(updated));
    } else {
      const updated = columns.map(c =>
        c.field === field
          ? { ...c, groupBy: true } // groupIndex zostanie nadany automatycznie
          : c
      );
      setColumns(reindexGroupBy(updated));
    }
  };

  const clearGroupBy = () => {
    setColumns(prev =>
      prev.map(col => col.groupBy ? { ...col, groupBy: false, groupIndex: null } : col)
    );
  };

  const getGroupedCols = () => {
    return columns.filter(c => c.groupBy).sort((a, b) => {
      const aIndex = a.groupIndex ?? Infinity;
      const bIndex = b.groupIndex ?? Infinity;
      return aIndex - bIndex;
    });
  };

  const getGroupModel = () => getGroupedCols().map(c => c.field);

  //Getters
  const getVisibleColumns = () => columns.filter((col) => !col.hidden);

  const getSortDirection = (field) =>
    sortModel.find((s) => s.field === field)?.direction ?? null;


  const getGroupedColumns = () => {
    const groupCols = groupModel.map(field => getColumnByField(field)).filter(Boolean);
    const restCols = columns.filter(c => !groupModel.includes(c.field) && !c.hidden);
    return [...groupCols, { field: '__expander', headerName: '' }, ...restCols];
  }

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
    toggleColumnHidden,
    setAllVisible,
    //Sorting
    sortModel,
    setSortModel: setSortModelState,
    toggleSort,
    removeSort,
    clearSort,

    //Agregation
    aggregationModel: columns
      .filter(c => !!c.aggregationFn)
      .map(c => ({ field: c.field, fn: c.aggregationFn })),
    setAggregation,
    removeAggregation,
    setAggregationFn: (field, fn) => {
      const col = columns.find(c => c.field === field)
      updateField(field, { aggregationFn: fn });
    },
    clearAggregation,
    //Grouping
    toggleGroupBy,
    clearGroupBy,
    getGroupedCols,
    groupModel : getGroupModel(),
    //Getters
    getVisibleColumns,
    getGroupedColumns,
    getSortDirection,
    getAggregatedValues: getAggregatedValuesForData,
  };
};

export default useColumnSchema;
