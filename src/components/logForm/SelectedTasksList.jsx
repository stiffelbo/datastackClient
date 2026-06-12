import React from "react";
import {
    Box,
    Stack,
    Typography,
    Alert,
    Fade,
    keyframes,
} from "@mui/material";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";


import TaskInfo from "./TaskInfo";
import InputNumber from "./InputNumber";
import InputText from "./InputText";


const pulseIn = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.22);
        border-color: rgba(211, 47, 47, 0.45);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(211, 47, 47, 0);
        border-color: rgba(211, 47, 47, 0.85);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(211, 47, 47, 0);
        border-color: rgba(211, 47, 47, 0.45);
    }
`;

function renderEmpty(emptyMessage, requiresTasks) {
    if (requiresTasks) {
        return (
            <Fade in>
                <Alert
                    severity="warning"
                    variant="outlined"
                    icon={<WarningAmberIcon fontSize="small" />}
                    sx={{
                        borderRadius: 2,
                        alignItems: "center",
                        bgcolor: "warning.50",
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Wymagane jest wskazanie taska
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Wybrany proces wymaga przypisania raportowanych danych do zadania.
                    </Typography>
                </Alert>
            </Fade>
        );
    }

    return (
        <Fade in>
            <Box
                sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "background.paper",
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <AssignmentTurnedInIcon
                        fontSize="small"
                        color="success"
                        sx={{ mt: 0.25 }}
                    />

                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Task nie jest wymagany
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            Wybrany proces może zostać zaraportowany bez wskazywania zadania.
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Fade>
    );
}

function getTaskKey(task) {
    return (
        task?.id ??
        task?.jiraId ??
        task?.jira_id ??
        task?.jiraKey ??
        task?.jira_key ??
        task?.key ??
        task?.task
    );
}

function renderTaskInputs(task, tasksHook, settings = {}) {
    const quantity = task?.report?.quantity ?? settings.qty?.initialValue ?? "";
    const quantityGood = task?.report?.quantityGood ?? settings.qtyGood?.initialValue ?? "";
    const quantityScrap = task?.report?.quantityScrap ?? settings.qtyScrap?.initialValue ?? "";
    const remarks = task?.report?.remarks ?? settings.remarks?.initialValue ?? "";

    return (
        <Stack spacing={1.5}>
            <Stack spacing={1} direction="row">
                {settings.qty?.show && (
                    <InputNumber
                        label={settings.qty.label}
                        value={quantity}
                        required={settings.qty.required}
                        disabled={settings.qty.disabled}
                        min={0}
                        step={1}
                        onChange={(value) =>
                            tasksHook.actions.setTaskQuantity(task, value)
                        }
                    />
                )}

                {settings.qtyGood?.show && (
                    <InputNumber
                        label={settings.qtyGood.label}
                        value={quantityGood}
                        required={settings.qtyGood.required}
                        disabled={settings.qtyGood.disabled}
                        min={0}
                        step={1}
                        onChange={(value) =>
                            tasksHook.actions.setTaskQuantityGood(task, value)
                        }
                    />
                )}

                {settings.qtyScrap?.show && (
                    <InputNumber
                        label={settings.qtyScrap.label}
                        value={quantityScrap}
                        required={settings.qtyScrap.required}
                        disabled={settings.qtyScrap.disabled}
                        min={0}
                        step={1}
                        onChange={(value) =>
                            tasksHook.actions.setTaskQuantityScrap(task, value)
                        }
                    />
                )}
            </Stack>

            {settings.remarks?.show && (
                <InputText
                    label={settings.remarks.label}
                    value={remarks}
                    onChange={(value) =>
                        tasksHook.actions.setTaskRemarks(task, value)
                    }
                    required={settings.remarks.required}
                    disabled={settings.remarks.disabled}
                    multiline
                    rows={4}
                    fullWidth
                />
            )}
        </Stack>
    );
}

function renderTaskItem(
    task,
    tasksHook,
    showDelete,
    settings,
    index,
    total
) {
    return (
        <Box key={getTaskKey(task)}>
            <TaskInfo
                data={task}
                onRemove={tasksHook.actions.removeTask}
                showDelete={showDelete}
                onMoveUp={() => tasksHook.actions.moveTaskUp(task)}
                onMoveDown={() => tasksHook.actions.moveTaskDown(task)}
                disableMoveUp={index === 0}
                disableMoveDown={index === total - 1}
                isList={true}
            >
                {renderTaskInputs(task, tasksHook, settings)}
            </TaskInfo>
        </Box>
    );
}

function renderList(taskItems, tasksHook, showDelete, settings) {
    return (
        <Stack spacing={1}>
            {taskItems.map((task, index) =>
                renderTaskItem(task, tasksHook, showDelete, settings, index, taskItems.length)
            )}
        </Stack>
    );
}

export default function SelectedTasksList({
    tasks,
    emptyMessage = "Brak dodanych tasków.",
    sx = {},
    showDelete = true,
    settings = {}
}) {
    const taskItems = tasks?.state?.tasks ?? [];
    const requiresTasks = settings?.meta?.requiresTasks;

    const isEmpty = !Array.isArray(taskItems) || taskItems.length === 0;
    const shouldPulse = isEmpty && requiresTasks;

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: shouldPulse ? "warning.main" : "divider",
                borderRadius: 2,
                p: 2,
                bgcolor: shouldPulse ? "warning.50" : "grey.50",
                animation: shouldPulse
                    ? `${pulseIn} 1.8s ease-in-out infinite`
                    : "none",
                transition: "all 180ms ease",
                ...sx,
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Wybrane taski
                </Typography>

                {isEmpty && (
                    <Typography
                        variant="caption"
                        color={requiresTasks ? "warning.dark" : "text.secondary"}
                        sx={{ fontWeight: 600 }}
                    >
                        {requiresTasks ? "Wymagane" : "Opcjonalne"}
                    </Typography>
                )}
            </Stack>

            {isEmpty
                ? renderEmpty(emptyMessage, requiresTasks)
                : renderList(taskItems, tasks, showDelete, settings)}
        </Box>
    );
}