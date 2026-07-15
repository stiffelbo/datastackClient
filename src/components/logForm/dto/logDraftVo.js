import { operationLogDto } from "./operationLogDto";
import { machineLogDto } from "./machineLogDto";
import { materialLogDto } from "./materialLogDto";
import { outputLogDto } from "./outputLogDto";

import { normalizeTimeValue } from "../utils";
import { safeArray, round2, round4, getTaskQuantity, getTaskQuantityGood, getTaskQuantityScrap, getTaskRemarks, getTaskIsRework, getTimeDuration, getTaskAllocations, roundToStepDown, allocateAmountByRatioWithStep, allocateAmountAcrossPeopleWithStep, allocateIntegerAcrossPeople, splitDurationByRatio, splitAmountByRatio, buildPreview, buildValidation, getOutputWorkDate, splitTimeSequentially } from "./logDraftVoUtils";
import { splitProductionTimeSequentially, getProductionTaskAllocations, getGoodScrapRatios } from './productionAlocations';

function uniqueErrors(errors = []) {
    return [...new Set(errors.filter(Boolean))];
}

export function logDraftVo({
    tasksState = [],
    brigadesState = [],
    processesState = {},
    nonTaskRemarks = 'test'
}) {
    const selectedTasks = safeArray(tasksState);
    const selectedEmployees = safeArray(brigadesState).filter((item) => item.isSelected);

    const selectedProcess = processesState?.selectedProcess ?? null;

    const selectedMachine = processesState?.selectedMachine ?? null;
    const machineTime = normalizeTimeValue(processesState?.machineTime ?? null);
    const materialsReport = processesState?.materialsReport ?? {};
    const materials = safeArray(processesState?.materials);
    const isRework = Boolean(processesState?.isRework);

    const isProduction = Boolean(selectedProcess?.is_production);
    const requiresTasks = !Boolean(selectedProcess?.is_general);
    const requiresQuantity = Boolean(selectedProcess?.requires_quantity);
    const requiresRemarks = Boolean(selectedProcess?.requires_remarks);
    const requiresMaterial = Boolean(selectedProcess?.requires_material);

    const allocations = isProduction
        ? getProductionTaskAllocations(selectedTasks)
        : getTaskAllocations(selectedTasks, { requiresQuantity });

    const validation = buildValidation({
        selectedTasks,
        selectedEmployees,
        selectedProcess,
        selectedMachine,
        materials,
        materialsReport,
        requiresTasks,
        requiresQuantity,
        requiresRemarks,
        allocations
    });

    const operationLogs = [];
    const machineLogs = [];
    const materialLogs = [];
    const outputLogs = [];

    const outputWorkDate = getOutputWorkDate(selectedEmployees, machineTime);

    const hasSelectedEmployees = selectedEmployees.length > 0;

    // TRYB TASKOWY
    if (selectedTasks.length) {
        // 1. OPERATIONS

        selectedEmployees.forEach((employee) => {
            const employeeTime = normalizeTimeValue(employee.time);

            const employeeTaskTimes = isProduction
                ? splitProductionTimeSequentially(employeeTime, allocations)
                : splitTimeSequentially(employeeTime, allocations);

            employeeTaskTimes.forEach(({ allocation, time: taskTime }) => {
                const employeeQtyAllocations = allocateIntegerAcrossPeople(
                    allocation.quantity,
                    [employee]
                );

                const employeeAllocation = employeeQtyAllocations[0];
                operationLogs.push(
                    operationLogDto({
                        task: allocation.task,
                        employee,
                        process: selectedProcess,
                        time: taskTime,
                        structureId: processesState.structureId,
                        productionTaskId: null,
                        remarks: getTaskRemarks(allocation.task),
                        isRepair: isRework || getTaskIsRework(allocation.task),
                        qty: requiresQuantity
                            ? employeeAllocation?.allocatedInt ?? 0
                            : 1,
                    })
                );
            });
        });

        // 2. MACHINES
        if (selectedMachine) {
            const machineTaskTimes = isProduction
                ? splitProductionTimeSequentially(machineTime, allocations)
                : splitTimeSequentially(machineTime, allocations);

            machineTaskTimes.forEach(({ allocation, time: taskMachineTime }) => {

                machineLogs.push(
                    machineLogDto({
                        task: allocation.task,
                        employee: selectedEmployees[0] ?? null,
                        process: selectedProcess,
                        machine: selectedMachine,
                        time: taskMachineTime,
                        structureId: processesState.structureId,
                        productionTaskId: null,
                        isSetup: Boolean(selectedProcess?.is_setup),
                        isRepair: isRework || getTaskIsRework(allocation.task),
                        remarks: getTaskRemarks(allocation.task),
                        usageQty: 0,
                    })
                );
            });
        }

        // 3. MATERIALS
        materials.forEach((material) => {
            const row = materialsReport?.[material.id];
            if (!row) return;

            const materialStep = Number(material.step || row.step || 0.01);

            if (isProduction) {
                // 3A. PRODUKCJA: row.qty dzielone po taskach, potem na dobre/braki
                // bez dzielenia na pracowników
                const productionQty = Number(row.qty || 0);

                if (productionQty) {
                    const taskQtyAllocations = allocateAmountByRatioWithStep(
                        productionQty,
                        allocations,
                        materialStep
                    );

                    taskQtyAllocations.forEach((qtyAllocation) => {
                        const { goodRatio, scrapRatio } = getGoodScrapRatios(qtyAllocation.task);

                        const internalMovements = [
                            {
                                movementType: "produkcja",
                                qty: roundToStepDown(
                                    qtyAllocation.allocatedAmount * goodRatio,
                                    materialStep
                                ),
                            },
                            {
                                movementType: "brak",
                                qty: roundToStepDown(
                                    qtyAllocation.allocatedAmount * scrapRatio,
                                    materialStep
                                ),
                            },
                        ];

                        internalMovements.forEach((movement) => {
                            if (!movement.qty) return;

                            materialLogs.push(
                                materialLogDto({
                                    task: qtyAllocation.task,
                                    employee: selectedEmployees[0] ?? null,
                                    process: selectedProcess,
                                    material,

                                    workDate:
                                        selectedEmployees[0]?.time?.date ??
                                        machineTime?.date ??
                                        null,

                                    structureId: processesState.structureId,
                                    productionTaskId: null,

                                    isRepair: isRework || getTaskIsRework(qtyAllocation.task),
                                    isPlan: false,
                                    isActive: true,

                                    movementType: movement.movementType,
                                    qty: movement.qty,

                                    remarks: getTaskRemarks(qtyAllocation.task),
                                })
                            );
                        });
                    });
                }

                // 3B. ODPAD MATERIAŁOWY: row.wasteQty dzielone tylko po factorze
                // bez dzielenia na pracowników
                const wasteQty = Number(row.wasteQty || 0);

                if (wasteQty) {
                    const wasteAllocations = allocateAmountByRatioWithStep(
                        wasteQty,
                        allocations,
                        materialStep
                    );

                    wasteAllocations.forEach((qtyAllocation) => {
                        if (!qtyAllocation.allocatedAmount) return;

                        materialLogs.push(
                            materialLogDto({
                                task: qtyAllocation.task,
                                employee: selectedEmployees[0] ?? null,
                                process: selectedProcess,
                                material,

                                workDate:
                                    selectedEmployees[0]?.time?.date ??
                                    machineTime?.date ??
                                    null,

                                structureId: processesState.structureId,
                                productionTaskId: null,

                                isRepair: isRework || getTaskIsRework(qtyAllocation.task),
                                isPlan: false,
                                isActive: true,

                                movementType: "odpad",
                                qty: qtyAllocation.allocatedAmount,

                                remarks: getTaskRemarks(qtyAllocation.task),
                            })
                        );
                    });
                }
            } else {
                const materialMovements = [
                    {
                        movementType: "produkcja",
                        qty: Number(row.qty || 0),
                    },
                    {
                        movementType: "odpad",
                        qty: Number(row.wasteQty || 0),
                    },
                ];

                materialMovements.forEach((movement) => {
                    if (!movement.qty) return;

                    const qtyAllocations = allocateAmountByRatioWithStep(
                        movement.qty,
                        allocations,
                        materialStep
                    );

                    qtyAllocations.forEach((qtyAllocation) => {
                        const employeeAllocations = allocateAmountAcrossPeopleWithStep(
                            qtyAllocation.allocatedAmount,
                            selectedEmployees,
                            materialStep
                        );

                        employeeAllocations.forEach((employeeAllocation) => {
                            if (!employeeAllocation.allocatedAmount) return;

                            materialLogs.push(
                                materialLogDto({
                                    task: qtyAllocation.task,
                                    employee: employeeAllocation.employee,
                                    process: selectedProcess,
                                    material,

                                    workDate:
                                        employeeAllocation.employee?.time?.date ??
                                        machineTime?.date ??
                                        null,

                                    structureId: processesState.structureId,
                                    productionTaskId: null,

                                    isRepair: isRework || getTaskIsRework(qtyAllocation.task),
                                    isPlan: false,
                                    isActive: true,

                                    movementType: movement.movementType,
                                    qty: employeeAllocation.allocatedAmount,

                                    remarks: getTaskRemarks(qtyAllocation.task),
                                })
                            );
                        });
                    });
                });
            }
        });

        // 4. OUTPUTS
        selectedTasks.forEach((task) => {
            const quantityGood = Number(task?.report?.quantityGood || 0);
            const quantityScrap = Number(task?.report?.quantityScrap || 0);

            if (!quantityGood && !quantityScrap) return;

            const outputMovements = [
                {
                    movementType: "dobre",
                    qty: quantityGood,
                },
                {
                    movementType: "brak",
                    qty: quantityScrap,
                },
            ];

            outputMovements.forEach((movement) => {
                if (!movement.qty) return;

                const employeeAllocations = allocateAmountAcrossPeopleWithStep(
                    movement.qty,
                    selectedEmployees,
                    1
                );

                employeeAllocations.forEach((employeeAllocation) => {
                    if (!employeeAllocation.allocatedAmount) return;

                    outputLogs.push(
                        outputLogDto({
                            task,
                            employee: employeeAllocation.employee,
                            process: selectedProcess,

                            workDate:
                                employeeAllocation.employee?.time?.date ??
                                machineTime?.date ??
                                null,

                            structureId: processesState.structureId,
                            productionTaskId: null,

                            movementType: movement.movementType,
                            qty: employeeAllocation.allocatedAmount,

                            remarks: getTaskRemarks(task),
                            attrs: null,
                        })
                    );
                });
            });
        });
    }

    // TRYB OGÓLNY
    if (!selectedTasks.length) {
        selectedEmployees.forEach((employee) => {
            const employeeTime = normalizeTimeValue(employee.time);

            operationLogs.push(
                operationLogDto({
                    task: null,
                    employee,
                    process: selectedProcess,
                    time: employeeTime,
                    structureId: processesState.structureId,
                    productionTaskId: null,
                    remarks: nonTaskRemarks,
                    isRepair: isRework,
                    qty: 1,
                })
            );
        });
    }

    if (!hasSelectedEmployees) {
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
            requiresTasks,
            requiresQuantity,
            requiresRemarks,
            isRework,
        });

        return {
            meta: {
                valid: false,
                errors: uniqueErrors([
                    ...validation.errors,
                    "Wybierz co najmniej jednego pracownika.",
                ]),
                requiresTasks,
                requiresQuantity,
                requiresRemarks,
                isRework,
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
}