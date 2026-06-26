import React from "react";

import { Alert, Box, Checkbox, Chip, FormControlLabel, Stack, Typography } from "@mui/material";

import TimeForm from "./TimeForm";

import { normalizeTimeValue } from "./utils";

function getEmployeeTime(employee, employeeTimes, initialTime) {
    const fromMap = employeeTimes?.[employee.id];
    if (fromMap) return normalizeTimeValue(fromMap);

    if (employee?.time) return normalizeTimeValue(employee.time);

    return normalizeTimeValue(initialTime);
}

function formatTime(value) {
    return value ? String(value).slice(0, 5) : "—";
}

function getRcpStatus(employee) {
    if (!employee.rcpConn) {
        return {
            severity: "error",
            label: "Brak połączenia z RCP",
            description: "System nie połączył się z bazą RCP",
        };
    }
    if (!employee.rcpStart) {
        return {
            severity: "warning",
            label: "Brak wejścia",
            description: "Brak odbicia wejścia w RCP.",
        };
    }

    if (!employee.rcpEnd) {
        return {
            severity: "info",
            label: "W pracy",
            description: "Jest wejście, brak odbicia wyjścia.",
        };
    }

    return {
        severity: "success",
        label: "Zamknięty",
        description: "Jest wejście i wyjście.",
    };
}

const BrigadeEmployeesForm = ({
    employees = [],
    selectedIds = [],
    employeeTimes = {},
    initialTime = null,
    title = "Pracownicy",
    emptyMessage = "Brak pracowników w brygadzie.",
    showToolbar = true,
    disabled = false,
    onToggle,
    onSelectAll,
    onClear,
    onEmployeeTimeChange,
}) => {
    function renderToolbar() {
        if (!showToolbar) return null;

        return (
            <Stack direction="row" spacing={0.75}>
                <Chip
                    label={`Wybrano: ${selectedIds.length}`}
                    size="small"
                    variant="outlined"
                />
                <Chip
                    label="Wszyscy"
                    size="small"
                    onClick={disabled ? undefined : onSelectAll}
                    clickable={!disabled}
                    variant="outlined"
                />
                <Chip
                    label="Wyczyść"
                    size="small"
                    onClick={disabled ? undefined : onClear}
                    clickable={!disabled}
                    variant="outlined"
                />
            </Stack>
        );
    }

    function renderEmpty() {
        return (
            <Typography variant="body2" color="text.secondary">
                {emptyMessage}
            </Typography>
        );
    }

    function renderRCP(employee, status){
        if(!employee.rcpConn) return;
        return (
            <Alert severity={status.severity} variant="outlined" sx={{ py: 0.25 }}>
                <Stack spacing={0.75}>
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        <Chip size="small" label={`Start: ${formatTime(employee.rcpStart)}`} />
                        <Chip size="small" label={`Plan: ${formatTime(employee.fteEnd)}`} />
                        <Chip size="small" label={`Koniec: ${formatTime(employee.rcpEnd)}`} />
                    </Stack>
                </Stack>
            </Alert>
        );
    }

    function renderEmployee(employee) {
        const checked = selectedIds.includes(employee.id);
        const status = getRcpStatus(employee);

        return (
            <Box
                key={employee.id}
                sx={{
                    border: "1px solid",
                    borderColor: checked ? "primary.main" : "divider",
                    borderRadius: 2,
                    px: 1.5,
                    py: 1.25,
                    bgcolor: checked ? "background.paper" : "action.selected",
                }}
            >
                <Stack spacing={1.25}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        gap={1}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() => onToggle?.(employee.id)}
                                />
                            }
                            label={
                                <Stack spacing={0}>
                                    <Typography variant="body2" fontWeight={700}>
                                        {employee.fullName || "—"}
                                    </Typography>

                                    {employee.occupationName ? (
                                        <Typography variant="caption" color="text.secondary">
                                            {employee.occupationName}
                                        </Typography>
                                    ) : null}
                                </Stack>
                            }
                            sx={{ alignItems: "center", m: 0 }}
                        />

                        <Chip
                            size="small"
                            color={status.severity}
                            variant="outlined"
                            label={status.label}
                        />
                    </Stack>

                    {renderRCP(status, employee)}

                    <TimeForm
                        value={employee.time}
                        onChange={(nextValue) =>
                            onEmployeeTimeChange?.(employee.id, nextValue)
                        }
                        label="Czas"
                        dense
                        disabled={disabled || !checked}
                    />
                </Stack>
            </Box>
        );
    }

    function renderList() {
        return <Stack spacing={1}>{employees.map(renderEmployee)}</Stack>;
    }

    function renderContent() {
        if (!employees.length) return renderEmpty();
        return renderList();
    }

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
            }}
        >
            <Stack spacing={1.5}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={1}
                >
                    <Typography variant="subtitle2" fontWeight={600}>
                        {title}
                    </Typography>

                    {renderToolbar()}
                </Stack>

                {renderContent()}
            </Stack>
        </Box>
    );
};

export default BrigadeEmployeesForm;