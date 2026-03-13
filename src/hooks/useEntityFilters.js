// hooks/useEntityFilters.js
import { useCallback, useEffect, useMemo, useState } from 'react';

function sanitizeQuery(values = {}) {
    const out = {};

    Object.entries(values || {}).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) return;
        if (Array.isArray(value) && value.length === 0) return;

        out[key] = value;
    });

    return out;
}

function readStored(storageKey, defaultValues) {
    if (!storageKey) return defaultValues;

    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return defaultValues;

        const parsed = JSON.parse(raw);
        return {
            ...defaultValues,
            ...parsed,
        };
    } catch (err) {
        console.warn('useEntityFilters readStored error', err);
        return defaultValues;
    }
}

export default function useEntityFilters({
    storageKey = null,
    defaultValues = {},
    autoApplyOnInit = true,
}) {
    const initialValues = useMemo(
        () => readStored(storageKey, defaultValues),
        [storageKey, defaultValues]
    );

    const [draftValues, setDraftValues] = useState(initialValues);
    const [appliedValues, setAppliedValues] = useState(
        autoApplyOnInit ? sanitizeQuery(initialValues) : sanitizeQuery(defaultValues)
    );

    useEffect(() => {
        if (!storageKey) return;

        try {
            localStorage.setItem(storageKey, JSON.stringify(draftValues));
        } catch (err) {
            console.warn('useEntityFilters localStorage write error', err);
        }
    }, [storageKey, draftValues]);

    const setValue = useCallback((name, value) => {
        setDraftValues(prev => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const setValues = useCallback((patch = {}) => {
        setDraftValues(prev => ({
            ...prev,
            ...patch,
        }));
    }, []);

    const apply = useCallback(() => {
        setAppliedValues(sanitizeQuery(draftValues));
    }, [draftValues]);

    const reset = useCallback(() => {
        setDraftValues(defaultValues);
        setAppliedValues(sanitizeQuery(defaultValues));

        if (storageKey) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(defaultValues));
            } catch (err) {
                console.warn('useEntityFilters reset localStorage error', err);
            }
        }
    }, [defaultValues, storageKey]);

    const hasActiveFilters = useMemo(() => {
        return Object.keys(sanitizeQuery(appliedValues)).length > 0;
    }, [appliedValues]);

    const query = useMemo(() => sanitizeQuery(appliedValues), [appliedValues]);

    return {
        draftValues,
        appliedValues,
        query,
        hasActiveFilters,
        setValue,
        setValues,
        apply,
        reset,
    };
}