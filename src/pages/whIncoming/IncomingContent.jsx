import React from 'react';
import { Box, Paper, Stack, Tab, Tabs, Typography, Chip } from '@mui/material';
import PowerTable from '../../components/powerTable/powerTable';
import { tabs } from './incomingUtils';

const itemColumns = [
    { field: 'label', headerName: 'Numizmat', width: 350 },
    { field: 'qty', headerName: 'Ilość sprawdzona', editable: true, type: 'number', width: 170 },
    { field: 'notes', headerName: 'Uwagi', editable: true, width: 320 },
];

export default function IncomingContent({ incoming, height = 500 }) {
    const { tab, setTab, numismaticsEntity, upcommingsEntity, accessoriesEntity, filteredUpcommings, items, handleSelectNumismatics, handleSelectUpcomings, handleSelectAccesories, handleRemoveItem, handleEditItem } = incoming;
    const contentOnly = tab === 'content';
    return <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
                {tabs.map(item => <Tab key={item.value} value={item.value} label={item.label} />)}
            </Tabs>
            <Chip size="small" variant="outlined" label={`Pozycji: ${items.length}`} />
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: contentOnly ? 'minmax(0,1fr)' : { xs: 'minmax(0,1fr)', lg: 'minmax(0,1fr) minmax(0,0.8fr)' }, gap: 1, p: 1, minHeight: 0, overflow: 'auto' }}>
            {!contentOnly && <Box sx={{ minWidth: 0 }}>
                {tab === 'numismatics' && <PowerTable entityName="IncomingNumismatics" columnSchema={numismaticsEntity.schema?.columnSchema} data={numismaticsEntity.rows} loading={numismaticsEntity.loading} onRefresh={numismaticsEntity.refresh} onSelect={handleSelectNumismatics} height={height} />}
                {tab === 'upcommings' && <PowerTable entityName="IncomingUpcommings" columnSchema={upcommingsEntity.schema?.columnSchema} data={filteredUpcommings} loading={upcommingsEntity.loading} onRefresh={upcommingsEntity.refresh} onSelect={handleSelectUpcomings} height={height} />}
                {tab === 'accesories' && <PowerTable entityName="IncomingAccesories" columnSchema={accessoriesEntity.schema?.columnSchema} data={accessoriesEntity.rows} loading={accessoriesEntity.loading} onRefresh={accessoriesEntity.refresh} onSelect={handleSelectAccesories} height={height} />}
            </Box>}
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>Wybrane pozycje — edytuj ilości bezpośrednio w tabeli</Typography>
                <PowerTable entityName="IncomingItems" data={items} columnSchema={itemColumns} onDelete={handleRemoveItem} onEdit={handleEditItem} height={height} />
            </Box>
        </Box>
    </Paper>;
}
