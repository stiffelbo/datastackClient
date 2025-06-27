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
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Mrt from './Mrt';

import { generateColumns } from './utils';

const defaultTableConfig = {
    enableStickyHeader: true,
    enableStickyFooter: false,
    enableFullScreenToggle: false,
    enableColumnVirtualization: false,
    enableRowVirtualization: false,
    enableGlobalFilter: true,
    enableGrouping: true,

    enableSorting: true,
    enableMultiSort: true,
    enableColumnOrdering: false,
    enableColumnFilter: false,

    enableColumnPinning: true,
    enableColumnResizing: true,
    enableColumnDragging: false,
    enableColumnFilters: false,
    enableColumnFilterModes: true,

    enableRowSelection: false,
    enableRowActions: false,
    enableRowNumbers: false,
    enableExpanding: false,
};


export default function Crud({
    crudConfig = {},
    data = null,
    onCreate,
    onUpdate,
    onDelete,
    heightSpan = 128
}){
    const {
        entity = 'unnamed',
        columns = [],
        enableForm = true,
        formFields = [],
        dataLoader = null,
        defaultGrouping = [],
        defaultHiddenColumns = [],
    } = crudConfig;

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [columnsSchema, setColumnsSchema] = useState(crudConfig.columns || []);
    const [tableOptions, setTableOptions] = useState(defaultTableConfig);

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
    const sidebarWidth = 88;

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
        muiTableBodyProps: {
            sx: {
                width: '100%',
                maxWidth: '100%',
                height: '100%',
                maxHeight: '100%',
            },
        },
        muiTableContainerProps: {
            sx: {
                maxHeight: innerHeigth - 88,
            },
        },
        enableStickyHeader: true,
        positionPagination: 'top',
    };



    return (
        <Box width="100%" sx={{ display: 'flex', flexDirection: 'row', height: innerHeigth - heightSpan, overflow: 'hidden' }}>
            {/* Sidebar z przyciskami kontrolnymi */}
            <Box sx={{ width: sidebarWidth }}>
                <Sidebar
                    tableOptions={tableOptions}
                    setTableOptions={setTableOptions}
                    columnsSchema={columnsSchema}
                    setColumnsSchema={setColumnsSchema}
                />
            </Box>


            {/* Główna część z tabelą */}
            <Box sx={{ width: innerWidth - sidebarWidth, height: '100%', maxHeight: '100%'}}>
                <Mrt data={tableData} columns={columnsSchema} config={tableConfig} />
            </Box>
        </Box>
    );
}

