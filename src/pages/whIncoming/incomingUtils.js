import { uid } from '../../utils/uid';

const storageUrl = import.meta.env.VITE_STORAGE_URL;

export const SHIPPING_ITEM_CATEGORIES = { NUMISMATICS: 'numismatics', ACCESSORIES: 'accessories' };
export const tabs = [
    { value: 'numismatics', label: 'Numizmaty' },
    { value: 'upcommings', label: 'Zapowiedzi' },
    { value: 'accesories', label: 'Akcesoria' },
    { value: 'content', label: 'Tylko zawartość' },
];

export const createShippingItem = ({ id, category, label, qty = 1 }) => ({
    id: uid(8), id_source: id, category, label, qty, notes: '',
});

export const makeNumismaticsLabel = row => [row.country, row.year, row.denomination, row.name].filter(v => v != null && v !== '').join('_');
export const makeAccessoryLabel = row => [row.category, row.name].filter(v => v != null && v !== '').join('_');

export const prepareIncomingPayload = ({ shipping, items, attachments }) => {
    const data = new FormData();
    data.append('shipping', JSON.stringify({ ...shipping, direction: 1 }));
    data.append('items', JSON.stringify(items));
    const documents = attachments.map(item => {
        if (item.file) data.append(`files[${item.id}]`, item.file);
        return { id: item.id, type: item.type, title: item.title, notes: item.notes };
    });
    data.append('documents', JSON.stringify(documents));
    return data;
};

export const unwrapIncomingResponse = response => response?.data ?? response;

export const makeOperationLink = ({id}) =>{
    return `${storageUrl}/whinventoryoperations/${id}/details` 
}
export const makeShippingLink = ({id}) =>{
    return `${storageUrl}/whshipping/${id}/details` 
}
