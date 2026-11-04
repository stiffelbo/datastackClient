import { useMemo, useState } from 'react';
import useEntity from '../../hooks/useEntity';
import { useForm } from '../../components/powerTable/form/useForm';
import http from '../../http';
import { createShippingItem, makeNumismaticsLabel, makeAccessoryLabel, prepareIncomingPayload, SHIPPING_ITEM_CATEGORIES, unwrapIncomingResponse } from './incomingUtils';
import { validateIncoming } from './incomingValidator';

export default function useIncoming() {
    const shippingEntity = useEntity({ endpoint: 'wh_shipping', entityName: 'IncomingShippingEntity', schemaQuery: { incoming: true } });
    const numismaticsEntity = useEntity({ endpoint: 'numismatics', entityName: 'IncomingNumismatics' });
    const accessoriesEntity = useEntity({ endpoint: 'numismatic_accessories', entityName: 'IncomingNumismaticAccessories' });
    const upcommingsEntity = useEntity({ endpoint: 'product_order', entityName: 'IncomingUpcommings', query: { upcommings: true } });
    const shippingForm = useForm({ schema: shippingEntity?.schema?.addForm?.schema, data: { direction: 1 } });

    const [items, setItems] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [tab, setTab] = useState('numismatics');
    const [shippingExpanded, setShippingExpanded] = useState(true);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);

    const validation = validateIncoming({
        schema: shippingEntity?.schema?.addForm?.schema,
        shipping: shippingForm.formState,
        items,
        attachments,
    });
    const filteredUpcommings = useMemo(() => {
        const contractor = shippingForm.formState?.contractor_id;
        return contractor === null || contractor === undefined || contractor === ''
            ? upcommingsEntity.rows
            : upcommingsEntity.rows.filter(row => String(row.contractor_id) === String(contractor));
    }, [upcommingsEntity.rows, shippingForm.formState?.contractor_id]);

    const handleSelectNumismatics = id => {
        const row = numismaticsEntity.rows.find(row => String(row.id) === String(id));
        if (!row) return;
        setItems(prev => [...prev, createShippingItem({ id: row.id, category: SHIPPING_ITEM_CATEGORIES.NUMISMATICS, label: makeNumismaticsLabel(row), qty: 1 })]);
    };
    const handleSelectUpcomings = id => {
        const row = upcommingsEntity.rows.find(row => String(row.id) === String(id));
        if (!row || !row.numismatic_id) return;
        setItems(prev => [...prev, createShippingItem({ id: row.numismatic_id, category: SHIPPING_ITEM_CATEGORIES.NUMISMATICS, label: row.design, qty: Number(row.qty_ordered) || 0 })]);
    };
    const handleSelectAccesories = id => {
        const row = accessoriesEntity.rows.find(row => String(row.id) === String(id));
        if (!row) return;
        setItems(prev => [...prev, createShippingItem({ id: row.id, category: SHIPPING_ITEM_CATEGORIES.ACCESSORIES, label: makeAccessoryLabel(row), qty: 1})]);
    };
    const handleRemoveItem = id => setItems(prev => prev.filter(item => item.id !== id));
    const handleEditItem = ({ field, value, id }) => setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));

    const handleSubmit = async () => {
        if (saving || result?.ok === true || !validation.valid) return;
        setSaving(true);
        setResult(null);
        try {
            const payload = prepareIncomingPayload({ shipping: shippingForm.formState, items, attachments });
            const response = unwrapIncomingResponse(await http.post('/wh_incoming/create.php', payload));
            setResult(response?.ok === true ? response : { ok: false, message: response?.message || 'Nie udało się zapisać przyjęcia' });
        } catch (error) {
            setResult({ ok: false, message: error.response?.data?.message || error.message || 'Nie udało się zapisać przyjęcia' });
        } finally {
            setSaving(false);
        }
    };

    return {
        shippingEntity, numismaticsEntity, upcommingsEntity, accessoriesEntity, shippingForm,
        items, attachments, setAttachments, tab, setTab, shippingExpanded, setShippingExpanded,
        saving, result, setResult, validation, filteredUpcommings,
        handleSelectNumismatics, handleSelectUpcomings, handleSelectAccesories, handleRemoveItem, handleEditItem, handleSubmit,
    };
}
