import { operationLogDto } from "./operationLogDto";
import { machineLogDto } from "./machineLogDto";
import { materialLogDto } from "./materialLogDto";
import { outputLogDto } from "./outputLogDto";

import { normalizeTimeValue, toNumberOrNull } from "../utils";

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function round2(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function round4(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 10000) / 10000;
}

function getTaskQuantity(task) {
    return Number(task?.report?.quantity || 0);
}

function getTaskRemarks(task) {
    return task?.report?.remarks ?? null;
}

function getTimeDuration(time) {
    return Number(time?.duration || 0);
}

function getTaskAllocations(tasks = []) {
    const normalized = safeArray(tasks)
        .map((task) => ({
            task,
            quantity: getTaskQuantity(task),
        }))
        .filter((item) => item.quantity > 0);

    const totalQuantity = normalized.reduce((sum, item) => sum + item.quantity, 0);

    if (!totalQuantity) return [];

    return normalized.map((item) => ({
        task: item.task,
        quantity: item.quantity,
        ratio: item.quantity / totalQuantity,
    }));
}

function splitDurationByRatio(duration, ratio) {
    return round2(Number(duration || 0) * Number(ratio || 0));
}

function splitAmountByRatio(amount, ratio) {
    return round4(Number(amount || 0) * Number(ratio || 0));
}

function buildPreview({
    selectedProcess,
    selectedMachine,
    selectedEmployees,
    selectedTasks,
    materials,
    allocations,
    operationLogs,
    machineLogs,
    materialLogs,
    outputLogs,
}) {
    return {
        process: selectedProcess
            ? {
                  id: selectedProcess.id,
                  name: selectedProcess.name,
              }
            : null,

        machine: selectedMachine
            ? {
                  id: selectedMachine.id,
                  name: selectedMachine.name,
              }
            : null,

        employees: selectedEmployees.map((employee) => ({
            id: employee.id,
            name: employee.fullName ?? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim(),
        })),

        tasks: selectedTasks.map((task) => ({
            id: task.id,
            jiraKey: task.jiraKey,
            name: task.name,
            quantity: task?.report?.quantity ?? null,
            remarks: task?.report?.remarks ?? null,
        })),

        materials: materials.map((material) => ({
            id: material.id,
            name: material.name,
            unit: material.unit,
            required: material.required,
        })),

        allocations: allocations.map((item) => ({
            taskId: item.task.id,
            jiraKey: item.task.jiraKey,
            quantity: item.quantity,
            ratio: round4(item.ratio),
        })),

        counts: {
            operationLogs: operationLogs.length,
            machineLogs: machineLogs.length,
            materialLogs: materialLogs.length,
            outputLogs: outputLogs.length,
        },
    };
}

