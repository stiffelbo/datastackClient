import React, { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import http from "../../http"; // popraw ścieżkę jeśli trzeba

import { mapJiraTaskResponseToDto } from "./dto/jiraTaskDto.js";
import TaskInfo from "./TaskInfo";

const TASK_KEY_REGEX = /^[A-Z]+-\d+$/;

function normalizeTaskKey(value = "") {
    return value.trim().toUpperCase();
}

function isValidTaskKey(value = "") {
    return TASK_KEY_REGEX.test(normalizeTaskKey(value));
}

const JiraTaskLookup = ({
    endpoint = "/jira_issue/jira.php?jira_key=",
    onAdd,
    buttonLabel = "Sprawdź",
    addLabel = "Dodaj",
    placeholder = "Np. KON-3456",
    autoClearOnAdd = true,
    sx = {}
}) => {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);
    const [serverError, setServerError] = useState("");

    const normalizedValue = useMemo(() => normalizeTaskKey(value), [value]);
    const isValid = useMemo(() => isValidTaskKey(normalizedValue), [normalizedValue]);
    const isDisabled = loading;

    const handleChange = (event) => {
        const nextValue = normalizeTaskKey(event.target.value);
        setValue(nextValue);
        setServerError("");
        setServerData(null);
    };

    const handleClear = () => {
        if (loading) return;
        setValue("");
        setServerError("");
        setServerData(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setServerError("");
        setServerData(null);

        if (!isValid) {
            setServerError("Nieprawidłowa sygnatura taska. Użyj formatu np. KON-3456.");
            return;
        }

        try {
            setLoading(true);
            const fullEndpoint = `${endpoint}${encodeURIComponent(normalizedValue)}`;
            const response = await http.get(fullEndpoint);

            setServerData(response);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Nie udało się pobrać taska z serwera.";
            setServerError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        if (!serverData || typeof onAdd !== "function") return;

        onAdd(mapJiraTaskResponseToDto(serverData));

        if (autoClearOnAdd) {
            setValue("");
            setServerData(null);
            setServerError("");
        }
    };

    return (
        <Stack spacing={2} sx={sx}>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack direction="row" spacing={1} alignItems="stretch">
                    <TextField
                        fullWidth
                        size="small"
                        label="Sygnatura taska Jira"
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        disabled={isDisabled}
                        error={Boolean(serverError)}
                        helperText={
                            serverError
                                ? serverError
                                : ""
                        }
                        inputProps={{
                            autoCapitalize: "characters",
                            spellCheck: false,
                        }}
                        InputProps={{
                            endAdornment: value ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        onClick={handleClear}
                                        disabled={isDisabled}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                    />

                    <IconButton
                        type="submit"
                        size="small"
                        variant="contained"
                        disabled={isDisabled || !normalizedValue}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    </IconButton>
                </Stack>
            </Box>

            <TaskInfo data={mapJiraTaskResponseToDto(serverData)} onAdd={handleAdd} />
        </Stack>
    );
};

export default JiraTaskLookup;