import React, { useMemo } from "react";
import { Box, Stack } from "@mui/material";

import ProcessSelector from "./ProcessSelector";
import MachineUsageForm from "./MachineUsageForm";
import MaterialsUsageTable from "./MaterialsUsageTable";

const MachineIndexedForm = ({
    processes,
    settings = [],
    disabled = false,
}) => {
    const machineOptions = useMemo(() => {
        return (settings ?? []).map((machine) => ({
            id: machine.id,
            val: machine.name ?? machine.val,
            name: machine.name ?? machine.val,
            isConstant: machine.isConstant,
            required: machine.required,
            processes: machine.processes ?? [],
        }));
    }, [settings]);

    const selectedMachine = useMemo(() => {
        return machineOptions.find(
            (machine) => String(machine.id) === String(processes.state.machineId)
        ) ?? null;
    }, [machineOptions, processes.state.machineId]);

    const processOptions = useMemo(() => {
        return (selectedMachine?.processes ?? []).map((process) => ({
            id: process.id,
            val: process.name,
            title: process.description,
            group: process.structureName,
            taskGroup: process.is_general
                ? "🌐 Bez wymaganego taska"
                : "🎯 Wymaga wskazania taska",
            taskGroupOrder: process.is_general ? 2 : 1,
            meta: {
                description: process.description,
                isGeneral: process.is_general,
                isDesign: process.is_design,
                isSetup: process.is_setup,
                isTask: process.is_task,
                isProduction: process.is_production,
                requiresQuantity: process.requires_quantity,
                requiresRemarks: process.requires_remarks,
                finishedProduct: process.finishedProduct,
                machinesCount: process.machines?.length ?? 0,
                materialsCount: process.materials?.length ?? 0,
            },
        }));
    }, [selectedMachine]);

    function handleMachineChange(nextMachineId) {
        processes.actions.handleMachineChange(nextMachineId);

        const nextMachine = machineOptions.find(
            (machine) => String(machine.id) === String(nextMachineId)
        );

        const availableProcesses = nextMachine?.processes ?? [];

        const currentProcessStillAvailable = availableProcesses.some(
            (process) => String(process.id) === String(processes.state.processId)
        );

        if (!currentProcessStillAvailable) {
            processes.actions.handleProcessChange("");
        }
    }

    function handleProcessChange(nextProcessId) {
        processes.actions.handleProcessChange(nextProcessId);

        if (!nextProcessId) return;

        const selectedProcess = selectedMachine?.processes?.find(
            (process) => String(process.id) === String(nextProcessId)
        );

        const selectedProcessMachine = selectedProcess?.machines?.find(
            (machine) => String(machine.id) === String(processes.state.machineId)
        );

        if (selectedProcessMachine) {
            processes.actions.handleMachineChange(selectedProcessMachine.id);
        }
    }

    function renderProcessSection() {
        if (!processes.state.machineId) return null;

        return (
            <ProcessSelector
                value={processes.state.processId}
                options={processOptions}
                onChange={handleProcessChange}
                isRework={processes.state.isRework}
                onReworkChange={processes.actions.handleReworkChange}
                title="Proces"
                label="Wybierz proces"
            />
        );
    }

    function renderMaterialsSection() {
        if (!processes.computed.hasMaterials) return null;

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
                <MachineUsageForm
                    machineId={processes.state.machineId}
                    machineOptions={machineOptions}
                    machineTime={processes.state.machineTime}
                    onMachineChange={handleMachineChange}
                    onMachineTimeChange={processes.actions.handleMachineTimeChange}
                    disabled={disabled}
                />

                {renderProcessSection()}
                {renderMaterialsSection()}
            </Stack>
        </Box>
    );
};

export default MachineIndexedForm;