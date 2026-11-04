import React from 'react';
import { Box } from '@mui/material';
import { createRenderInput } from '../../components/common/RenderInput';

export default function Shipping({ form, validation }) {
    const renderInput = createRenderInput(form);
    return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, minmax(0,1fr))' }, gap: 2 }}>
            {renderInput('contractor_id')}
            {renderInput('shipping_method_id')}
            {renderInput('done_at')}
            {renderInput('status_id')}
        </Box>
        {renderInput('notes')}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, minmax(0,1fr))' }, gap: 2 }}>
            {renderInput('weight_kg')}
            {renderInput('length_cm')}
            {renderInput('width_cm')}
            {renderInput('height_cm')}
        </Box>
        {renderInput('shipping_label_no')}
    </Box>);
}
