import { useMemo, useState } from 'react';
import useEntity from '../../hooks/useEntity';
import { useForm } from '../../components/powerTable/form/useForm';
import http from '../../http';
import { createOutgoingItem, prepareOutgoingPayload, unwrapOutgoingResponse } from './outgoingUtils';
import { validateOutgoing } from './outgoingValidator';

export default function useOutgoing() {
    const shippingEntity = useEntity({ endpoint: 'wh_shipping', entityName: 'OutgoingShippingEntity', schemaQuery: { outgoing: true } });
    // Backend getAll.php powinien mapować query.availableToShipOut na getAvailableToShipOut().
    const stockEntity = useEntity({ endpoint: 'wh_stock_entries', entityName: 'OutgoingStockEntries', query: { availableToShipOut: true } });
    const shippingForm = useForm({ schema: shippingEntity?.schema?.addForm?.schema, data: { direction: -1 } });
    const [items, setItems] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [shippingExpanded, setShippingExpanded] = useState(true);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);
    const contractorId = shippingForm.formState?.contractor_id;
    const availableRows = useMemo(() => (stockEntity.rows || []).filter(row => Number(row.qty_available) > 0 && (!contractorId || String(row.contractor_id) === String(contractorId))), [stockEntity.rows, contractorId]);
    const handleSelectEntry = id => {
        const row = availableRows.find(row => String(row.id) === String(id));
        if (!row || items.some(item => String(item.source_entry_id) === String(row.id))) return;
        setItems(prev => [...prev, createOutgoingItem(row)]);
    };
    const handleRemoveItem = id => setItems(prev => prev.filter(item => item.id !== id));
    const handleEditItem = ({ field, value, id }) => {
        if (!['qty', 'notes'].includes(field)) return;
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };
    const validation = validateOutgoing({ schema: shippingEntity?.schema?.addForm?.schema, shipping: shippingForm.formState, items, attachments });
    const handleSubmit = async () => {
        if (saving || result?.ok === true || !validation.valid) return;
        setSaving(true);
        setResult(null);
        try {
            const payload = prepareOutgoingPayload({ shipping: shippingForm.formState, items, attachments });
            const response = unwrapOutgoingResponse(await http.post('/wh_outgoing/create.php', payload));
            setResult(response?.ok === true ? response : { ok: false, message: response?.message || 'Nie udało się zapisać odesłania' });
        } catch (error) {
            setResult({ ok: false, message: error.response?.data?.message || error.message || 'Nie udało się zapisać odesłania' });
        } finally { setSaving(false); }
    };
    return { shippingEntity, stockEntity, shippingForm, items, attachments, setAttachments, shippingExpanded, setShippingExpanded, saving, result, validation, availableRows, handleSelectEntry, handleRemoveItem, handleEditItem, handleSubmit };
}
