import React, { useState } from 'react';
import { IconButton, Tooltip, Drawer } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
// inne ikony i komponenty...
import TableMenu from './drawers/TableMenu';
import FieldsMenu from './drawers/FieldsMenu';

const Sidebar = (props) => {
    const { tableOptions, setTableOptions, columnsSchema, setColumnsSchema } = props;
    const [drawerState, setDrawerState] = useState({
        open: false,
        view: null, // np. 'tableMenu
    });

    const openDrawer = (view) => setDrawerState({ open: true, view });
    const closeDrawer = () => setDrawerState({ open: false, view: null });

    const renderDrawerContent = () => {
        switch (drawerState.view) {
            case 'tableMenu':
                return (
                    <TableMenu
                        config={tableOptions}
                        onChange={setTableOptions}
                    />
                );
            case 'fieldsMenu':
                return (
                    <FieldsMenu
                        columns={columnsSchema}
                        onColumnsChange={setColumnsSchema}
                    />
                );
            // case 'export': return <ExportForm />
            default:
                return null;
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tooltip title="Ustawienia tabeli">
                <IconButton onClick={() => openDrawer('tableMenu')} size="small">
                    <SettingsIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Ustawienia Pol">
                <IconButton onClick={() => openDrawer('fieldsMenu')} size="small">
                    <ViewColumnIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            {/* Kolejne przyciski do innych widoków */}
            {/* <Tooltip title="Presety"><IconButton onClick={() => openDrawer('presets')} /></Tooltip> */}

            <Drawer
                anchor="right"
                open={drawerState.open}
                onClose={closeDrawer}
                PaperProps={{
                    sx: {
                        maxWidth: '80vw', // opcjonalnie limit max
                    },
                }}
            >
                {renderDrawerContent()}
            </Drawer>
        </div>
    );
};

export default Sidebar;