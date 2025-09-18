import { useEffect, useState } from 'react';

const makeStorageKey = (entity) => `powerTable_presets__${entity}`;

const useColumnsPresets = (entityName, defaultColumns = []) => {
  const [presets, setPresets] = useState({});
  const [currentPresetName, setCurrentPresetName] = useState('default');
  const [buffer, setBuffer] = useState([]);
  const [dirty, setDirty] = useState(false);

  const key = makeStorageKey(entityName);

  // INIT – load from LS
  useEffect(() => {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};

    const defaultPreset = {
      columns: defaultColumns,
      description: 'Wygenerowany automatycznie'
    };

    setPresets({ default: defaultPreset, ...parsed });
    setCurrentPresetName('default');
    setBuffer(defaultColumns);
  }, [entityName]);

  // Save presets to LS
  useEffect(() => {
    const toSave = { ...presets };
    delete toSave.default;
    localStorage.setItem(key, JSON.stringify(toSave));
  }, [presets]);

  const loadPreset = (name) => {
    const preset = presets[name];
    if (!preset) return;
    setCurrentPresetName(name);
    setBuffer(preset.columns || []);
    setDirty(false);
  };

  const savePreset = (name, content = null) => {
    const newPresets = {
      ...presets,
      [name]: {
        ...presets[name],
        columns: content || buffer,
      }
    };
    setPresets(newPresets);
    setCurrentPresetName(name);
    setDirty(false);
  };

  const deletePreset = (name) => {
    if (name === 'default') return;
    const copy = { ...presets };
    delete copy[name];
    setPresets(copy);
    setCurrentPresetName('default');
    setBuffer(presets['default']?.columns || []);
    setDirty(false);
  };

  const renamePreset = (oldName, newName) => {
    if (oldName === newName || !presets[oldName]) return;
    const copy = { ...presets };
    copy[newName] = copy[oldName];
    delete copy[oldName];
    setPresets(copy);
    setCurrentPresetName(newName);
  };

  const setCurrentColumns = (cols) => {
    setBuffer(cols);
    setDirty(true);
  };

  const resetChanges = () => {
    const preset = presets[currentPresetName];
    setBuffer(preset?.columns || []);
    setDirty(false);
  };

  return {
    presets,
    currentPresetName,
    currentPreset: presets[currentPresetName],
    buffer,
    loadPreset,
    savePreset,
    deletePreset,
    renamePreset,
    setCurrentColumns,
    resetChanges,
    dirty,
  };
};

export default useColumnsPresets;
