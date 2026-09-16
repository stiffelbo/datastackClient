import { createContext, useState, useCallback } from 'react';

export const EntityContext = createContext(null);

// Helper function to recursively estimate deep object memory usage in bytes
function calculateByteSize(obj) {
    if (obj === null || obj === undefined) return 0;
    
    switch (typeof obj) {
        case 'number':
            // JavaScript numbers are 64-bit floating point (8 bytes)
            return 8;
        case 'string':
            // JavaScript strings use UTF-16 characters (2 bytes per character)
            return obj.length * 2;
        case 'boolean':
            // Booleans typically take 4 bytes internally in V8
            return 4;
        case 'object': {
            if (Array.isArray(obj)) {
                // Return size of all items in array
                return obj.reduce((acc, item) => acc + calculateByteSize(item), 0);
            }
            
            // It's a standard object or dictionary map
            let bytes = 0;
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    // Include both the key string size and the value size
                    bytes += key.length * 2 + calculateByteSize(obj[key]);
                }
            }
            return bytes;
        }
        default:
            return 0;
    }
}

// Converts raw bytes into a scannable, human-friendly string
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function EntityProvider({ children }) {
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
            const next = typeof updater === 'function' ? updater(current) : updater;
            return { ...prev, [key]: { ...current, ...next } };
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

    // NEW: Function to estimate either a specific entity cache size or the total context size
    const getMemoryUsage = useCallback((targetKey = null) => {
        if (targetKey) {
            const targetData = cache[targetKey];
            if (!targetData) return { bytes: 0, human: '0 Bytes' };
            const bytes = calculateByteSize(targetData);
            return { bytes, human: formatBytes(bytes) };
        }
        
        // Total allocation of entire context cache
        const totalBytes = calculateByteSize(cache);
        return {
            bytes: totalBytes,
            human: formatBytes(totalBytes)
        };
    }, [cache]);

    const value = {
        getEntityData,
        setEntityData,
        clearEntityCache,
        clearAllCache,
        getMemoryUsage // Exposed cleanly to the client hooks
    };

    return (
        <EntityContext value={value}>
            {children}
        </EntityContext>
    );
}