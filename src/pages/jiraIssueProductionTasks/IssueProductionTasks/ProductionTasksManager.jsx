
import React from "react";

import { Box, Alert } from "@mui/material";

import useEntity from "../../../hooks/useEntity";
import useProductionTasksManager from "./hooks/useProductionTasksManager";
import { schemaDto } from "./dto/schemaDto";

import ProductionTasksManagerNavigation from "./ProductionTasksManagerNavigation";
import ProductionTasksLayoutManager from "./ProductionTasksLayoutManager";

const ProductionTasksManager = ({ issue = {}, product_order = {}, rwd }) => {
    const issue_id = issue?.id;
    const product_order_id = product_order?.id;
    const context = {};

    const entity = useEntity({
        entityName: 'JiraIssueProductionTasks',
        endpoint: '/jira_issue_production_tasks/',
        query: { issue_id, product_order_id },
        schemaQuery: { issue_id, product_order_id },
    });

    const columns = entity?.schema?.columns;

    const processedSchema = schemaDto({ schema: entity?.schema });

    const production = useProductionTasksManager({
        entity,
        processedSchema,
    });

    if (!issue_id && !product_order_id) {
        return <Alert severity="warning">Brak kontekstu zlecenia.</Alert>;
    }

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: '100%',
                height: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'scroll',
            }}
        >
            <ProductionTasksManagerNavigation production={production} />

            <ProductionTasksLayoutManager production={production} rwd={rwd} />
        </Box>
    );
};

export default ProductionTasksManager;
