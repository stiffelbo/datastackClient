import { useState, useEffect } from 'react';
import { getAggregatedValues } from '../utils';

const makeStorageKey = (entityName, presetName) =>
  `powerTable_columns__${entityName}__${presetName}`;

const getAllPresets = (entityName) => {
  const presets = {};
  for (let key in localStorage) {
    if (key.startsWith(`powerTable_columns__${entityName}__`)) {
      const presetName = key.split('__').slice(2).join('__');
      try {
        presets[presetName] = JSON.parse(localStorage.getItem(key));
      } catch { }
    }
  }
  return presets;
};

const savePresetToStorage = (entityName, presetName, columns) => {
  localStorage.setItem(makeStorageKey(entityName, presetName), JSON.stringify(columns));
};

const deletePresetFromStorage = (entityName, presetName) => {
  localStorage.removeItem(makeStorageKey(entityName, presetName));
};

const reindexGroupBy = (columns) => {
  const grouped = columns
    .filter((col) => col.groupBy)
    .sort((a, b) => (a.groupIndex ?? Infinity) - (b.groupIndex ?? Infinity));

  return columns.map((col) =>
    !col.groupBy
      ? { ...col, groupIndex: null }
      : { ...col, groupIndex: grouped.findIndex((g) => g.field === col.field) }
  );
};

const useColumnSchema = (autoColumns, entityName = 'default') => {
  const [presets, setPresets] = useState({});
  const [currentPresetName, setCurrentPresetName] = useState('Domyślny');
  const [buffer, setBuffer] = useState([]);
  const [sortModel, setSortModel] = useState([]);

  // Inicjalizacja presetów i bufora
  useEffect(() => {
    const allPresets = getAllPresets(entityName);
    const mergedDefault = autoColumns.map((col) => ({ ...col }));
    const loaded = allPresets[currentPresetName] || mergedDefault;

    setPresets({
      ...allPresets,
      ['Domyślny']: mergedDefault,
    });
    setBuffer(loaded);
  }, []);

  const updateField = (field, changes) => {
    setBuffer((prev) =>
      prev.map((col) => (col.field === field ? { ...col, ...changes } : col))
    );
  };

  const reorderColumn = (fromIndex, toIndex) => {
    setBuffer((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const toggleColumnHidden = (field) => {
    const col = buffer.find((c) => c.field === field);
    if (!col) return;

    const updated = { hidden: !col.hidden };
    if (col.groupBy && updated.hidden) {
      updated.groupBy = false;
      updated.groupIndex = null;
    }

    const updatedColumns = buffer.map((c) =>
      c.field === field ? { ...c, ...updated } : c
    );
    setBuffer(reindexGroupBy(updatedColumns));
  };

  const toggleGroupBy = (field) => {
    const col = buffer.find((c) => c.field === field);
    if (!col) return;

    const updated = buffer.map((c) =>
      c.field === field
        ? { ...c, groupBy: !col.groupBy }
        : c
    );

    setBuffer(reindexGroupBy(updated));
  };

  const getGroupedCols = () =>
    buffer.filter((c) => c.groupBy).sort((a, b) => (a.groupIndex ?? Infinity) - (b.groupIndex ?? Infinity));

  const getGroupModel = () => getGroupedCols().map((c) => c.field);

  const getColumnByField = (field) => buffer.find((col) => col.field === field);
  const getVisibleColumns = () => buffer.filter((col) => !col.hidden);

  const getSortDirection = (field) =>
    sortModel.find((s) => s.field === field)?.direction ?? null;

  const getGroupedColumns = () => {
    const groupCols = getGroupModel()
      .map((field) => getColumnByField(field))
      .filter(Boolean);
    const rest = buffer.filter((c) => !groupCols.includes(c) && !c.hidden);
    return [...groupCols, { field: '__expander' }, ...rest];
  };

  const savePreset = (name = currentPresetName) => {
    setPresets((prev) => ({
      ...prev,
      [name]: buffer,
    }));
    savePresetToStorage(entityName, name, buffer);
    setCurrentPresetName(name);
  };

  const editPresetName = (prev, val) => {
    if (!presets?.[prev]) return;

    // Bezpiecznik: jeśli nowa nazwa już istnieje, nie nadpisuj
    if (presets[val]) {
      console.warn(`[editPresetName] Preset '${val}' already exists.`);
      return;
    }

    const newPresets = { ...presets };
    newPresets[val] = { ...newPresets[prev] }; // kopia stanu
    delete newPresets[prev];

    setPresets(newPresets);
    setCurrentPresetName(val);
    setBuffer(newPresets[val]?.columns || []);
  };


  const deletePreset = (name) => {
    const newPresets = { ...presets };
    delete newPresets[name];
    setPresets(newPresets);
    deletePresetFromStorage(entityName, name);
    if (currentPresetName === name) {
      setCurrentPresetName('Domyślny');
      setBuffer(presets['Domyślny'] || []);
    }
  };

  const loadPreset = (name) => {
    const preset = presets[name];
    if (preset) {
      setBuffer(preset);
      setCurrentPresetName(name);
    }
  };

  const resetChanges = () => {
    const preset = presets[currentPresetName];
    if (preset) {
      setBuffer(preset);
    }
  };

  const dirty = JSON.stringify(buffer) !== JSON.stringify(presets[currentPresetName]);

  const getAggregatedValuesForData = (data) => {
    return getAggregatedValues(data, getVisibleColumns());
  };

  return {
    columns: buffer.length > 0 ? buffer : autoColumns,
    updateField,
    reorderColumn,
    toggleColumnHidden,
    toggleGroupBy,
    getGroupedCols,
    getGroupModel,
    getVisibleColumns,
    getColumnByField,
    getSortDirection,
    getGroupedColumns,
    getAggregatedValues: getAggregatedValuesForData,

    // Nowe / Przywrócone
    setColumnWidth: (field, val) => updateField(field, { width: val }),
    setType: (field, val) => updateField(field, { type: val }),
    setAggregation: (field, fn) => updateField(field, { aggregationFn: fn }),
    setAggregationFn: (field, fn) => updateField(field, { aggregationFn: fn }),
    removeAggregation: (field) => updateField(field, { aggregationFn: undefined }),
    clearAggregation: () =>
      setBuffer((prev) =>
        prev.map((col) => (col.aggregationFn ? { ...col, aggregationFn: undefined } : col))
      ),
    setAllVisible: (visible = true) =>
      setBuffer((prev) => prev.map((col) => ({ ...col, hidden: !visible }))),
    clearGroupBy: () =>
      setBuffer((prev) =>
        prev.map((col) =>
          col.groupBy ? { ...col, groupBy: false, groupIndex: null } : col
        )
      ),
    sortModel,
    setSortModel,
    toggleSort: (field, direction) => {
      setSortModel((prev) => {
        const existing = prev.find((s) => s.field === field);
        if (existing) {
          return prev.map((s) => (s.field === field ? { ...s, direction } : s));
        } else {
          return [...prev, { field, direction }];
        }
      });
    },
    removeSort: (field) => setSortModel((prev) => prev.filter((s) => s.field !== field)),
    clearSort: () => setSortModel([]),
  };
};

export default useColumnSchema;
