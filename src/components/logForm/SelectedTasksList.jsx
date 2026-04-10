import React from "react";
import {
    Box,
    Stack,
    Typography,
} from "@mui/material";

import TaskInfo from "./TaskInfo";
import InputNumber from "./InputNumber";
import InputText from "./InputText";

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

function renderTaskItem(task, onRemove, onQuantityChange, onRemarksChange) {
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
                >
                    <Stack spacing={1}>
                        <InputNumber
                            label="Ilość do raportu"
                            value={quantity}
                            required={task?.report?.requiresQuantity}
                            min={0}
                            step={1}
                            onChange={(value) => onQuantityChange?.(task, value)}
                        />    
                        <InputText
                            label="Komentarz"
                            value={task?.report?.remarks ?? ""}
                            onChange={(value) => onRemarksChange?.(task, value)}
                            required={task?.report?.requiresRemarks}
                            multiline={true}
                            rows={4}
                            fullWidth
                        />
                    </Stack>
                                   
                </TaskInfo>                    
            </Stack>
        </Box>
    );
}

function renderList(tasks, onRemove, onQuantityChange, onRemarksChange) {
    return (
        <Stack spacing={1}>
            {tasks.map((task) =>
                renderTaskItem(task, onRemove, onQuantityChange, onRemarksChange)
            )}
        </Stack>
    );
}

export default function SelectedTasksList({
    tasks = [],
    onRemove,
    onQuantityChange,
    onRemarksChange,
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
                : renderList(tasks, onRemove, onQuantityChange, onRemarksChange)}
        </Box>
    );
}