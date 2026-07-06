import React, { useState } from "react";

// MUI
import {
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
    Alert,
} from "@mui/material";

import { toast } from "react-toastify";

import http from "../../http";

import JiraIssueResourceUsageInfo from "./JiraIssueResourceUsageInfo";
import RenderLink from "../jiraIssue/RenderLink";

const JiraIssueResourceUsageSplit = ({ id, row, entity, rwd, dashboard }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resultID, setResultID] =  useState(null);
    const [qty, setQty] = useState("");
    const [docNr, setDocNr] = useState("");

    const sourceQty = Number(row?.qty ?? 0);

    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    };

    if(!row.is_active){
        return <Alert severity="error">Wpis zamknięty nie mozna dzielić</Alert>
    }

    const validateQty = (value) => {
        const num = Number(value);

        if (!Number.isFinite(num)) {
            return "Podaj poprawną liczbę.";
        }

        if (num <= 0) {
            return "Ilość wydzielana musi być większa od 0.";
        }

        if (num >= sourceQty) {
            return "Ilość wydzielana musi być mniejsza od ilości wiersza.";
        }

        return null;
    };

    const splitRowRequest = async () => {
        const validationError = validateQty(qty);

        if (validationError) {
            setError(validationError);
            toast.warning(validationError);
            return;
        }

        const endpoint = "/jira_issue_resource_usage_log/split.php";

        const payload = {
            id,
            splitQty: Number(qty),
            docNr: docNr
        };

        setLoading(true);
        setError(null);

        try {
            const response = await http.put(endpoint, payload);
            if(response?.ok){
                entity.getOne(response.sourceId);
                entity.getOne(response.newId);
                setResultID(response.newId);
                setLoading(false);
            }
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Nie udało się podzielić wiersza.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSplitQuantity = (event) => {
        const value = event.target.value;

        setQty(value);

        const validationError = validateQty(value);
        setError(validationError);
    };

    const remainingQty =
        qty !== "" && !validateQty(qty)
            ? Number((sourceQty - Number(qty)).toFixed(4))
            : null;

    return (
        <Box
            sx={{
                width: "100%",
                p: 2,
            }}
        >
            <JiraIssueResourceUsageInfo row={row} optionsMap={entity.schema.options}/>
            <Stack spacing={2}>
                <Typography variant="h6">
                    Podziel wiersz zużycia
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Ilość źródłowa: <strong>{sourceQty}</strong>
                </Typography>

                <TextField
                    label="Ilość do wydzielenia"
                    type="number"
                    value={qty}
                    onChange={handleSplitQuantity}
                    disabled={loading}
                    error={Boolean(error)}
                    helperText={error || "Nowy wiersz otrzyma tę ilość."}
                    inputProps={{
                        min: 0,
                        max: sourceQty,
                        step: 0.0001,
                    }}
                    fullWidth
                />
                <TextField
                    label="Nr Dokumentu nowego wiersza"
                    type="text"
                    value={docNr}
                    onChange={e => setDocNr(e.target.value)}
                    disabled={loading}
                    error={Boolean(error)}
                    helperText={error || "Nowy wiersz otrzyma ten nr dokumentu"}
                    fullWidth
                />

                {remainingQty !== null && (
                    <Alert severity="info">
                        Po podziale obecny wiersz będzie miał ilość{" "}
                        <strong>{remainingQty}</strong>, a nowy wiersz{" "}
                        <strong>{Number(qty)}</strong>.
                    </Alert>
                )}

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Anuluj
                    </Button>

                    <Button
                        variant="contained"
                        onClick={splitRowRequest}
                        disabled={loading || Boolean(validateQty(qty))}
                        startIcon={
                            loading ? <CircularProgress size={16} /> : null
                        }
                    >
                        Podziel
                    </Button>
                </Stack>
            </Stack>
           
        </Box>
    );
};

export default JiraIssueResourceUsageSplit;