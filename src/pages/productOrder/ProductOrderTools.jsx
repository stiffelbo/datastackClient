import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import ProductOrderPage from './ProductOrderPage';

const RenderTools = ({ value }) => {
    if (!value) return null;

    let tools = [];

    try {
        tools = Array.isArray(value) ? value : JSON.parse(value);
    } catch {
        return null;
    }

    if (!Array.isArray(tools) || tools.length === 0) {
        return (
            <Typography variant="body2" color="text.disabled">
                —
            </Typography>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tools.map((tool, index) => (
                <Chip
                    key={`${tool}-${index}`}
                    label={tool}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: 24,
                        borderRadius: 1.5,
                    }}
                />
            ))}
        </Box>
    );
};

const entityName = "ProductOrderTools";
const basePath = "/productordertools";
const endpoint = "/gem_tools/";

const Dashboard = () => {
    const entity = useEntity({ entityName, endpoint });
    
        const columns = entity.schema.columns.map(c => {
            if(c?.field === "tools") {
                return {...c, renderCell : params => <RenderTools value={params.value} />}
            }else{
                return c;
            }
        });
    
        entity.schema.columns = columns;
    return (
        <BaseEntityDashboard
            renderPage={(props) => (
                <ProductOrderPage
                    entity={entity}
                    entityName={entityName}
                    {...props}
                />
            )}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;

//Proteza dashboard dla Maćka i produkcji dla przegladu zamówień bez narżedzi i zadań