function buildValidation({
    selectedTasks,
    selectedEmployees,
    selectedProcess,
    selectedMachine,
    materials,
    materialsReport,
    requiresQuantity,
    requiresRemarks,
    allocations,
}) {
    const errors = [];

    if (!selectedProcess) {
        errors.push("Brak wybranego procesu.");
    }

    if (!selectedTasks.length) {
        errors.push("Brak wybranych tasków.");
    }

    if (!selectedEmployees.length) {
        errors.push("Brak wybranych pracowników.");
    }

    if (requiresQuantity) {
        const missingQuantity = selectedTasks.some(
            (task) => !Number(task?.report?.quantity || 0)
        );

        if (missingQuantity) {
            errors.push("Każdy task musi mieć uzupełnioną ilość.");
        }
    }

    if (requiresRemarks) {
        const missingRemarks = selectedTasks.some(
            (task) => !(task?.report?.remarks ?? "").trim()
        );

        if (missingRemarks) {
            errors.push("Każdy task musi mieć uzupełnione uwagi.");
        }
    }

    if (selectedProcess?.machines?.length && !selectedMachine) {
        errors.push("Proces wymaga wyboru maszyny.");
    }

    const requiredMaterials = materials.filter((item) => item.required);

    requiredMaterials.forEach((material) => {
        const row = materialsReport?.[material.id];
        const qty = Number(row?.qty || 0);

        if (!qty) {
            errors.push(`Materiał wymagany bez ilości: ${material.name}.`);
        }
    });

    if (!allocations.length && selectedTasks.length) {
        errors.push("Brak poprawnej alokacji tasków. Uzupełnij ilości.");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Główny generator draftu logów
 */
export function logDraftVo({
    tasksState = [],
    brigadesState = [],
    processesState = {},
    outputReport = null,

    structureId = null,
    periodId = null,
    productionTaskId = null,

    machineUsageKind = "produkcja",
    machineIsSetup = false,
    machineIsRepair = false,
    machineRemarks = null,
    machineUsageQty = null,
    machineUsageUnit = null,
    machineUnitUsageCost = null,
    machineUsageCostAmount = null,

    materialIsRepair = false,
    materialIsPlan = false,
    materialIsActive = true,
    materialSource = null,
    materialRemarks = null,

    outputIsRepair = false,
    outputSource = null,
    outputRemarks = null,
}) {
    const selectedTasks = safeArray(tasksState);
    const selectedEmployees = safeArray(brigadesState).filter((item) => item.isSelected);

    const selectedProcess = processesState?.selectedProcess ?? null;
    const selectedMachine = processesState?.selectedMachine ?? null;
    const machineTime = normalizeTimeValue(processesState?.machineTime ?? null);
    const materialsReport = processesState?.materialsReport ?? {};
    const materials = safeArray(processesState?.materials);

    const requiresQuantity = Boolean(selectedProcess?.requires_quantity);
    const requiresRemarks = Boolean(selectedProcess?.requires_remarks);

    const allocations = getTaskAllocations(selectedTasks);

    const validation = buildValidation({
        selectedTasks,
        selectedEmployees,
        selectedProcess,
        selectedMachine,
        materials,
        materialsReport,
        requiresQuantity,
        requiresRemarks,
        allocations,
    });

    const operationLogs = [];
    const machineLogs = [];
    const materialLogs = [];
    const outputLogs = [];

    if (validation.valid) {
        // OPERATION LOGS
        selectedEmployees.forEach((employee) => {
            const employeeTime = normalizeTimeValue(employee.time);
            const employeeDuration = getTimeDuration(employeeTime);

            allocations.forEach((allocation) => {
                const taskDuration = splitDurationByRatio(employeeDuration, allocation.ratio);

                const taskTime = {
                    ...employeeTime,
                    duration: taskDuration,
                };

                operationLogs.push(
                    operationLogDto({
                        task: allocation.task,
                        employee,
                        process: selectedProcess,
                        time: taskTime,
                        structureId,
                        periodId,
                        productionTaskId,
                        remarks: getTaskRemarks(allocation.task),
                        isRepair: false,
                        qty: requiresQuantity ? allocation.quantity : null,
                    })
                );
            });
        });

        // MACHINE LOGS
        if (selectedMachine) {
            const machineDuration = getTimeDuration(machineTime);

            allocations.forEach((allocation) => {
                const taskMachineTime = {
                    ...machineTime,
                    duration: splitDurationByRatio(machineDuration, allocation.ratio),
                };

                machineLogs.push(
                    machineLogDto({
                        task: allocation.task,
                        employee: selectedEmployees[0] ?? null,
                        process: selectedProcess,
                        machine: selectedMachine,
                        time: taskMachineTime,
                        structureId,
                        periodId,
                        productionTaskId,
                        usageKind: machineUsageKind,
                        isSetup: machineIsSetup,
                        isRepair: machineIsRepair,
                        remarks: machineRemarks,
                        usageQty:
                            machineUsageQty !== null && machineUsageQty !== undefined
                                ? splitAmountByRatio(machineUsageQty, allocation.ratio)
                                : null,
                        usageUnit: machineUsageUnit,
                        unitUsageCost: machineUnitUsageCost,
                        usageCostAmount:
                            machineUsageCostAmount !== null &&
                            machineUsageCostAmount !== undefined
                                ? splitAmountByRatio(machineUsageCostAmount, allocation.ratio)
                                : null,
                    })
                );
            });
        }

        // MATERIAL LOGS
        materials.forEach((material) => {
            const row = materialsReport?.[material.id];
            if (!row) return;

            const qty = Number(row.qty || 0);
            const wasteQty = Number(row.wasteQty || 0);
            const goodQty = Number(row.goodQty || 0);

            allocations.forEach((allocation) => {
                materialLogs.push(
                    materialLogDto({
                        task: allocation.task,
                        employee: selectedEmployees[0] ?? null,
                        process: selectedProcess,
                        material,
                        workDate: selectedEmployees[0]?.time?.date ?? machineTime?.date ?? null,
                        structureId,
                        periodId,
                        productionTaskId,
                        isRepair: materialIsRepair,

                        isPlan: materialIsPlan,
                        isActive: materialIsActive,
                        source: materialSource,

                        isPrimaryMaterial: true,
                        isWaste: false,

                        qty: splitAmountByRatio(qty, allocation.ratio),
                        unit: row.unit ?? material.unit,
                        wasteQty: splitAmountByRatio(wasteQty, allocation.ratio),
                        goodQty: splitAmountByRatio(goodQty, allocation.ratio),

                        unitCost: null,
                        costAmount: null,
                        remarks: materialRemarks,
                        attrs: null,
                    })
                );
            });
        });

        // OUTPUT LOGS
        if (outputReport) {
            const outputQty = Number(outputReport?.outputQty || 0);
            const defectQty = Number(outputReport?.defectQty || 0);
            const goodQty = Number(outputReport?.goodQty || 0);
            const wasteQty = Number(outputReport?.wasteQty || 0);

            allocations.forEach((allocation) => {
                outputLogs.push(
                    outputLogDto({
                        task: allocation.task,
                        employee: selectedEmployees[0] ?? null,
                        process: selectedProcess,
                        workDate: selectedEmployees[0]?.time?.date ?? machineTime?.date ?? null,
                        structureId,
                        periodId,
                        productionTaskId,
                        isRepair: outputIsRepair,

                        source: outputSource,
                        defectCategory: outputReport?.defectCategory ?? null,
                        defectReason: outputReport?.defectReason ?? null,

                        outputQty: splitAmountByRatio(outputQty, allocation.ratio),
                        defectQty: splitAmountByRatio(defectQty, allocation.ratio),
                        goodQty: splitAmountByRatio(goodQty, allocation.ratio),
                        wasteQty: splitAmountByRatio(wasteQty, allocation.ratio),
                        unit: outputReport?.unit ?? null,

                        remarks: outputRemarks,
                        attrs: outputReport?.attrs ?? null,
                    })
                );
            });
        }
    }

    const preview = buildPreview({
        selectedProcess,
        selectedMachine,
        selectedEmployees,
        selectedTasks,
        materials,
        allocations,
        operationLogs,
        machineLogs,
        materialLogs,
        outputLogs,
    });

    return {
        meta: {
            valid: validation.valid,
            errors: validation.errors,
            requiresQuantity,
            requiresRemarks,
        },

        preview,

        logs: {
            operationLogs,
            machineLogs,
            materialLogs,
            outputLogs,
        },
    };
}