
import { createContext, useState, useCallback, useMemo, useRef } from 'react';

export const EntityContext = createContext(null);

const createDefaultEntityState = () => ({
    timestamp: null,
    syncCursor: null,
    initialized: false,
    lastFetchedAt: null,

    // Schemat encji
    schema: null,
    allowed: false,
    schemaVersion: 0,

    // Dane encji
    rows: [],

    // Priorytetowe pobieranie pojedynczego rekordu
    initialItemId: null,
    initialItemLoaded: false,
});

// Helper function to recursively estimate deep object memory usage in bytes
function calculateByteSize(obj) {
    if (obj === null || obj === undefined) return 0;

    switch (typeof obj) {
        case 'number':
            return 8;
        case 'string':
            return obj.length * 2;
        case 'boolean':
            return 4;
        case 'object': {
            if (Array.isArray(obj)) {
                return obj.reduce((acc, item) => acc + calculateByteSize(item), 0);
            }

            let bytes = 0;
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    bytes += key.length * 2 + calculateByteSize(obj[key]);
                }
            }
            return bytes;
        }
        default:
            return 0;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function EntityProvider({ children }) {
    const [cache, setCache] = useState({});
    const cacheRef = useRef(cache);
    cacheRef.current = cache;

    const getEntityData = useCallback((key) => {
        return cacheRef.current[key] || createDefaultEntityState();
    }, []);

    const setEntityData = useCallback((key, updater) => {
        setCache((prev) => {
            const current = prev[key] || createDefaultEntityState();
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

    const getMemoryUsage = useCallback((targetKey = null) => {
        if (targetKey) {
            const targetData = cache[targetKey];
            if (!targetData) return { bytes: 0, human: '0 Bytes' };

            const bytes = calculateByteSize(targetData);
            return { bytes, human: formatBytes(bytes) };
        }

        const totalBytes = calculateByteSize(cache);

        return {
            bytes: totalBytes,
            human: formatBytes(totalBytes)
        };
    }, [cache]);

    const value = useMemo(() => ({
        getEntityData,
        setEntityData,
        clearEntityCache,
        clearAllCache,
        getMemoryUsage
    }), [
        getEntityData,
        setEntityData,
        clearEntityCache,
        clearAllCache,
        getMemoryUsage
    ]);

    return (
        <EntityContext value={value}>
            {children}
        </EntityContext>
    );
}
