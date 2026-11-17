import React from "react";
import { Box, Alert, Stack, Button, Typography } from "@mui/material";

import useEntity from "../../../hooks/useEntity";
import useProductionTasksManager from "./hooks/useProductionTasksManager";

const ProductionTasksManager = ({ issue = null, product_order = null }) => {

    const entity = useEntity({
        entityName: 'JiraIssueProductionTasks',
        endpoint: '/jira_issue_production_tasks/',
        query: {issue_id : issue, product_order_id : product_order}, //to nam dostarcza wierszy tasków
        schemaQuery : {issue_id : issue, product_order_id : product_order} //to nam dostarcza opcji oraz schemat
    });

    const production = useProductionTasksManager({ entity });

    if (!issue && !product_order) {
        return <Alert severity="warning">Brak kontekstu zlecenia.</Alert>;
    }

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    Marszruta produkcyjna
                </Typography>

                <Button size="small" variant="outlined" onClick={() => production.ui.openPanel('processes')}>
                    + Proces
                </Button>

                <Button size="small" variant="outlined" onClick={() => production.ui.openPanel('routes')}>
                    Marszruty
                </Button>

                <Button size="small" variant="outlined" onClick={() => production.bulk.estimate()}>
                    Przelicz
                </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
                Zadania: {production.tasks.length}
            </Typography>

            {/* ProductionTasksList */}
            {/* ProductionTasksPanel */}
        </Box>
    );
};

export default ProductionTasksManager;