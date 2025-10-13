import { useEffect, useMemo, useState } from 'react';
import { getAggregatedValues } from '../utils';

const extractSortModel = (overrides = []) =>
  overrides
    .map(o => (o?.sort?.direction ? { field: o.field, direction: o.sort.direction } : null))
    .filter(Boolean);

// ZAMIANA / UZUPEŁNIENIE: na końcu mergeColumns
const mergeColumns = (auto, user) => {
  const map = new Map();
  auto?.forEach((col) => map.set(col.field, { ...col }));
  user?.forEach((u) => map.set(u.field, { ...map.get(u.field), ...u }));

  const merged = Array.from(map.values());

  if (user && user.length) {
    const orderMap = new Map(
      user.map((u, idx) => [u.field, Number.isFinite(u?.order) ? u.order : idx])
    );

    merged.sort((a, b) => {
      const ao = orderMap.has(a.field) ? orderMap.get(a.field) : Number.MAX_SAFE_INTEGER;
      const bo = orderMap.has(b.field) ? orderMap.get(b.field) : Number.MAX_SAFE_INTEGER;

      if (ao !== bo) return ao - bo;

      const ai = auto ? auto.findIndex((c) => c.field === a.field) : 0;
      const bi = auto ? auto.findIndex((c) => c.field === b.field) : 0;
      return ai - bi;
    });
  }

  // 🔑 normalizacja: po finalnym ułożeniu przypisz order = aktualny index
  return merged.map((c, idx) => ({ ...c, order: idx }));
};

const reindexGroupBy = (columns) => {
  const grouped = columns
    .filter(col => col.groupBy)
    .sort((a, b) => (a.groupIndex ?? Infinity) - (b.groupIndex ?? Infinity));

  return columns.map(col => {
    if (!col.groupBy) return { ...col, groupIndex: null };
    const newIndex = grouped.findIndex(g => g.field === col.field);
    return { ...col, groupIndex: newIndex };
  });
};

const applyDefaultAlign = (col) => {
  if (col.align) return col;
  let align = 'left';
  if (col.type === 'number') align = 'right';
  else if (col.type === 'boolean') align = 'center';
  return { ...col, align };
};


// pomocniczo: lekki podpis po polach (stabilne deps w useEffect)
const fieldsSig = (cols = []) =>
  cols.map(c => c.field).sort().join('|');

