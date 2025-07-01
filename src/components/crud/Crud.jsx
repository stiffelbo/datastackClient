/**
 * Główny komponent CRUD platformy.
 *
 * - Wyświetla tabelę opartą na Material React Table.
 * - Wykorzystuje config przekazany jako props (`crudConfig`).
 * - Wyświetla pasek boczny z kontrolkami (drawery, akcje itp.).
 * - Obsługuje dane jako props lub przez loader z `crudConfig`.
 * - Zapewnia interfejs dla tworzenia/edycji/usuwania rekordów.
 */

import React, { useEffect, useState } from 'react';
import { Box, Drawer } from '@mui/material';
import Mrt from './Mrt';
import Controls from './Controls';

import { generateColumns } from './utils';

export default function Crud({
    crudConfig = {},
    data = null,
    onCreate,
    onUpdate,
    onDelete,
    heightSpan = 92
}) {
    const {
        entity = 'unnamed',
        columns = [],
        enableForm = true,
        formFields = [],
        dataLoader = null,
        defaultGrouping = [],
        defaultHiddenColumns = [],
    } = crudConfig;

    const [drawerState, setDrawerState] = useState({
        open: false,
        view: null, // np. 'tableMenu
    });
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [columnsSchema, setColumnsSchema] = useState(crudConfig.columns || []);
    const [tableOptions, setTableOptions] = useState({});

    // Załaduj dane jeśli nie są podane bezpośrednio
    useEffect(() => {
        const loadData = async () => {
            if (data) {
                setTableData(data);
            } else if (dataLoader) {
                setLoading(true);
                const result = await dataLoader();
                setTableData(result || []);
                setLoading(false);
            }
        };
        loadData();
    }, [data, dataLoader]);

    //autochema dla kolumn na podstawie danych
    useEffect(() => {
        if (!columns.length && tableData.length) {
            const auto = generateColumns(tableData);
            setColumnsSchema(auto);
        }
    }, [tableData]);

    const { innerHeigth, innerWidth } = window;
    const sidebarWidth = 0;
    const calcHeight = innerHeigth - heightSpan;

    const tableConfig = {
        ...tableOptions,
        state: {
            isLoading: loading,
        },
        initialState: {
            columnVisibility: Object.fromEntries(
                defaultHiddenColumns.map((key) => [key, false])
            ),
            grouping: defaultGrouping,
            pagination: { pageIndex: 0, pageSize: 100 },
        },

        muiTableContainerProps: {
            sx: {
                width: innerWidth - sidebarWidth,
                height: calcHeight,
                overflow: 'auto',
                position: 'relative', // ← ważne dla sticky
            }
        },
        enableStickyHeader: true,
        enableBottomToolbar: false,
        enableStickyHeader: true,
        enableStickyFooter: true,
        enableFullScreenToggle: false,

        enableSorting: true,
        enableGrouping: true,
        enableMultiSort: true,
        enableColumnFilter: true,
        enableColumnOrdering: false,
        

        enableColumnPinning: true,
        enableColumnResizing: true,
        enableColumnDragging: false,
        enableColumnFilters: false,
        enableColumnFilterModes: true,

        enableRowSelection: false,
        enableExpanding: false,
    };


    const openDrawer = (view) => setDrawerState({ open: true, view });
    const closeDrawer = () => setDrawerState({ open: false, view: null });

    const renderDrawerContent = () => {
        switch (drawerState.view) {
            case 'addForm':
                return (
                    <p>Add Form</p>
                );
            case 'filters':
                return (
                    <p>Filters</p>
                );
            // case 'export': return <ExportForm />
            default:
                return null;
        }
    };

    return (
        <Box width="100%">
            <Drawer
                anchor="left"
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

            {/* Główna część z tabelą */}
            <Mrt data={tableData} columns={columnsSchema} config={tableConfig} openDrawer={openDrawer}/>

        </Box>
    );
}

