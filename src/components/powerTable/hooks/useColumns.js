import { useEffect, useMemo, useState } from 'react';
import { getAggregatedValues } from '../utils';

const extractSortModel = (overrides = []) =>
  overrides
    .map(o => (o?.sort?.direction ? { field: o.field, direction: o.sort.direction } : null))
    .filter(Boolean);

const applyOverrides = (map, overrides = [], { allowCreate = true } = {}) => {
  overrides.forEach(o => {
    if (!o?.field) return;

    const existing = map.get(o.field);

    // dla stored: pomijamy nieznane pola
    if (!existing && !allowCreate) return;

    const base = existing || {};
    const merged = { ...base, ...o };

    // zachowaj input jeśli override nie dostarcza wartości
    if (base.input && o.input === undefined) {
      merged.input = base.input;
    }

    // zachowaj options jeśli override nie dostarcza listy (lub dał pustą)
    if (
      (merged.options === null || merged.options === undefined ||
        (Array.isArray(merged.options) && merged.options.length === 0)) &&
      Array.isArray(base.options) && base.options.length > 0
    ) {
      merged.options = base.options;
    }

    // zachowaj renderCell, styleFn, formatterKey/formatterOptions, aggregationFn itp.
    if (!merged.renderCell && base.renderCell) merged.renderCell = base.renderCell;
    if (!merged.styleFn && base.styleFn) merged.styleFn = base.styleFn;

    if (
      (merged.formatterOptions == null ||
        (typeof merged.formatterOptions === 'object' &&
          Object.keys(merged.formatterOptions || {}).length === 0)) &&
      base.formatterOptions
    ) {
      merged.formatterOptions = base.formatterOptions;
    }

    if ((merged.formatterKey == null || merged.formatterKey === '') && base.formatterKey) {
      merged.formatterKey = base.formatterKey;
    }

    if ((merged.aggregationFn == null || merged.aggregationFn === '') && base.aggregationFn) {
      merged.aggregationFn = base.aggregationFn;
    }

    map.set(o.field, merged);
  });
};

const mergeColumns = ({ auto = [], dev = [], base = [], stored = [], actions = [] }) => {
  const map = new Map();

  // 1️⃣ Wybieramy zestaw bazowy:
  // - jeżeli podane jest base → to jest nasz punkt wyjścia (drugi bieg)
  // - w przeciwnym razie auto → pierwszy bieg
  const initial = (base && base.length > 0) ? base : auto;

  initial?.forEach(col => map.set(col.field, { ...col }));

  // 2️⃣ dev: override + *może dodawać nowe kolumny*
  applyOverrides(map, dev, { allowCreate: true });

  // 3️⃣ stored: override tylko istniejących (preset nie wprowadza nowych pól)
  applyOverrides(map, stored, { allowCreate: false });

  // 4️⃣ Wyliczamy aktualną maksymalną wartość order w zbiorze
  const currentMaxOrder = Math.max(
    0,
    ...Array.from(map.values()).map((c) =>
      Number.isFinite(c.order) ? c.order : 0
    )
  );

  // 5️⃣ Wstawiamy kolumny akcji (unikalne i z nowym offsetem)
  if (Array.isArray(actions) && actions.length > 0) {
    actions.forEach((a, idx) => {
      if (!map.has(a.field)) {
        map.set(a.field, {
          ...a,
          order: currentMaxOrder + idx + 1,
        });
      }
    });
  }

  // 6️⃣ Lista + sort po order
  const merged = Array.from(map.values());
  merged.sort((a, b) => {
    const ao = Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER;
    const bo = Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER;
    return ao - bo;
  });

  // 7️⃣ Ciągłe indeksy 0..N
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

const useColumns = ({ autoColumns, devSchema = [], presets, entityName = 'default', columnActions = [], enableEdit = true, schemaVersion }) => {
  const [columns, setColumns] = useState([]);
  const [sortModel, setSortModelState] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSelected, setShowSelected] = useState(false);

  // ---- podpisy do deps (tanie porównanie) ----
  const autoSig = useMemo(() => fieldsSig(autoColumns), [autoColumns]);
  const devSig = useMemo(() => fieldsSig(devSchema), [devSchema]);
  const savedCols = presets?.effective?.columns || [];
  const savedSig = useMemo(() => fieldsSig(savedCols), [savedCols]);
  const activeName = presets?.activeName;

  useEffect(() => {
    let base = mergeColumns({
      auto: autoColumns,
      dev: devSchema,
      actions: columnActions,
    });

    // === 🔹 Dodajemy kolumny akcji tylko, jeśli nie ma zapisanych presetów ===
    const hasSaved = savedCols.length > 0;

    let restored;
    if (hasSaved) {
      restored = mergeColumns({
        base,           // wynik pierwszego biegu
        stored: savedCols,
        // actions: opcjonalnie, jak chcesz dorzucać kolumny akcji też po presiecie
      });
    } else {
      restored = base;
    }

    restored = reindexGroupBy(restored);
    restored = restored.map((c, idx) =>
      applyDefaultAlign({ ...c, order: idx })
    );

    setColumns(restored);

    const initialSort = hasSaved ? extractSortModel(savedCols) : [];
    setSortModelState(initialSort);
  }, [entityName, autoSig, devSig, savedSig, activeName, schemaVersion]);



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
    console.log(field,filter);
    setColumns(prev =>
      prev.map(col =>
        col.field === field
          ? { ...col, filters: [...(col.filters || []), filter] }
          : col
      )
    );
  };

  const removeFilter = (field, id) => {
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
      const base = mergeColumns({
        auto: autoColumns,
        dev: devSchema,
        actions: columnActions,
      });
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
    showSelected,
    setShowSelected,
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
