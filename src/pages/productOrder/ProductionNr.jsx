import React, { useEffect, useState } from 'react';

import http from '../../http';

import { Box, Button, CircularProgress, Tooltip, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const ProductionNr = ({ id, value, onChange }) => {
    console.log(id, value);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setError(null);
        setLoading(false);
    }, [id]);

    const handleGenerate = async () => {
        if (!id || value || loading) return;

        setLoading(true);
        setError(null);

        try {
            const res = await http.post('/product_order/orderNumber.php', { id });
            const generated = res.order_number;

            if (!generated) {
                throw new Error('Serwer nie zwrócił numeru produkcyjnego.');
            }

            onChange?.(generated);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Nie udało się nadać numeru.');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (value) {
            return <Typography variant="body2">{value}</Typography>;
        }

        return (
            <Tooltip title="Numer produkcyjny zostanie nadany na stałe">
                <span>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={14} /> : <AddCircleOutlineIcon />}
                        onClick={handleGenerate}
                        disabled={!id || loading}
                        sx={{ textTransform: 'none', fontSize: 12, py: 0.3 }}
                    >
                        {loading ? 'Nadawanie...' : 'Nadaj numer'}
                    </Button>
                </span>
            </Tooltip>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
            {renderContent()}

            {error && (
                <Typography variant="caption" color="error">
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default ProductionNr;