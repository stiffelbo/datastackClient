import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Checkbox,
    FormControlLabel,
    Stack,
    Typography,
    Chip,
    Divider,
} from "@mui/material";

import { brigadeEmployeesDto } from "./dto/brigadesDto";
import TimeForm from "./TimeForm";

function normalizeTimeValue(value = null) {
    return {
        date: value?.date ?? "",
        start: value?.start ?? "",
        end: value?.end ?? "",
        duration: value?.duration ?? "",
    };
}

function isSameTime(a = {}, b = {}) {
    return (
        (a?.date ?? "") === (b?.date ?? "") &&
        (a?.start ?? "") === (b?.start ?? "") &&
        (a?.end ?? "") === (b?.end ?? "") &&
        String(a?.duration ?? "") === String(b?.duration ?? "")
    );
}

const BrigadeEmployeesForm = ({
    user,
    onChange,
    title = "Pracownicy",
    selectAllByDefault = true,
    initialTime = null,
}) => {

    console.log("BrigadeEmployeesForm render", { initialTime });

    const employees = useMemo(
        () => brigadeEmployeesDto(user?.brigades),
        [user?.brigades]
    );

    const normalizedInitialTime = useMemo(
        () => normalizeTimeValue(initialTime),
        [initialTime]
    );

    const [selectedIds, setSelectedIds] = useState([]);
    const [employeeTimes, setEmployeeTimes] = useState({});

    function buildWorklogMap(ids, times, employeesList) {
        const selectedEmployees = employeesList.filter((item) =>
            ids.includes(item.id)
        );

        const worklogMap = {};
        selectedEmployees.forEach((employee) => {
            worklogMap[employee.id] = normalizeTimeValue(times[employee.id]);
        });

        return {
            employeeIds: ids,
            employees: selectedEmployees,
            employeeTimes: worklogMap,
        };
    }

    function emitChange(nextIds, nextTimes, employeesList = employees) {
        if (typeof onChange !== "function") return;
        onChange(buildWorklogMap(nextIds, nextTimes, employeesList));
    }

    const handleToggle = (employeeId) => {
        setSelectedIds((prev) => {
            const nextIds = prev.includes(employeeId)
                ? prev.filter((id) => id !== employeeId)
                : [...prev, employeeId];

            emitChange(nextIds, employeeTimes);
            return nextIds;
        });
    };

    const handleSelectAll = () => {
        const nextIds = employees.map((item) => item.id);
        setSelectedIds(nextIds);
        emitChange(nextIds, employeeTimes);
    };

    const handleClear = () => {
        setSelectedIds([]);
        emitChange([], employeeTimes);
    };

    const handleEmployeeTimeChange = (employeeId, nextTime) => {
        setEmployeeTimes((prev) => {
            const nextTimes = {
                ...prev,
                [employeeId]: normalizeTimeValue(nextTime),
            };

            emitChange(selectedIds, nextTimes);
            return nextTimes;
        });
    };

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

                    <Stack direction="row" spacing={0.75}>
                        <Chip
                            label={`Wybrano: ${selectedIds.length}`}
                            size="small"
                            variant="outlined"
                        />
                        {employees.length > 0 && (
                            <>
                                <Chip
                                    label="Wszyscy"
                                    size="small"
                                    onClick={handleSelectAll}
                                    clickable
                                    variant="outlined"
                                />
                                <Chip
                                    label="Wyczyść"
                                    size="small"
                                    onClick={handleClear}
                                    clickable
                                    variant="outlined"
                                />
                            </>
                        )}
                    </Stack>
                </Stack>

                {!employees.length ? (
                    <Typography variant="body2" color="text.secondary">
                        Brak pracowników w brygadzie.
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {employees.map((employee) => {
                            const checked = selectedIds.includes(employee.id);
                            const employeeTime =
                                employeeTimes[employee.id] ?? normalizedInitialTime;

                            return (
                                <Box
                                    key={employee.id}
                                    sx={{
                                        border: "1px solid",
                                        borderColor: checked ? "primary.main" : "divider",
                                        borderRadius: 1.5,
                                        px: 1.25,
                                        py: 1,
                                        bgcolor: checked ? "transparent" : "action.selected",
                                    }}
                                >
                                    <Stack spacing={1}>
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
                                                        onChange={() => handleToggle(employee.id)}
                                                    />
                                                }
                                                label={
                                                    <Stack spacing={0}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {employee.fullName || "—"}
                                                        </Typography>

                                                        {employee.occupationName ? (
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {employee.occupationName}
                                                            </Typography>
                                                        ) : null}
                                                    </Stack>
                                                }
                                                sx={{ alignItems: "center", m: 0 }}
                                            />

                                            {employee.optimaGid ? (
                                                <Typography variant="caption" color="text.secondary">
                                                    {employee.optimaGid}
                                                </Typography>
                                            ) : null}
                                        </Stack>

                                        <TimeForm
                                            value={employeeTime}
                                            onChange={(nextValue) =>
                                                handleEmployeeTimeChange(employee.id, nextValue)
                                            }
                                            label="Czas"
                                            dense
                                        />
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
};

export default BrigadeEmployeesForm;