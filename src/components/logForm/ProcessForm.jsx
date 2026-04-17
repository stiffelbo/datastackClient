import React from "react";
import { Box, Stack } from "@mui/material";

import ProcessSelector from "./ProcessSelector";
import MachineUsageForm from "./MachineUsageForm";
import MaterialsUsageTable from "./MaterialsUsageTable";

const ProcessForm = ({
    processes,
    disabled = false,
}) => {
    function renderMachineSection() {
        if (!processes?.computed?.hasMachines) return null;

        return (
            <MachineUsageForm
                machineId={processes.state.machineId}
                machineOptions={processes.options.machineOptions}
                machineTime={processes.state.machineTime}
                onMachineChange={processes.actions.handleMachineChange}
                onMachineTimeChange={processes.actions.handleMachineTimeChange}
                disabled={disabled}
            />
        );
    }

    function renderMaterialsSection() {
        if (!processes?.computed?.hasMaterials) return null;

        return (
            <MaterialsUsageTable
                materials={processes.data.materials}
                value={processes.state.materialsReport}
                onFieldChange={processes.actions.handleMaterialFieldChange}
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
                    value={processes.state.processId}
                    options={processes.options.processOptions}
                    onChange={processes.actions.handleProcessChange}
                    isRework={processes.state.isRework}
                    onReworkChange={processes.actions.handleReworkChange}
                />

                {renderMachineSection()}
                {renderMaterialsSection()}
            </Stack>
        </Box>
    );
};

export default ProcessForm;