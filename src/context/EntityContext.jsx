// contexts/EntityContext.jsx
import { createContext, useState, useCallback } from 'react';

export const EntityContext = createContext(null);

export function EntityProvider({ children }) {
    // Struktura cache: { [entityKey]: { schema, allowed, schemaVersion, rows } }
    const [cache, setCache] = useState({});

    const getEntityData = useCallback((key) => {
        return cache[key] || {
            timestamp: null,
            schema: null,
            allowed: false,
            schemaVersion: 0,
            rows: []
        };
    }, [cache]);

    const setEntityData = useCallback((key, updater) => {
        setCache((prev) => {
            const current = prev[key] || {
                timestamp: null,
                schema: null,
                allowed: false,
                schemaVersion: 0,
                rows: []
            };
            
            // Obsługa przekazywania funkcji updater (jak w useState) lub czystego obiektu
            const next = typeof updater === 'function' ? updater(current) : updater;
            
            return {
                ...prev,
                [key]: { ...current, ...next }
            };
        });
    }, []);

    const clearEntityCache = useCallback((key) => {
        setCache((prev) => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
        });
    }, []);

    const clearAllCache = useCallback(() => setCache({}), []);

    const value = {
        getEntityData,
        setEntityData,
        clearEntityCache,
        clearAllCache
    };

    // W React 19 używamy bezpośrednio EntityContext zamiast EntityContext.Provider
    return (
        <EntityContext value={value}>
            {children}
        </EntityContext>
    );
}