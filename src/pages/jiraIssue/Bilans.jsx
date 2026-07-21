// pages/Employees/Bilans.jsx
import React, { useState, useEffect } from 'react';

import http from '../../http';
import useEntity from '../../hooks/useEntity';

import {
    Box,
    Paper,
    Typography,
    Alert
} from '@mui/material';

import PowerTable from '../../components/powerTable/powerTable';
import Manual from '../../components/Manual';

const Bilans = ({ data, rwd }) => {

    const [report, setReport] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('Karta'); //Tabela, Karta

    const entity = useEntity({ entityName: 'JiraIssueCots', schemaOnly: 'true', endpoint: '/jira_issue_costs/' });

    useEffect(() => {
        if (data?.id) {
            fetchBilans(data.id);
        }
    }, [data.id]);

    const fetchBilans = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const { data } = await http.get('/jira_issue_costs/get.php?id=' + id);
            setReport(data);
        } catch (err) {
            if (err.response) {
                // Backend zwrócił błąd (np. 403, 404, 500)
                setError(err.response.data?.message || `Błąd ${err.response.status}`);
            } else if (err.request) {
                // Brak odpowiedzi z serwera
                setError('Brak odpowiedzi z serwera.');
            } else {
                // Inny błąd
                setError(err.message || 'Wystąpił nieznany błąd.');
            }

            setReport({});
        } finally {
            setLoading(false);
        }
    };
    // ====== RENDER ======
    return (
        <Box
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                height: '100%',
                position: 'relative',
            }}
        >
            <PowerTable
                data={report?.costs}
                height={rwd.height - 200}
                entityName="JiraIssueBilans"
                columnSchema={entity.schema.columns}
                loading={loading}
                onRefresh={() => fetchBilans(data.id)}
            />

            <Box
                sx={{
                    position: 'absolute',
                    left: 28,
                    bottom: 28,
                }}
            >
                <Manual
                    label="Opis działania rozliczenia"
                    name="JiraIssueCostsDoc"
                />
            </Box>
        </Box>
    );
};

export default Bilans;