const useColumns = ({ autoColumns, devSchema = [], presets, entityName = 'default' }) => {
  const [columns, setColumns] = useState([]);
  const [sortModel, setSortModelState] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');

  // ---- podpisy do deps (tanie porównanie) ----
  const autoSig = useMemo(() => fieldsSig(autoColumns), [autoColumns]);
  const devSig = useMemo(() => fieldsSig(devSchema), [devSchema]);
  const savedCols = presets?.effective?.columns || [];
  const savedSig = useMemo(() => fieldsSig(savedCols), [savedCols]);
  const activeName = presets?.activeName;

  // ---- inicjalizacja / re-inicjalizacja, gdy mamy dane albo zmienił się preset/dev ----
  useEffect(() => {
    const base = mergeColumns(autoColumns, devSchema);
    console.log(base);
    if (savedCols.length > 0) {
      let restored = mergeColumns(base, savedCols); // tu już sort + order w środku
      restored = reindexGroupBy(restored);
      // (opcjonalnie) jeśli chcesz mieć pewność, że order jest ciągły + default align
      restored = restored.map((c, idx) => applyDefaultAlign({ ...c, order: idx }));
      setColumns(restored);

      const initialSort = extractSortModel(savedCols);
      setSortModelState(initialSort.length ? initialSort : []);
    } else {
      let restored = reindexGroupBy(base);
      restored = restored.map((c, idx) => ({ ...c, order: idx })); // 🔑
      setColumns(restored);
      setSortModelState([]);
    }
  }, [entityName, autoSig, devSig, savedSig, activeName]);

  // ---- helpers ----
  const updateField = (field, changes) => {
    setColumns(prev =>
      prev.map(col => (col.field === field ? { ...col, ...changes } : col))
    );
  };

  const getColumnByField = (field) => columns.find(col => col.field === field);

  const setAllVisible = (visible = true) => {
    setColumns(prev => prev.map(col => ({ ...col, hidden: !visible })));
  };

  const toggleColumnHidden = (field) => {
    setColumns(prev => {
      const col = prev.find(c => c.field === field);
      if (!col) return prev;

      const updated = { hidden: !col.hidden };
      let next = prev.map(c => (c.field === field ? { ...c, ...updated } : c));

      // jeżeli chowamy kolumnę grupującą → zdejmij groupBy i przereindeksuj
      if (updated.hidden && col.groupBy) {
        next = next.map(c =>
          c.field === field ? { ...c, groupBy: false, groupIndex: null } : c
        );
        next = reindexGroupBy(next);
      }
      return next;
    });
  };

  const reorderColumn = (fromIndex, toIndex) => {
    setColumns((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      // 🔑 po zmianie kolejności aktualizujemy order
      return updated.map((c, idx) => ({ ...c, order: idx }));
    });
  };

  // ---- sort ----
  const toggleSort = (field, direction) => {
    setSortModelState(prev => {
      const existing = prev.find(s => s.field === field);
      return existing
        ? prev.map(s => (s.field === field ? { ...s, direction } : s))
        : [...prev, { field, direction }];
    });
  };
  const removeSort = (field) => setSortModelState(prev => prev.filter(s => s.field !== field));
  const clearSort = () => setSortModelState([]);
  // ---- header name ----
  const setHeaderName = (field, val) => updateField(field, { headerName: val });
  // ---- group label ----
  const setGroupName = (field, val) => updateField(field, { fieldGroup: val });
  
  const getAllGroups = () => {
    const groups = new Set();
    columns.forEach(c => {
      if (c.fieldGroup && String(c.fieldGroup).trim() !== '') {
        groups.add(c.fieldGroup.trim());
      }
    });
    return Array.from(groups).sort();
  };

  const toggleGroupVisibility = (groupName, visible = null) => {
    setColumns(prev => {
      const groupCols = prev.filter(c => c.fieldGroup === groupName);
      if (groupCols.length === 0) return prev;

      const allVisible = groupCols.every(c => !c.hidden);
      const shouldHide = visible === null ? allVisible : !visible;

      return prev.map(c =>
        c.fieldGroup === groupName
          ? { ...c, hidden: shouldHide }
          : c
      );
    });
  };

  // ---- aggregation ----
  const setFormatterKey = (field, fn) => updateField(field, { formatterKey: fn });
  const setAggregation = (field, fn) => updateField(field, { aggregationFn: fn });
  const removeAggregation = (field) => updateField(field, { aggregationFn: undefined });
  const clearAggregation = () => setColumns(prev =>
    prev.map(col => (col.aggregationFn ? { ...col, aggregationFn: undefined } : col))
  );

  // ---- grouping ----
  const toggleGroupBy = (field) => {
    setColumns(prev => {
      const col = prev.find(c => c.field === field);
      if (!col) return prev;
      const updated = prev.map(c =>
        c.field === field ? { ...c, groupBy: !col.groupBy } : c
      );
      return reindexGroupBy(updated);
    });
  };

  // ---- FILTERS ----
  const getFilters = (field) => {
    const col = columns.find(c => c.field === field);
    return col?.filters || [];
  };

  const setFilters = (field, filters) => {
    updateField(field, { filters });
  };

  const addFilter = (field, filter) => {
    setColumns(prev =>
      prev.map(col =>
        col.field === field
          ? { ...col, filters: [...(col.filters || []), filter] }
          : col
      )
    );
  };

  const removeFilter = (field, id) => {
    console.log(field, id);
    setColumns(prev =>
      prev.map(col =>
        col.field === field
          ? {
            ...col,
            filters: (col.filters || []).filter(f => f.id !== id),
          }
          : col
      )
    );
  };

  const clearFilters = (field) => {
    updateField(field, { filters: [] });
  };

  const hasAnyFilters = () => {
    return columns.some(c => Array.isArray(c.filters) && c.filters.length > 0);
  };

  // Zwróć listę wszystkich filtrów (np. do panelu aktywnych filtrów)
  const getAllFilters = () => {
    return columns.flatMap(c =>
      (c.filters || []).map((f) => ({
        headerName: c.headerName || c.field,
        filter: f,
      }))
    );
  };

  // Wyczyść wszystkie filtry ze wszystkich kolumn
  const clearAllFilters = () => {
    setColumns(prev =>
      prev.map(col => ({ ...col, filters: [] }))
    );
  };

  const clearGroupBy = () => {
    setColumns(prev =>
      prev.map(col => (col.groupBy ? { ...col, groupBy: false, groupIndex: null } : col))
    );
  };

  // ---- getters ----
  const getGroupedCols = () =>
    columns
      .filter(c => c.groupBy)
      .sort((a, b) => (a.groupIndex ?? Infinity) - (b.groupIndex ?? Infinity));

  const getGroupModel = () => getGroupedCols().map(c => c.field);

  const getVisibleColumns = () => columns.filter(col => !col.hidden);

  const getSortDirection = (field) =>
    sortModel.find(s => s.field === field)?.direction ?? null;

  const getGroupedColumns = () => {
    const groupFields = getGroupModel();
    const groupCols = groupFields.map(f => getColumnByField(f)).filter(Boolean);
    const restCols = columns.filter(c => !groupFields.includes(c.field) && !c.hidden);
    return [...groupCols, { field: '__expander', headerName: '' }, ...restCols];
  };

  const getAggregatedValuesForData = (data) =>
    getAggregatedValues(data, getVisibleColumns());

  //Checks
  const hasAggregation = (field) => !!columns.find(c => c.field === field)?.aggregationFn;
  const hasFormatter = (field) => !!columns.find(c => c.field === field)?.formatterKey;
  const hasFilters = (field) => {
    const col = columns.find(c => c.field === field);
    return Array.isArray(col?.filters) && col.filters.length > 0;
  };

  return {
    columns,

    // Column
    getColumnByField,
    setColumnWidth: (field, width) => updateField(field, { width }),
    reorderColumn,
    setType: (field, type) => updateField(field, { type }),
    resetColumnState: () => {
      const base = mergeColumns(autoColumns, devSchema);
      setColumns(base);
    },
    toggleColumnHidden,
    setAllVisible,

    setHeaderName,
    //Field Group
    setGroupName,
    toggleGroupVisibility,
    getAllGroups,
    //formatter
    setFormatterKey,
    // Filters
    globalSearch,
    setGlobalSearch,
    getFilters,
    setFilters,
    addFilter,
    removeFilter,
    clearFilters,
    // ... (global tools)
    hasAnyFilters,
    getAllFilters,
    clearAllFilters,

    // Sorting
    sortModel,
    setSortModel: setSortModelState,
    toggleSort,
    removeSort,
    clearSort,

    // Aggregation
    aggregationModel: columns
      .filter(c => !!c.aggregationFn)
      .map(c => ({ field: c.field, fn: c.aggregationFn })),
    setAggregation,
    removeAggregation,
    setAggregationFn: (field, fn) => updateField(field, { aggregationFn: fn }),
    clearAggregation,

    // Grouping
    toggleGroupBy,
    clearGroupBy,
    getGroupedCols,
    groupModel: getGroupModel(),

    // Getters
    getVisibleColumns,
    getGroupedColumns,
    getSortDirection,
    getAggregatedValues: getAggregatedValuesForData,
    hasAggregation,
    hasFormatter,
    hasFilters,
    updateField
  };
};

export default useColumns;
