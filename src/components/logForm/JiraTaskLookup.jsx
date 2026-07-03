import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    CircularProgress,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Chip,
    Typography,
    Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import http from "../../http";

import { mapJiraTaskResponseToDto, getTaskIdentity } from "./dto/jiraTaskDto.js";
import TaskInfo from "./TaskInfo";
import InputSelectObject from "./InputSelectObject";

const TASK_KEY_REGEX = /^[A-Z]+-\d+$/;

function normalizeTaskKey(value = "") {
    return value.trim().toUpperCase();
}

function isValidTaskKey(value = "") {
    return TASK_KEY_REGEX.test(normalizeTaskKey(value));
}

function packRecentTaskResponse(task) {
    if (!task || typeof task !== "object") return null;

    return {
        id: task.id ?? null,
        existing: task,
        data: task,
    };
}


function TooltipContent({ option }) {
    const task = option.meta;

    if (!task) return null;

    return (
        <Box sx={{ maxWidth: 360, backgroundColor: "white", color: 'black', p:1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
                {task.jiraKey}
            </Typography>

            <Typography
                variant="body2"
                sx={{ mt: 0.5, mb: 1 }}
            >
                {task.name}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
            >
                {task.status && (
                    <Chip
                        size="small"
                        label={task.status}
                        color="primary"
                        variant="outlined"
                    />
                )}

                {task.productGroup && (
                    <Chip
                        size="small"
                        label={task.productGroup}
                        color="success"
                        variant="outlined"
                    />
                )}

                {task.jiraProjectLabel && (
                    <Chip
                        size="small"
                        label={task.jiraProjectLabel}
                        color="secondary"
                        variant="outlined"
                    />
                )}
            </Stack>

            {task.jiraParentKey && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 1 }}
                >
                    Parent: {task.jiraParentKey}
                </Typography>
            )}
        </Box>
    );
}


const JiraTaskLookup = ({
    endpoint = "/jira_issue_user_logs/jira.php?jira_key=",
    recentTasksEndpoint = "/jira_issue_user_logs/getRecentTasks.php",
    onAdd,
    placeholder = "Np. KON-3456",
    autoClearOnAdd = true,
    sx = {},
}) => {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [serverData, setServerData] = useState(null);
    const [serverError, setServerError] = useState("");

    const [recentTasks, setRecentTasks] = useState([]);
    const [recentTaskId, setRecentTaskId] = useState("");
    const [recentLoading, setRecentLoading] = useState(false);

    const normalizedValue = useMemo(() => normalizeTaskKey(value), [value]);
    const isValid = useMemo(() => isValidTaskKey(normalizedValue), [normalizedValue]);

    const recentTaskDtos = useMemo(() => {
        return recentTasks
            .map((task) => mapJiraTaskResponseToDto(packRecentTaskResponse(task)))
            .filter(Boolean);
    }, [recentTasks]);

    const recentTaskOptions = useMemo(() => {
        return recentTaskDtos.map((task) => {
            const id = getTaskIdentity(task);

            return {
                id,
                val: task.jiraKey || task.name || `Task ${id}`,
                label: task.jiraKey || task.name || `Task ${id}`,
                title: task.name || "",
                meta: task,
                group: task.jiraProjectLabel || task.productGroup || "Ostatnie taski",
                taskGroup: "Ostatnio raportowane / zmieniane",
                taskGroupOrder: 1,
            };
        });
    }, [recentTaskDtos]);

    useEffect(() => {
        let active = true;

        const fetchRecentTasks = async () => {
            try {
                setRecentLoading(true);

                const response = await http.get(recentTasksEndpoint);

                if (!active) return;

                const items = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                        ? response.data
                        : [];

                setRecentTasks(items);
            } catch {
                if (active) {
                    setRecentTasks([]);
                }
            } finally {
                if (active) {
                    setRecentLoading(false);
                }
            }
        };

        fetchRecentTasks();

        return () => {
            active = false;
        };
    }, [recentTasksEndpoint]);

    const handleChange = (event) => {
        setValue(normalizeTaskKey(event.target.value));
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
        const dto = mapJiraTaskResponseToDto(serverData);

        if (!dto || typeof onAdd !== "function") return;

        onAdd(dto);

        if (autoClearOnAdd) {
            setValue("");
            setServerData(null);
            setServerError("");
        }
    };

    const handleRecentTaskSelect = (selectedId) => {
        setRecentTaskId(selectedId);

        const selectedTask = recentTaskDtos.find(
            (task) => String(getTaskIdentity(task)) === String(selectedId)
        );

        if (!selectedTask || typeof onAdd !== "function") return;

        onAdd(selectedTask);

        if (autoClearOnAdd) {
            setRecentTaskId("");
            setValue("");
            setServerData(null);
            setServerError("");
        }
    };

    return (
        <Stack spacing={2} sx={sx}>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                        fullWidth
                        size="small"
                        label="Sygnatura taska Jira"
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChange}
                        disabled={loading}
                        error={Boolean(serverError)}
                        helperText={serverError || ""}
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
                                        disabled={loading}
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
                        disabled={loading || !normalizedValue}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    </IconButton>

                    <Box sx={{ minWidth: 320 }}>
                        <InputSelectObject
                            name="recentJiraTask"
                            label={recentLoading ? "Ładowanie..." : "Ostatnie taski"}
                            value={recentTaskId}
                            onChange={handleRecentTaskSelect}
                            selectOptions={recentTaskOptions}
                            disabled={recentLoading || recentTaskOptions.length === 0}
                            tooltipContent={TooltipContent}
                        />
                    </Box>
                </Stack>
            </Box>

            <TaskInfo
                data={mapJiraTaskResponseToDto(serverData)}
                onAdd={handleAdd}
                parent="search"
            />
        </Stack>
    );
};

export default JiraTaskLookup;