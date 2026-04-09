import React from "react";
import { Box, Stack } from "@mui/material";

import ProcessSelector from "./ProcessSelector";
import MachineUsageForm from "./MachineUsageForm";
import MaterialsUsageTable from "./MaterialsUsageTable";

const ProcessForm = ({
    processForm,
    disabled = false,
}) => {
    function renderMachineSection() {
        if (!processForm?.computed?.hasMachines) return null;

        return (
            <MachineUsageForm
                machineId={processForm.state.machineId}
                machineOptions={processForm.options.machineOptions}
                machineTime={processForm.state.machineTime}
                onMachineChange={processForm.actions.handleMachineChange}
                onMachineTimeChange={processForm.actions.handleMachineTimeChange}
                disabled={disabled}
            />
        );
    }

    function renderMaterialsSection() {
        if (!processForm?.computed?.hasMaterials) return null;

        return (
            <MaterialsUsageTable
                materials={processForm.data.materials}
                value={processForm.state.materialsReport}
                onFieldChange={processForm.actions.handleMaterialFieldChange}
                disabled={disabled}
            />
        );
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
            <Stack spacing={2}>
                <ProcessSelector
                    value={processForm.state.processId}
                    options={processForm.options.processOptions}
                    onChange={processForm.actions.handleProcessChange}
                    disabled={disabled}
                />

                {renderMachineSection()}
                {renderMaterialsSection()}
            </Stack>
        </Box>
    );
};

export default ProcessForm;