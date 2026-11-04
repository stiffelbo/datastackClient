// Walidacja przesyłki respektuje schema.addForm.schema (w tym validation.required).
// Walidacja pozycji i dokumentów jest niezależna od schematu.
import { validator } from './validator';

const asErrors = errors => Object.entries(errors || {}).filter(([, value]) => !!value).map(([key, value]) => typeof value === 'string' ? value : `Pole ${key}: nieprawidłowa wartość`);

export function validateIncoming({ schema, shipping, items, attachments }) {
    const formResult = validator({ schema, formState: shipping });
    const shippingErrors = asErrors(formResult?.errors);
    if (!formResult?.valid && !shippingErrors.length) shippingErrors.push('Uzupełnij wymagane dane przesyłki');

    const itemErrors = [];
    if (!items.length) itemErrors.push('Dodaj przynajmniej jedną pozycję');
    items.forEach((item, index) => {
        if (item.id_source === null || item.id_source === undefined || item.id_source === '') itemErrors.push(`Pozycja ${index + 1}: brak źródła`);
        if (!Number.isFinite(Number(item.qty)) || Number(item.qty) <= 0) itemErrors.push(`Pozycja ${index + 1}: ilość musi być większa od zera`);
    });
    const documentErrors = attachments.flatMap((item, index) => {
        const errors = [];
        if (!item.file) errors.push(`Dokument ${index + 1}: brak pliku`);
        if (item.type === null || item.type === undefined || item.type === '') errors.push(`Dokument ${index + 1}: wybierz typ`);
        return errors;
    });
    const sections = [
        { id: 'shipping', label: 'Dane przesyłki', errors: shippingErrors, valid: !!formResult?.valid },
        { id: 'items', label: 'Zawartość', errors: itemErrors, valid: itemErrors.length === 0 },
        { id: 'documents', label: 'Dokumenty', errors: documentErrors, valid: documentErrors.length === 0, optional: true, count: attachments.length },
    ];
    return { valid: sections.every(s => s.valid), sections, completed: sections.filter(s => s.valid).length, total: sections.length, errors: sections.flatMap(s => s.errors) };
}
