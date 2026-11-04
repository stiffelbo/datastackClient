import { validator } from './validator';

export function validateOutgoing({ schema, shipping, items, attachments }) {
    const formResult = validator({ schema, formState: shipping });
    const shippingErrors = Object.entries(formResult.errors || {}).map(([field, value]) => typeof value === 'string' ? value : `Niepoprawne pole: ${field}`);
    if (!formResult.valid && !shippingErrors.length) shippingErrors.push('Uzupełnij dane przesyłki');
    const itemErrors = [];
    if (!items.length) itemErrors.push('Wybierz przynajmniej jedną pozycję');
    items.forEach((item, index) => {
        const qty = Number(item.qty);
        const available = Number(item.qty_available);
        if (!Number.isInteger(Number(item.source_entry_id)) || Number(item.source_entry_id) <= 0) itemErrors.push(`Pozycja ${index + 1}: brak wpisu źródłowego`);
        if (!Number.isFinite(qty) || qty <= 0) itemErrors.push(`Pozycja ${index + 1}: ilość musi być większa od zera`);
        if (!Number.isFinite(available) || qty > available) itemErrors.push(`Pozycja ${index + 1}: przekroczono ilość dostępną (${available})`);
        if (shipping.contractor_id && item.contractor_id && String(shipping.contractor_id) !== String(item.contractor_id)) itemErrors.push(`Pozycja ${index + 1}: inny kontrahent niż na przesyłce`);
    });
    const documentErrors = attachments.flatMap((item, index) => [
        ...(!item.file ? [`Dokument ${index + 1}: brak pliku`] : []),
        ...(item.type === '' || item.type == null ? [`Dokument ${index + 1}: brak typu`] : []),
    ]);
    const sections = [
        { id: 'shipping', label: 'Dane przesyłki', valid: !!formResult.valid, errors: shippingErrors },
        { id: 'items', label: 'Zawartość', valid: itemErrors.length === 0, errors: itemErrors },
        { id: 'documents', label: 'Dokumenty', valid: documentErrors.length === 0, errors: documentErrors, optional: true, count: attachments.length },
    ];
    return { valid: sections.every(s => s.valid), sections, completed: sections.filter(s => s.valid).length, total: sections.length, errors: sections.flatMap(s => s.errors) };
}
