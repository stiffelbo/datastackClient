// useFieldAutosave.js

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_DEBOUNCE = 600;

const DEBOUNCED_TYPES = new Set([
    "text",
    "email",
    "number",
    "textarea",
]);

const useFieldAutosave = ({
    id,
    form,
    updateField,
    debounce = DEFAULT_DEBOUNCE,
}) => {
    const timersRef = useRef(new Map());

    /**
     * Czy dane pole powinno być zapisywane z debounce.
     */
    const shouldDebounce = useCallback(
        (name) => {
            const field = form.getField(name);

            if (!field) {
                return false;
            }

            return DEBOUNCED_TYPES.has(field.type);
        },
        [form],
    );

    /**
     * Wykonuje właściwy zapis pola.
     */
    const saveField = useCallback(
        async (name, value) => {
            if (!updateField || id == null) {
                return null;
            }

            return updateField({
                id,
                field: name,
                value,
            });
        },
        [id, updateField],
    );

    /**
     * Aktualizuje lokalny stan formularza natychmiast,
     * a zapis do API wykonuje natychmiast lub z debounce
     * zależnie od typu pola w schema.
     */
    const setField = useCallback(
        (name, value) => {
            form.setField(name, value);

            const existingTimer = timersRef.current.get(name);

            if (existingTimer) {
                clearTimeout(existingTimer);
                timersRef.current.delete(name);
            }

            if (!shouldDebounce(name)) {
                return saveField(name, value);
            }

            const timer = setTimeout(() => {
                timersRef.current.delete(name);

                saveField(name, value).catch((error) => {
                    console.error(
                        `Autosave failed for field "${name}"`,
                        error,
                    );
                });
            }, debounce);

            timersRef.current.set(name, timer);

            return null;
        },
        [
            form,
            debounce,
            saveField,
            shouldDebounce,
        ],
    );

    /**
     * Pozwala wymusić natychmiastowy zapis niezależnie
     * od typu pola.
     */
    const setFieldImmediate = useCallback(
        (name, value) => {
            const existingTimer = timersRef.current.get(name);

            if (existingTimer) {
                clearTimeout(existingTimer);
                timersRef.current.delete(name);
            }

            form.setField(name, value);

            return saveField(name, value);
        },
        [form, saveField],
    );

    /**
     * Czyści wszystkie oczekujące timeouty.
     */
    const cancelPending = useCallback(() => {
        timersRef.current.forEach((timer) => {
            clearTimeout(timer);
        });

        timersRef.current.clear();
    }, []);

    useEffect(() => {
        return () => {
            cancelPending();
        };
    }, [cancelPending]);

    return {
        setField,
        setFieldImmediate,
        saveField,
        cancelPending,
    };
};

export default useFieldAutosave;