import { operationLogDto } from "./operationLogDto";
import { machineLogDto } from "./machineLogDto";
import { materialLogDto } from "./materialLogDto";
import { outputLogDto } from "./outputLogDto";

import { normalizeTimeValue } from "../utils";
import { safeArray, round2, round4, getTaskQuantity, getTaskQuantityGood, getTaskQuantityScrap, getTaskRemarks, getTaskIsRework, getTimeDuration, getTaskAllocations, roundToStepDown, allocateAmountByRatioWithStep, allocateAmountAcrossPeopleWithStep, allocateIntegerAcrossPeople, splitDurationByRatio, splitAmountByRatio, buildPreview, buildValidation, getOutputWorkDate, splitTimeSequentially } from "./logDraftVoUtils";


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

    const requiresTasks = Boolean(selectedProcess?.is_task);
    const requiresQuantity = Boolean(selectedProcess?.requires_quantity);
    const requiresRemarks = Boolean(selectedProcess?.requires_remarks);
    const requiresMaterial = Boolean(selectedProcess?.requires_material);

    const allocations = getTaskAllocations(selectedTasks, {
        requiresQuantity,
    });

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

    // TRYB TASKOWY
    if (selectedTasks.length) {
        // 1. OPERATIONS

        selectedEmployees.forEach((employee) => {
            const employeeTime = normalizeTimeValue(employee.time);

            const employeeTaskTimes = splitTimeSequentially(
                employeeTime,
                allocations
            );

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
                        structureId : selectedProcess?.structureId || null,
                        productionTaskId : null,
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
            const machineTaskTimes = splitTimeSequentially(
                machineTime,
                allocations
            );

            machineTaskTimes.forEach(({ allocation, time: taskMachineTime }) => {
                
                machineLogs.push(
                    machineLogDto({
                        task: allocation.task,
                        employee: selectedEmployees[0] ?? null,
                        process: selectedProcess,
                        machine: selectedMachine,
                        time: taskMachineTime,
                        structureId : selectedProcess?.structureId || null,
                        productionTaskId : null,
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

                                structureId : selectedProcess?.structureId || null,
                                productionTaskId : null,

                                isRepair: isRework || getTaskIsRework(qtyAllocation.task),
                                isPlan: false,
                                isActive: true,

                                movementType: movement.movementType,
                                qty: employeeAllocation.allocatedAmount,

                                remarks:
                                    getTaskRemarks(qtyAllocation.task),
                            })
                        );
                    });
                });
            });
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

                            structureId: selectedProcess?.structureId,
                            productionTaskId : null,

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
                    structureId : selectedProcess?.structureId || null,
                    productionTaskId: null,
                    remarks: nonTaskRemarks,
                    isRepair: isRework,
                    qty: 1,
                })
            );
        });
    }

    console.log(operationLogs);


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
        isRework
    });


    return {
        meta: {
            valid: validation.valid,
            errors: validation.errors,
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