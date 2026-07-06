import React from "react";

import {
    Card,
    CardContent,
    Grid,
    Typography,
    Divider,
    Chip,
} from "@mui/material";

const resolveOptionLabel = (optionsMap, field, value) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    const options = optionsMap?.[field];

    if (!Array.isArray(options)) {
        return value;
    }

    const option = options.find((opt) => String(opt.value) === String(value));

    return option?.label ?? value;
};

const Field = ({ label, value }) => (
    <Grid size={{ xs: 6, md: 3 }}>
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>

        <Typography variant="body2" fontWeight={500}>
            {value ?? "-"}
        </Typography>
    </Grid>
);

const JiraIssueResourceUsageInfo = ({ row, optionsMap }) => {
    if (!row) return null;

    const qty = Number(row.qty ?? 0);
    const unitCost = Number(row.unit_cost ?? 0);
    const cost = Number(row.cost_amount ?? qty * unitCost);

    const processLabel = resolveOptionLabel(optionsMap, "process_id", row.process_id);
    const resourceLabel = resolveOptionLabel(optionsMap, "resource_id", row.resource_id);

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Wiersz źródłowy
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Field label="Task" value={row.task} />

                    <Field label="Proces" value={processLabel} />

                    <Field label="Zasób" value={resourceLabel} />


                    <Field label="Ilość" value={qty.toFixed(4)} />

                    <Field label="Koszt jedn." value={unitCost.toFixed(4)} />

                    <Field label="Koszt" value={cost.toFixed(2)} />

                    <Field label="Dokument" value={row.doc_nr} />
                </Grid>
            </CardContent>
        </Card>
    );
};

export default JiraIssueResourceUsageInfo;