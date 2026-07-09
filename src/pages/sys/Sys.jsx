import React, {useState, useEffect} from 'react';

import http from '../../http';
import { useRwd } from '../../context/RwdContext';

import PowerTable from '../../components/powerTable/powerTable';
import InputSelectObject from '../../components/logForm/InputSelectObject';

import { Box, Typography, Stack } from '@mui/material';

const Dashboard = () => {

    const [loading, setLoading] = useState(false);
    const [tables, setTables] = useState([]);
    const [table, setTable] = useState(null);
    const [columns, setColumns] = useState([]);

    const rwd = useRwd();
    
    const fetchTables = async () => {
        const url = '/sys/get.php';
        setLoading(true);
        const res = await http.get(url);
        setTables(res);
        setLoading(false);
    }

    const fetchColumns = async (name) => {
        if(!name) return;
        const url = '/sys/get.php?tableName='+name;
        setLoading(true);
        const res = await http.get(url);
        setColumns(res);
        setLoading(false);
    }

    const renderTablesList = () => {
        return <InputSelectObject 
            value={table}
            onChange={v=> setTable(v)}
            selectOptions={tables.map(i => ({id : i,value: i, label: i}))}
        />
    }

    useEffect(()=>{
        fetchTables();
    }, []);

    useEffect(()=>{
        fetchColumns(table);
    }, [table]);

    return (
        <Box>
            <Stack direction={'row'} p={1}>
                <Typography sx={{mr: 2, pt: 1}}>{table}</Typography>
                {renderTablesList()}
            </Stack>
            <PowerTable 
                entityName='Sys'
                loading={loading}
                data={columns}
                height={rwd.height - 128}            
            />
        </Box>
    );
};

export default Dashboard;
