import React from "react";
import {
    Box,
    Stack,
    Typography,
    Alert,
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

function renderEmpty(emptyMessage, requiresTasks) {
    if (requiresTasks) {
        return (
            <Alert severity="warning" variant="outlined">
                {emptyMessage}
            </Alert>
        );
    }

    return (
        <Typography variant="body2" color="text.secondary">
            {emptyMessage}
        </Typography>
    );
}

function renderTaskInputs(task, tasksHook) {
    const quantity = task?.report?.quantity ?? "";
    const quantityGood = task?.report?.quantityGood ?? "";
    const quantityScrap = task?.report?.quantityScrap ?? "";
    const remarks = task?.report?.remarks ?? "";

    return (
        <Stack spacing={1.5}>
            <Stack spacing={1} direction="row">
                <InputNumber
                    label="Ilość czynności"
                    value={quantity}
                    required={task?.report?.requiresQuantity}
                    min={0}
                    step={1}
                    onChange={(value) =>
                        tasksHook.actions.setTaskQuantity(task, value)
                    }
                />

                <InputNumber
                    label="Ilość dobrych wyrobów"
                    value={quantityGood}
                    required={false}
                    min={0}
                    step={1}
                    onChange={(value) =>
                        tasksHook.actions.setTaskQuantityGood(task, value)
                    }
                />

                <InputNumber
                    label="Ilość odpadów"
                    value={quantityScrap}
                    required={false}
                    min={0}
                    step={1}
                    onChange={(value) =>
                        tasksHook.actions.setTaskQuantityScrap(task, value)
                    }
                />
            </Stack>

            <InputText
                label="Komentarz"
                value={remarks}
                onChange={(value) =>
                    tasksHook.actions.setTaskRemarks(task, value)
                }
                required={task?.report?.requiresRemarks}
                multiline={true}
                rows={4}
                fullWidth
            />
        </Stack>
    );
}

function renderTaskItem(task, tasksHook) {
    return (
        <Box
            key={getTaskKey(task)}
            sx={{
                borderRadius: 2,
                overflow: "hidden",
            }}
        >
            <TaskInfo
                data={task}
                onRemove={tasksHook.actions.removeTask}
            >
                {renderTaskInputs(task, tasksHook)}
            </TaskInfo>
        </Box>
    );
}

function renderList(taskItems, tasksHook) {
    return (
        <Stack spacing={1}>
            {taskItems.map((task) => renderTaskItem(task, tasksHook))}
        </Stack>
    );
}

export default function SelectedTasksList({
    tasks,
    emptyMessage = "Brak dodanych tasków.",
}) {
    const taskItems = tasks?.state?.tasks ?? [];
    const requiresTasks = tasks?.computed?.requiresTasks ?? false;

    const isEmpty = !Array.isArray(taskItems) || taskItems.length === 0;

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
                ? renderEmpty(emptyMessage, requiresTasks)
                : renderList(taskItems, tasks)}
        </Box>
    );
}