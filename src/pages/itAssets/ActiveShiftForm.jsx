import React, { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    Typography,
    Chip,
} from "@mui/material";

const toDateInputValue = (value) => {
    if (!value) return "";

    if (typeof value === "string" && value.length >= 10) {
        return value.slice(0, 10);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
};

const toSqlDateTime = (date) => {
    if (!date) return null;
    return `${date} 00:00:00`;
};

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("pl-PL");
};

const getEmployeeLabel = (data) => {
    return (
        data?.employeeName ||
        data?.pracownikName ||
        data?.employee_label ||
        data?.label ||
        (data?.id_employee ? `Pracownik #${data.id_employee}` : "—")
    );
};

const getCreatedByLabel = (data) => {
    return (
        data?.createdByName ||
        data?.userName ||
        data?.created_by_label ||
        (data?.created_by ? `Użytkownik #${data.created_by}` : "—")
    );
};

export default function ActiveShiftForm({ data = {}, onSubmit = null, loading = false }) {
    const [dateTo, setDateTo] = useState("");
    const [touched, setTouched] = useState(false);

    const dateFromInput = useMemo(() => toDateInputValue(data?.date_from), [data?.date_from]);
    const employeeLabel = useMemo(() => getEmployeeLabel(data), [data]);
    const createdByLabel = useMemo(() => getCreatedByLabel(data), [data]);

    const validationError = useMemo(() => {
        if (!dateTo) return "Podaj datę zakończenia wydania.";

        if (!dateFromInput) return "Brak poprawnej daty rozpoczęcia wydania.";

        const from = new Date(`${dateFromInput}T00:00:00`);
        const to = new Date(`${dateTo}T00:00:00`);

        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            return "Niepoprawny format daty.";
        }

        if (to <= from) {
            return "Data zakończenia musi być późniejsza niż data rozpoczęcia.";
        }

        return null;
    }, [dateFromInput, dateTo]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setTouched(true);

        if (loading || validationError) {
            return;
        }

        const payload = {
            id: data?.id ?? null,
            date_to: toSqlDateTime(dateTo),
            is_active: 0,
        };

        if (typeof onSubmit === "function") {
            await onSubmit(payload);
        }
    };

    const isActive = Number(data?.is_active) === 1 && !data?.date_to;

    if (!data?.id) {
        return (
            <Alert severity="info">
                Brak aktywnego wydania do zamknięcia.
            </Alert>
        );
    }

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                >
                    <Typography variant="h6">
                        Aktywne wydanie
                    </Typography>

                    <Chip
                        size="small"
                        color={isActive ? "success" : "default"}
                        label={isActive ? "Aktywne" : "Nieaktywne"}
                    />
                </Stack>

                <Stack spacing={1}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Pracownik
                        </Typography>
                        <Typography variant="body1">
                            {employeeLabel}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Data rozpoczęcia
                        </Typography>
                        <Typography variant="body1">
                            {formatDate(data?.date_from)}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Dodał
                        </Typography>
                        <Typography variant="body2">
                            {createdByLabel}
                        </Typography>
                    </Box>

                    {!!data?.comment && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Komentarz
                            </Typography>
                            <Typography variant="body2">
                                {data.comment}
                            </Typography>
                        </Box>
                    )}
                </Stack>

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="Data zakończenia"
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            onBlur={() => setTouched(true)}
                            disabled={loading || !isActive}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(touched && validationError)}
                            helperText={touched && validationError ? validationError : " "}
                            inputProps={{
                                min: dateFromInput || undefined,
                            }}
                        />

                        {!isActive && (
                            <Alert severity="info">
                                To wydanie jest już zamknięte.
                            </Alert>
                        )}

                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                            <Button
                                type="submit"
                                variant="contained"
                                color="warning"
                                disabled={loading || !isActive || Boolean(validationError)}
                                startIcon={loading ? <CircularProgress size={16} /> : null}
                            >
                                {loading ? "Zapisywanie..." : "Zamknij wydanie"}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Paper>
    );
}