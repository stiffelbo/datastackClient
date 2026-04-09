import React from "react";
import {
    Box,
    Stack,
    Typography,
} from "@mui/material";

import TaskInfo from "./TaskInfo";
import InputNumber from "./InputNumber";

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

function renderEmpty(emptyMessage) {
    return (
        <Typography variant="body2" color="text.secondary">
            {emptyMessage}
        </Typography>
    );
}

function renderTaskItem(task, onRemove, onQuantityChange) {
    const quantity = task?.report?.quantity ?? "";

    return (
        <Box
            key={getTaskKey(task)}
            sx={{
                borderRadius: 2,
                overflow: "hidden",
            }}
        >
            <Stack spacing={0.75}>
                <TaskInfo
                    data={task}
                    onRemove={onRemove}
                    sx={{
                        bgcolor: "success.lighter",
                        borderColor: "success.light",
                    }}
                >
                    <InputNumber
                        label="Ilość do raportu"
                        value={quantity}
                        min={0}
                        step={1}
                        onChange={(value) => onQuantityChange?.(task, value)}
                    />                    
                </TaskInfo>                    
            </Stack>
        </Box>
    );
}

function renderList(tasks, onRemove, onQuantityChange) {
    return (
        <Stack spacing={1}>
            {tasks.map((task) =>
                renderTaskItem(task, onRemove, onQuantityChange)
            )}
        </Stack>
    );
}

export default function SelectedTasksList({
    tasks = [],
    onRemove,
    onQuantityChange,
    emptyMessage = "Brak dodanych tasków.",
}) {
    const isEmpty = !Array.isArray(tasks) || tasks.length === 0;

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                bgcolor: "grey.50",
            }}
        >
            <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 600 }}
            >
                Wybrane taski
            </Typography>

            {isEmpty
                ? renderEmpty(emptyMessage)
                : renderList(tasks, onRemove, onQuantityChange)}
        </Box>
    );
}