
import React, { useState } from 'react';

import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    Button,
    IconButton,
    Tabs,
    Tab,
    Chip,
    Divider,
    MenuItem,
    Alert,
    LinearProgress,
} from '@mui/material';

import {
    Add as AddIcon,
    DeleteOutline as DeleteIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';

import { useRwd } from '../../../context/RwdContext';
import useEntity from '../../../hooks/useEntity';
import { useForm } from '../../../components/powerTable/form/useForm';
import { createRenderInput } from '../../../components/common/RenderInput';

import FileDropZone from '../../../components/common/FileDropZone';
import PowerTable from '../../../components/powerTable/powerTable';
import IncomingFiles from './IncomingFiles';

const heightSpan = 100;

const SHIPPING_ITEM_CATEGORIES = {
    NUMISMATICS: 'numismatics',
};

const createShippingItem = ({ id, category, label }) => {
    return {
        id: crypto.randomUUID(),
        id_source: id,
        category: category,
        label: label,
        qty: 0,
        notes: ''
    }
}

const makeNumismaticsLabel = (row) => {
    return [
        row.country,
        row.year,
        row.denomination,
        row.name,
    ].join('_');
};

const tabs = [
    { value: 'numismatics', label: 'Numizmaty' },
    { value: 'upcommings', label: 'Zapowiedzi' },
    { value: 'content', label: 'Tylko zawartość' },
];

const Incoming = () => {
    const { height } = useRwd();
    const [attachments, setAttachments] = useState([]);
    const [items, setItems] = useState([]);
    const [tab, setTab] = useState('numismatics');

    //handlers
    const handleSelectNumismatics = (id) => {
        const row = numismaticsEntity.rows.find(
            row => String(row.id) === String(id)
        );

        if (!row) return;

        setItems(prev => [
            ...prev,
            createShippingItem({
                id: row.id,
                category: SHIPPING_ITEM_CATEGORIES.NUMISMATICS,
                label: makeNumismaticsLabel(row),
                qty: 1,
            }),
        ]);
    };

    const handleSelectUpcomings = (id) => {
        console.log(id);
        const row = upcommingsEntity.rows.find(
            row => String(row.id) === String(id)
        );
        if (!row) return;

        setItems(prev => [
            ...prev,
            createShippingItem({
                id: row.numismatic_id,
                category: SHIPPING_ITEM_CATEGORIES.NUMISMATICS,
                label: row.design,
                qty: 1,
            }),
        ]);
    }

    const handleRemoveItem = (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }

    const handleEditItem = ({ field, value, id }) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };


    const shippingEntity = useEntity({ endpoint: 'wh_shipping', entityName: 'IncomingShippingEntity' });
    const shippingItemEntity = useEntity({ endpoint: 'wh_shipping_items', entityName: 'IncomingShippingItemEntity' });
    const numismaticsEntity = useEntity({ endpoint: 'numismatics', entityName: 'IncomingNumismatics' });
    const upcommingsEntity = useEntity({ endpoint: 'product_order', entityName: 'IncomingUpcommings', query : {'upcommings' : true} });

    const shippingForm = useForm({ schema: shippingEntity.schema.addForm.schema });

    const sfi = createRenderInput(shippingForm); //shipping form inputs

    const options = shippingEntity.schema.options;

    const renderContentMenu = () => {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, value) => setTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ minWidth: 0, flex: 1 }}
                >
                    {tabs.map(item => (
                        <Tab
                            key={item.value}
                            value={item.value}
                            label={item.label}
                        />
                    ))}
                </Tabs>

                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ flexShrink: 0 }}
                >
                    {/* Tutaj później akcje formularza */}
                    {/* <Button variant="contained">Zapisz</Button> */}
                </Stack>
            </Box>
        );
    };

    const renderContentCreator = () => {
        const contentOnly = tab === 'content';

        const renderSourceTable = () => {
            switch (tab) {
                case 'numismatics':
                    return (
                        <PowerTable
                            entityName="IncomingNumismatics"
                            columnSchema={numismaticsEntity.schema.columnSchema}
                            data={numismaticsEntity.rows}
                            loading={numismaticsEntity.loading}
                            onRefresh={numismaticsEntity.refresh}
                            onSelect={handleSelectNumismatics}
                        />
                    );

                case 'upcommings':
                    return (
                        <PowerTable
                            entityName="IncomingUpcommings"
                            columnSchema={upcommingsEntity.schema.columnSchema}
                            onRefresh={upcommingsEntity.refresh}
                            data={upcommingsEntity.rows}
                            loading={upcommingsEntity.loading}
                            selected={[]}
                            onSelect={handleSelectUpcomings}
                        // onSelect={handleSelectUpcomming}
                        />
                    );

                default:
                    return null;
            }
        };

        return (
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: contentOnly
                        ? 'minmax(0, 1fr)'
                        : 'minmax(0, 1fr) minmax(0, 0.7fr)',
                    gap: 1,
                    width: '100%',
                }}
            >
                {!contentOnly && (
                    <Box sx={{ minWidth: 0 }}>
                        {renderSourceTable()}
                    </Box>
                )}

                <Box sx={{ minWidth: 0 }}>
                    <PowerTable
                        entityName="IncomingItems"
                        data={items}
                        onDelete={handleRemoveItem}
                        onEdit={handleEditItem}
                        columnSchema={[
                            { field: 'qty', headerName: 'Ilosc Sprawdzona', editable: true, width: '200' },
                            { field: 'notes', headerName: 'Uwagi', editable: true, width: '400' },
                        ]}
                    />
                </Box>
            </Box>
        );
    };

    return (<Box sx={{ p: 1, height: height - heightSpan, maxHeight: height - heightSpan, overflow: 'scroll' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: "1fr 0.7fr", mb: 2 }}>
            <Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: "1fr 1fr 1fr", mb: 2 }}>
                    {sfi('type_id', null, { pr: 1 })}
                    {sfi('contractor_id', null, { pr: 1 })}
                    {sfi('planned_at', null, { pr: 1 })}
                </Box>
                <Box sx={{ mb: 2 }}>
                    {sfi('notes', null, { pr: 1 })}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: "1fr 1fr 1fr 1fr", mb: 2 }}>
                    {sfi('weight_kg', null, { pr: 1 })}
                    {sfi('length_cm', null, { pr: 1 })}
                    {sfi('width_cm', null, { pr: 1 })}
                    {sfi('height_cm', null, { pr: 1 })}
                </Box>
            </Box>
            {options?.documents && <IncomingFiles data={attachments} onChange={setAttachments} options={options.documents} />}
        </Box>
        {renderContentMenu()}
        {renderContentCreator()}
    </Box>);
};

export default Incoming;
