import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { parseXLSX } from '../../../utils/parseXLSX'

//Services
import { uploadSalariesData } from '../../../services/salaries/upload';
import { getPeriods } from '../../../services/periods/getPeriods';
import { updateHourRates } from '../../../services/periods/updateHourRates';
import { getEmployees } from '../../../services/employees/getEmployees';

//Mui
import { Box } from '@mui/material';

//COMP
import Table from './Table';
import Sidebar from './SideBar';

//Utils
import {getEmployeeOptions, processData, buildEmployeeMap, matchEmployee } from './utils';

const UploadSalaries = () => {
    //Data
    const [rows, setRows] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [periodID, setPeriodID] = useState(null);
    const [employees, setEmployees] = useState([]);
    //UI
    const [loading, setLoading] = useState(false);

    const populate = async () => {
        setLoading(true);
        try {
            const [empRes, periodRes] = await Promise.all([
                getEmployees(),
                getPeriods()
            ]);

            setEmployees(empRes.data || []);
            setPeriods(periodRes.data || []);
        } catch (error) {
            console.error('❌ Błąd podczas pobierania danych pomocniczych:', error);
            toast.error('Nie udało się pobrać danych pomocniczych (pracownicy / okresy)');
        } finally {
            setLoading(false);
        }
    };

    //Effects
    useEffect(() => {
        populate();
    }, []);

    const handleFiles = async (event) => {
        const files = Array.from(event.target.files);
        const allData = [];
        for (const file of files) {
            try {
                const data = await parseXLSX(file);
                allData.push(...data);
            } catch (err) {
                console.error('Błąd podczas parsowania:', err);
            }
        }
        setRows(processData(allData, employees));
    };

    const handleDelete = (id) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const handleUpload = async () => {
        setLoading(true);
        try {
            const data = await uploadSalariesData(rows, periodID);
            const result = await  updateHourRates();
            console.log(result);
            setRows([]);
            toast.success('✅ Wysłano dane!');
        } catch (err) {
            console.error(err);
            toast.error('❌ Błąd podczas wysyłania danych!');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (params) => {
        const { id, field, value } = params;
        console.log( id, field, value );
        // Jeśli edytujemy employee_name → przelicz całość
        const currentRows = [...rows];
        const updated = currentRows.map((row) =>{
            if(+row.id === +id){
                if(field === 'employee_name'){
                    const employeeMap = buildEmployeeMap(employees);
                    const employee_id = matchEmployee(value, employeeMap);
                    return { ...row, [field]: value, employee_id };
                }else{
                    return { ...row, [field]: value };
                }
            }else{
                return row;
            }
        });

        console.log(updated);

        setRows(updated);
    };

    //Derived data

    const employeeOptions = getEmployeeOptions(employees);

    return (
        <Box display="flex" height="calc(100vh - 88px)" mt={0.5}>
           <Sidebar 
                rows={rows}
                setRows={setRows}
                loading={loading}
                periods={periods}
                periodID={periodID}
                setPeriodID={setPeriodID}
                onUpload={handleUpload}
                onInputFiles={handleFiles}
            />
            <Box flex={1} overflow="hidden">
                <Table
                    rows={rows}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    employeesOptions={employeeOptions}
                    loading={loading}
                />
            </Box>
        </Box>
    );
};

export default UploadSalaries;
