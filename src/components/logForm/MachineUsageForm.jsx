import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import InputSelectObject from "./InputSelectObject";
import TimeForm from "./TimeForm";

const MachineUsageForm = ({
    machineId = "",
    machineOptions = [],
    machineTime = null,
    onMachineChange,
    onMachineTimeChange,
    disabled = false,
    title = "Maszyna",
}) => {
    function renderEmpty() {
        return null;
    }

    function renderForm() {
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
                    <Typography variant="subtitle2" fontWeight={600}>
                        {title}
                    </Typography>

                    <InputSelectObject
                        selectOptions={machineOptions}
                        value={machineId}
                        label="Wybierz maszynę"
                        onChange={onMachineChange}
                        disabled={disabled}
                    />

                    <TimeForm
                        value={machineTime}
                        onChange={onMachineTimeChange}
                        label="Czas użycia maszyny"
                        dense
                        disabled={disabled || !machineId}
                    />
                </Stack>
            </Box>
        );
    }

    if (!Array.isArray(machineOptions) || machineOptions.length === 0) {
        return renderEmpty();
    }

    return renderForm();
};

export default MachineUsageForm;