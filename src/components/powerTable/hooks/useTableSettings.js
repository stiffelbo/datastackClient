import { useEffect, useState, useCallback } from 'react';

const defaultSettings = {
  rowHeight: 48,
  density: 'standard',
  background: 'auto',
};

const makeStorageKey = (entity, userId) => `powerTable-settings-${entity}-${userId}`;

const useTableSettings = (entity = 'default', userId = 'default') => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = makeStorageKey(entity, userId);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (err) {
        console.warn('Failed to parse table settings:', err);
        setSettings(defaultSettings);
      }
    }
    setIsLoading(false);
  }, [storageKey]);

  const updateSettings = useCallback((newSettings) => {
    console.log(newSettings);
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [settings, storageKey]);

  const reloadSettings = () => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        setSettings(defaultSettings);
      }
    }
  };

  return { settings, setSettings, updateSettings, isLoading, reloadSettings };
};

export default useTableSettings;
