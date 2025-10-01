import React from "react";

//Mui
import {IconButton, Box, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import DeleteIcon from '@mui/icons-material/Delete';

const getEmployeeRowClass = (params) => {
    return params.row.employee_id === 0 ? 'row-missing-employee' : '';
};

const Table = ({ rows, onEdit, onDelete, employeesOptions = [], loading }) => {

    if(!rows || !rows.length) return <Box p={3}>
                        <Alert severity="info">Brak danych. Wgraj plik z wynagrodzeniami.</Alert>
                    </Box>

    const handleCellEdit = (params, event) => {
        const {field, id} = params;
        const target = event?.target;
        let value = '';
        if(target && target.value !== undefined) {
            value = target.value;
            onEdit({field, value, id});
            return;
        }
        if(target && target.nextSibling && target.nextSibling.value) {
            value = +target.nextSibling.value;
            onEdit({field, value, id});
            return;
        }
    }

    const columns = [
        {
            field: 'id',
            headerName: '',
            width: 40,
            renderCell: (params) => (
                <IconButton size="small" color="error" onClick={() => onDelete(params.id)}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            ),
        },
        { field: 'company_name', headerName: 'Spółka', width: 180, type: 'string', editable: true },
        { field: 'branch', headerName: 'Pion', width: 200, type: 'string', editable: true },
        { field: 'dept_name', headerName: 'Wydział', width: 260, type: 'string', editable: true },
        { field: 'ocupation', headerName: 'Stanowisko', width: 250, type: 'string', editable: true },
        { field: 'employee_name', headerName: 'Pracownik', width: 180, type: 'string', editable: true },
        {
            field: 'employee_id',
            headerName: 'Pracownik ID',
            width: 220,
            type: 'singleSelect',
            editable: true,
            valueOptions: employeesOptions,
        },
        { field: 'salarie_brutto', headerName: 'Brutto', width: 100, type: 'number', editable: true },
        { field: 'zus', headerName: 'ZUS', width: 100, type: 'number', editable: true },
        { field: 'cost_total', headerName: 'Łączny koszt', width: 130, type: 'number', editable: true },
        { field: 'worked_hours', headerName: 'Godziny', width: 100, type: 'number', editable: true },
        { field: 'cost_per_hour', headerName: 'Koszt/godz.', width: 120, type: 'number', editable: true },
        { field: 'bonus_total', headerName: 'Premie', width: 100, editable: true },
        { field: 'overtime_hours', headerName: 'Nadgodziny (h)', width: 130, editable: true },
        { field: 'overtime_cost', headerName: 'Koszt nadgodzin', width: 150, editable: true },
        { field: 'days_off', headerName: 'Zwolnienia (dni)', width: 140, editable: true },
        { field: 'vacation_days', headerName: 'Urlop (dni)', width: 120, editable: true },
        { field: 'bonus_anniversary', headerName: 'Nagroda jubileuszowa', width: 180, editable: true },
        { field: 'sick_pay_cost', headerName: 'Koszt chorobowego', width: 150, editable: true },
    ];

    return <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        onCellEditStop={handleCellEdit}
        loading={loading}
        getRowClassName={getEmployeeRowClass}
        sx={{
            height: '100%',
            '& .row-missing-employee': {
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                },
            },
        }}
    />

}

export default Table;