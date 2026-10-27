
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
    CircularProgress,
    Collapse
} from '@mui/material';

import {
    Add as AddIcon,
    DeleteOutline as DeleteIcon,
    Refresh as RefreshIcon,
    KeyboardArrowDown,
    KeyboardArrowUp,
    AttachFile,
    CheckCircleOutline,
    ErrorOutline,
    SaveOutlined
} from '@mui/icons-material';

import { useRwd } from '../../../context/RwdContext';
import useEntity from '../../../hooks/useEntity';
import { useForm } from '../../../components/powerTable/form/useForm';
import { createRenderInput } from '../../../components/common/RenderInput';
import { uid } from '../../../utils/uid';
import { validator } from './validator';
import http from '../../../http';


import FileDropZone from '../../../components/common/FileDropZone';
import PowerTable from '../../../components/powerTable/powerTable';
import IncomingFiles from './IncomingFiles';

const heightSpan = 90;

const SHIPPING_ITEM_CATEGORIES = {
    NUMISMATICS: 'numismatics',
};

const createShippingItem = ({ id, category, label }) => {
    return {
        id: uid(8),
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
    const [shippingExpanded, setShippingExpanded] = useState(true);
    const [saving, setSaving] = useState(false);

    const availableHeight = Math.max(0, height - heightSpan);
    const contentTablesHeight = shippingExpanded ? availableHeight - 380 : availableHeight - 142;

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
                qty: +row.qty_ordered,
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

    const shippingEntity = useEntity({ endpoint: 'wh_shipping', entityName: 'IncomingShippingEntity', schemaQuery : { 'incoming': true } });
    const shippingItemEntity = useEntity({ endpoint: 'wh_shipping_items', entityName: 'IncomingShippingItemEntity' });
    const numismaticsEntity = useEntity({ endpoint: 'numismatics', entityName: 'IncomingNumismatics' });
    const upcommingsEntity = useEntity({ endpoint: 'product_order', entityName: 'IncomingUpcommings', query: { 'upcommings': true } });

    const shippingForm = useForm({ schema: shippingEntity.schema.addForm.schema, data: { direction: 1 } });

    const sfi = createRenderInput(shippingForm); //shipping form inputs

    const options = shippingEntity.schema.options;

    const shippingValidation = validator({ schema: shippingEntity.schema.addForm.schema, formState: shippingForm.formState });

    const renderShipping = () => {
        const valid = shippingValidation.valid;
        const errorCount = Object.keys(
            shippingValidation.errors || {}
        ).length;

        const attachmentsCount = attachments.length;
        return (
            <Paper
                variant="outlined"
                sx={{
                    flexShrink: 0,
                    overflow: 'hidden',
                }}
            >
                {/* Nagłówek */}
                <Box
                    onClick={() => setShippingExpanded(prev => !prev)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1,
                        minHeight: 48,
                        cursor: 'pointer',
                        userSelect: 'none',
                        bgcolor: 'action.hover',
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={600}>
                        Dane przesyłki
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        <Chip
                            size="small"
                            variant="outlined"
                            icon={<AttachFile />}
                            label={`Pliki: ${attachmentsCount}`}
                        />

                        <Chip
                            size="small"
                            color={shippingValidation.valid ? 'success' : 'warning'}
                            label={
                                shippingValidation.valid
                                    ? 'Formularz poprawny'
                                    : `Brakujące pola: ${Object.keys(shippingValidation.errors).length}`
                            }
                            title={`Brakujące pola: ${Object.keys(shippingValidation.errors)}`}
                        />

                        <IconButton size="small">
                            {shippingExpanded
                                ? <KeyboardArrowUp />
                                : <KeyboardArrowDown />}
                        </IconButton>
                    </Stack>
                </Box>

                <Collapse in={shippingExpanded} timeout="auto">
                    <Divider />

                    <Box sx={{ p: 2 }}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 0.7fr',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                                        mb: 2,
                                    }}
                                >
                                    {sfi('contractor_id', null, { pr: 1 })}
                                    {sfi('type_id', null, { pr: 1 })}
                                    {sfi('shipping_method_id', null, { pr: 1 })}
                                    {sfi('done_at', null, { pr: 1 })}
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    {sfi('notes', null, { pr: 1 })}
                                </Box>

                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        mb: 2,
                                    }}
                                >
                                    {sfi('weight_kg', null, { pr: 1 })}
                                    {sfi('length_cm', null, { pr: 1 })}
                                    {sfi('width_cm', null, { pr: 1 })}
                                    {sfi('height_cm', null, { pr: 1 })}
                                </Box>
                                <Box>
                                    {sfi('shipping_label_no', null, { pr: 1 })}
                                </Box>
                            </Box>

                            {options?.documents && (
                                <Box sx={{ minWidth: 0 }}>
                                    <IncomingFiles
                                        data={attachments}
                                        onChange={setAttachments}
                                        options={options.documents}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Collapse>
            </Paper>
        );
    };

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
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={
                            saving
                                ? <CircularProgress size={16} color="inherit" />
                                : <SaveOutlined />
                        }
                        onClick={handleSubmit}
                        disabled={
                            saving ||
                            !shippingValidation.valid ||
                            items.length === 0
                        }
                    >
                        {saving ? 'Zapisywanie...' : 'Zapisz przyjęcie'}
                    </Button>
                </Stack>
            </Box>
        );
    };

    const renderContentCreator = () => {
        const contentOnly = tab === 'content';
        let filteredUpcommings = upcommingsEntity.rows;
        const selectedContractor = shippingForm.formState.contractor_id;

        if(selectedContractor){
            filteredUpcommings = upcommingsEntity.rows.filter(i => i.contractor_id === selectedContractor);
        } 
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
                        {tab === "numismatics" && <PowerTable
                            entityName="IncomingNumismatics"
                            columnSchema={numismaticsEntity.schema.columnSchema}
                            data={numismaticsEntity.rows}
                            loading={numismaticsEntity.loading}
                            onRefresh={numismaticsEntity.refresh}
                            onSelect={handleSelectNumismatics}
                            height={contentTablesHeight}
                        />}
                        {tab === "upcommings" && <PowerTable
                            entityName="IncomingUpcommings"
                            columnSchema={upcommingsEntity.schema.columnSchema}
                            onRefresh={upcommingsEntity.refresh}
                            data={filteredUpcommings}
                            loading={upcommingsEntity.loading}
                            selected={[]}
                            onSelect={handleSelectUpcomings}
                            height={contentTablesHeight}
                        />}
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
                        height={contentTablesHeight}
                    />
                </Box>
            </Box>
        );
    };

    const prepareSubmit = () => {
        const formData = new FormData();

        formData.append('shipping', JSON.stringify(shippingForm.formState));

        formData.append('items', JSON.stringify(items));

        const documents = attachments.map(item => {
            formData.append(`files[${item.id}]`, item.file);

            return {
                id: item.id,
                type: item.type,
                title: item.title,
                notes: item.notes,
            };
        });

        formData.append('documents', JSON.stringify(documents));

        return formData;
    };

    const handleSubmit = async () => {
        if (saving || !shippingValidation.valid || items.length === 0) {
            return;
        }

        try {
            const formData = prepareSubmit();

            const response = await http.post(
                '/wh_shipping/incoming.php',
                formData
            );

            const result = response.data;

            if (result?.ok === false) {
                throw new Error(
                    result.message || 'Nie udało się zapisać przesyłki'
                );
            }

            console.log('Zapisano przyjęcie:', result);

            return result;

        } catch (error) {
            console.error('Błąd zapisu przesyłki:', error);

            throw error;

        } finally {
        }
    };

    return (
        <Box
            sx={{
                height: availableHeight,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                overflow: 'hidden',
                minHeight: 0,
            }}
        >
            {renderShipping()}

            {/* Dolny wiersz — cała pozostała wysokość */}
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                }}
            >
                {renderContentMenu()}
                {renderContentCreator()}
            </Box>
        </Box>
    );
};

export default Incoming;
