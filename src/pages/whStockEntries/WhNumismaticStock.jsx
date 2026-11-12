import React from "react";

import useEntity from "../../hooks/useEntity";
import PowerTable from "../../components/powerTable/powerTable";

import { Alert, Box } from "@mui/material";

const WhNumismaticStock = ({numismatic_id = null, contractor_id = null}) => {
    const entity = useEntity({ endpoint: 'wh_stock_entries', entityName: 'WhNumismaticStock', query: { numismatic_id, contractor_id } });
    
    if(!entity.rows.length) return <Alert severity="info" sx={{mt:2}}>Brak informacji o stanie magazynowym</Alert>
    return (
        <Box sx={{ width: '100%', height: '100%', overflow: 'auto', mt: 2 }}>
            <PowerTable 
                entity={"WhNumismaticStock"}
                data={entity.rows}
                loading={entity.loading}
                onRefresh={entity.refresh}
            />
        </Box>
    );
}

export default WhNumismaticStock;