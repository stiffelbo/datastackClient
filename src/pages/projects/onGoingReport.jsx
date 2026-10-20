import React, { useState, useEffect } from 'react';

// Components
import { Box, TextField } from '@mui/material';
import PowerTable from '../../components/powerTable/powerTable';
import http from '../../http';
import { useRwd } from '../../context/RwdContext';

const entityName = 'ongoingProduction';

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const processData = (data) => {
    return data.map(i => ({ 'link' : `http://192.168.1.234/asana_generator/pages/Project/index.php?id=${i.id}`, ...i }));
}

const Dashboard = () => {

    const [data, setData] = useState([]);
    const [dateOn, setDateOn] = useState(getToday);
    const [loading, setLoading] = useState(false);

    const rwd = useRwd();

    const endpoint = '/reports/gem/productionOngoing.php';

    const fetchData = async () => {

        if (!dateOn) {
            setData([]);
            return;
        }

        setLoading(true);

        try {

            const result = await http.get(endpoint, {
                params: {
                    dateOn: dateOn,
                    productType: 106
                }
            });

            setData(processData(result.data) ?? []);

        } catch (error) {

            console.error('Production ongoing report error:', error);
            setData([]);

        } finally {

            setLoading(false);
        }
    };


    /*
     * Pobieramy dane po zmianie daty
     */
    useEffect(() => {
        fetchData();
    }, [dateOn]);

    return (
        <Box>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mt: 2
                }}
            >
                <TextField
                    label="Stan produkcji na dzień"
                    type="date"
                    value={dateOn}
                    onChange={(e) => setDateOn(e.target.value)}
                    size="small"
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                />
            </Box>

            <PowerTable
                entityName={entityName}
                data={data}
                loading={loading}
                height={rwd.height - 136}
                onRefresh={fetchData}
            />

        </Box>
    );
};

export default Dashboard;