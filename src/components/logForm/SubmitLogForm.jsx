import React from "react";

import { Button, LinearProgress } from "@mui/material";

import SaveResultSummary from "./SaveResultSummary";

const SubmitLogForm = ({ dataErrors = null, logError = null, result = null, loading = false, onSave = null, onClear = null, sx = { width: '100%' } }) => {

    if (!dataErrors.length && !logError && !result) {
        if (loading) {
            return <LinearProgress />
        } else {
            return <Button
                color='primary'
                onClick={onSave}
                size="small"
                sx={{ ...sx }}
            >
                Wprowadź dane
            </Button>
        }
    }

    if (logError) {
        return <Button
            color='error'
            onClick={onClear}
            size="small"
            sx={{ ...sx }}
        >
            Błąd podczas zapisu danych
        </Button>
    }
    if (result) {
        return <SaveResultSummary result={result} onClear={onClear} />
    }

}

export default SubmitLogForm;
