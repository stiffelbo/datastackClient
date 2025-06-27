/**
 * Hook zarządzający presetami widoku.
 * - Na razie działa tylko lokalnie (w pamięci), potem dodamy persist (API).
 * - Zwraca aktualny preset, listę presetów oraz akcje: apply, save, delete.
 */
import { useState } from 'react';

export const useCrudPresets = (entity) => {
  const [presets, setPresets] = useState([]);
  const [currentPreset, setCurrentPreset] = useState(null);

  const applyPreset = (preset) => {
    setCurrentPreset(preset);
    // TODO: aktualizacja widoku CRUD zgodnie z presetem
  };

  const savePreset = (preset) => {
    setPresets(prev => [...prev, preset]);
  };

  const deletePreset = (id) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  return {
    presets,
    currentPreset,
    applyPreset,
    savePreset,
    deletePreset,
  };
};
