import React from "react";
import {
    Box,
    Stack,
    Typography,
} from "@mui/material";

import TaskInfo from "./TaskInfo";

export default function SelectedTasksList({
    tasks = [],
    onRemove,
    emptyMessage = "Brak dodanych tasków.",
}) {
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
            {/* HEADER */}
            <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 600 }}
            >
                Wybrane taski
            </Typography>

            {/* EMPTY */}
            {!Array.isArray(tasks) || tasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                </Typography>
            ) : (
                <Stack spacing={1}>
                    {tasks.map((task) => (
                        <TaskInfo
                            key={
                                task.id ??
                                task.jira_id ??
                                task.jira_key ??
                                task.key ??
                                task.task
                            }
                            data={task}
                            onRemove={onRemove}
                            sx={{
                                bgcolor: "success.lighter",
                                borderColor: "success.light",
                            }}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}