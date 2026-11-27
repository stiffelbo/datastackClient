import React, { useState } from 'react';

import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    Divider,
    LinearProgress,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import useEntity from '../../hooks/useEntity';

import PriceListContentTopBar from './PriceListsContentTopBar';
import PriceListItems from './PriceListItems';
import EnnoblingsList from './EnnoblingsList';


const PriceListContent = ({ id, row, entity, rwd, dashboard }) => {
    const theme = useTheme();
    const compact = useMediaQuery(theme.breakpoints.down('md'));

    const [showEnnoblings, setShowEnnoblings] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [indicateEmpty, setIndicateEmpty] = useState(false);
    const [saving, setSaving] = useState(false);

    const itemsEntity = useEntity({
        endpoint: 'price_list_items',
        entityName: 'PriceListItems',
        query: { price_list_id: id },
    });

    const ennoblingsEntity = useEntity({
        endpoint: 'ennoblings',
        entityName: 'PricelistEnnoblings',
        readOnly: true,
    });

    const items = itemsEntity.rows ?? [];
    const ennoblings = ennoblingsEntity.rows ?? [];

    const loading = itemsEntity.loading || ennoblingsEntity.loading;
    const busy = loading || saving;

    // =========================================================
    // AVAILABLE ENNOBLINGS
    // =========================================================

    const assignedIds = new Set(
        items.map(item => Number(item.ennobling_id))
    );

    const available = ennoblings.filter(item =>
        Number(item.is_active) === 1
        && Number(item.is_deleted ?? 0) === 0
        && !assignedIds.has(Number(item.id))
    );

    const itemIds = new Set(items.map(item => Number(item.id)));

    const validSelectedIds = selectedIds.filter(
        id => itemIds.has(Number(id))
    );

    // =========================================================
    // ACTIONS
    // =========================================================

    const handleRefresh = async () => {
        await Promise.all([
            itemsEntity.refresh(),
            ennoblingsEntity.refresh(),
        ]);
    };

    const handleAdd = async (ids) => {
        if (busy || !itemsEntity.upload || !id) return;

        const availableIds = new Set(
            available.map(item => Number(item.id))
        );

        const uniqueIds = [...new Set(ids.map(Number))]
            .filter(id => availableIds.has(id));

        if (!uniqueIds.length) return;

        const rows = uniqueIds.map(ennoblingId => ({
            price_list_id: Number(id),
            ennobling_id: ennoblingId,
        }));

        setSaving(true);

        try {
            return await itemsEntity.upload(rows);
        } finally {
            setSaving(false);
        }
    };

    const handleBulkUpdate = async (changes) => {
        if (
            busy
            || !itemsEntity.updateMany
            || !validSelectedIds.length
            || !Object.keys(changes).length
        ) return;

        setSaving(true);

        try {
            return await itemsEntity.updateMany(
                validSelectedIds,
                changes
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // SHARED CONTEXT
    // =========================================================

    const priceList = {
        id,
        row,
        items,
        available,
        itemsEntity,
        ennoblingsEntity,
        loading,
        saving,
        busy,

        ui: {
            indicateEmpty,
            showEnnoblings,
            showBulkEdit,
            selectedIds: validSelectedIds,

            setSelectedIds,

            toggleEnnoblings: () => setShowEnnoblings(prev => !prev),
            closeEnnoblings: () => setShowEnnoblings(false),
            toggleBulkEdit: () => setShowBulkEdit(prev => !prev),
            closeBulkEdit: () => setShowBulkEdit(false),
            indicate : () => setIndicateEmpty(!indicateEmpty)
        },

        actions: {
            refresh: handleRefresh,
            add: handleAdd,
            addAll: () => handleAdd(available.map(item => item.id)),
            bulkUpdate: handleBulkUpdate,
        },
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: '100%',
                height: '100%',
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
            }}
        >
            <PriceListContentTopBar priceList={priceList} />

            <Box sx={{ height: 2, flexShrink: 0 }}>
                {busy && <LinearProgress sx={{ height: 2 }} />}
            </Box>

            <Divider />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: compact ? 'column' : 'row',
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    overflow: 'hidden',
                }}
            >
                {showEnnoblings && (
                    <Box
                        sx={{
                            width: compact ? '100%' : 320,
                            minWidth: compact ? 0 : 260,
                            maxWidth: compact ? '100%' : 320,
                            height: compact ? '40%' : '100%',
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0,
                            overflow: 'hidden',
                            borderRight: compact ? 0 : 1,
                            borderBottom: compact ? 1 : 0,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Box
                            sx={{
                                px: 1,
                                py: 0.5,
                                minHeight: 35,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    flex: 1,
                                    fontWeight: 700,
                                    fontSize: 11.5,
                                }}
                            >
                                Katalog uszlachetnień
                            </Typography>

                            <Tooltip title="Zamknij panel">
                                <IconButton
                                    size="small"
                                    onClick={priceList.ui.closeEnnoblings}
                                    sx={{ p: 0.4 }}
                                >
                                    <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Divider />

                        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                            <EnnoblingsList priceList={priceList} />
                        </Box>
                    </Box>
                )}

                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    <PriceListItems
                        priceList={priceList}
                        rwd={rwd}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default PriceListContent;