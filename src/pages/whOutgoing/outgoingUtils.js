import { uid } from '../../utils/uid';

const storageUrl = import.meta.env.VITE_STORAGE_URL;

// id_source = wh_stock_entries.id; m_idx_id pozostaje tylko informacją.
export const createOutgoingItem = row => ({
    id: uid(8),
    id_source: row.id,
    source_entry_id: row.id,
    m_idx_id: row.m_idx_id,
    contractor_id: row.contractor_id,
    label: row.item_description || row.materialLabel || row.label || `Pozycja #${row.id}`,
    qty_available: Number(row.qty_available),
    qty: Number(row.qty_available),
    unit: row.unit || 'szt',
    notes: '',
});

export const prepareOutgoingPayload = ({ shipping, items, attachments }) => {
    const data = new FormData();
    data.append('shipping', JSON.stringify({ ...shipping, direction: -1 }));
    data.append('items', JSON.stringify(items.map(item => ({ source_entry_id: item.source_entry_id, qty: Number(item.qty), notes: item.notes }))));
    data.append('documents', JSON.stringify(attachments.map(item => {
        if (item.file) data.append(`files[${item.id}]`, item.file);
        return { id: item.id, type: item.type, title: item.title, notes: item.notes };
    })));
    return data;
};
export const unwrapOutgoingResponse = response => response?.data ?? response;
export const makeOperationLink = id => `${storageUrl}/whinventoryoperations/${id}/details`;
export const makeShippingLink = id => `${storageUrl}/whshipping/${id}/details`;
