// Lokalny walidator minimalny; jeśli w projekcie istnieje pełniejszy ./validator,
// można zastąpić ten plik bez zmiany API validateIncoming.
export function validator({ schema, formState = {} }) {
    const errors = {};
    if (!schema) return { valid: false, errors: { schema: 'Trwa ładowanie schematu formularza' } };
    const fields = Array.isArray(schema) ? schema : Object.entries(schema).map(([field, definition]) => ({ field, ...(typeof definition === 'object' && definition !== null ? definition : {}) }));
    fields.forEach(field => {
        const key = field.field || field.name || field.key;
        if (!key) return;
        const required = field.validation?.required ?? field.required ?? false;
        const value = formState[key];
        if (required && (value === null || value === undefined || value === '')) errors[key] = `Pole ${field.label || field.headerName || key} jest wymagane`;
    });
    return { valid: Object.keys(errors).length === 0, errors };
}
