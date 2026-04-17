import { operationLogDto } from "./operationLogDto";
import { machineLogDto } from "./machineLogDto";
import { materialLogDto } from "./materialLogDto";
import { outputLogDto } from "./outputLogDto";

import { normalizeTimeValue } from "../utils";
import { safeArray, round2, round4, getTaskQuantity, getTaskQuantityGood, getTaskQuantityScrap, getTaskRemarks, getTaskIsRework, getTimeDuration, getTaskAllocations, roundToStepDown, allocateAmountByRatioWithStep, allocateIntegerAcrossPeople, splitDurationByRatio, splitAmountByRatio, buildPreview, buildValidation, getOutputWorkDate } from "./logDraftVoUtils";


export function logDraftVo({
    tasksState = [],
    brigadesState = [],
    processesState = {},
    outputReport = null,

    structureId = null,
    periodId = null,
    productionTaskId = null,

    machineUsageKind = "produkcja",
    machineUsageQty = null,
    machineUsageUnit = null,
    machineUnitUsageCost = null,
    machineUsageCostAmount = null,

    materialIsPlan = false,
    materialIsActive = true,
    materialSource = null,
    materialRemarks = null,

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
    const isRework = Boolean(processesState?.isRework);

    const requiresTasks = Boolean(selectedProcess?.is_task);
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
        requiresTasks,
        requiresQuantity,
        requiresRemarks,
        allocations,
    });

    const operationLogs = [];
    const machineLogs = [];
    const materialLogs = [];
    const outputLogs = [];

    const outputWorkDate = getOutputWorkDate(selectedEmployees, machineTime);

    // TRYB TASKOWY
    if (requiresTasks) {
        // 1. OPERATIONS
        allocations.forEach((allocation) => {
            const employeeQtyAllocations = allocateIntegerAcrossPeople(
                allocation.quantity,
                selectedEmployees
            );

            employeeQtyAllocations.forEach((employeeAllocation) => {
                const employee = employeeAllocation;
                const employeeTime = normalizeTimeValue(employee.time);
                const employeeDuration = getTimeDuration(employeeTime);

                const taskDuration = splitDurationByRatio(
                    employeeDuration,
                    allocation.ratio
                );

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
                        isRepair: isRework || getTaskIsRework(allocation.task),
                        qty: requiresQuantity ? employeeAllocation.allocatedInt : null,
                    })
                );
            });
        });

        // 2. MACHINES
        if (selectedMachine) {
            const machineDuration = getTimeDuration(machineTime);

            allocations.forEach((allocation) => {
                const taskMachineTime = {
                    ...machineTime,
                    duration: splitDurationByRatio(
                        machineDuration,
                        allocation.ratio
                    ),
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
                        isSetup: Boolean(selectedProcess?.is_setup),
                        isRepair: isRework || getTaskIsRework(allocation.task),
                        remarks: getTaskRemarks(allocation.task),
                        usageQty:
                            machineUsageQty !== null &&
                                machineUsageQty !== undefined
                                ? splitAmountByRatio(
                                    machineUsageQty,
                                    allocation.ratio
                                )
                                : null,
                        usageUnit: machineUsageUnit,
                        unitUsageCost: machineUnitUsageCost,
                        usageCostAmount:
                            machineUsageCostAmount !== null &&
                                machineUsageCostAmount !== undefined
                                ? splitAmountByRatio(
                                    machineUsageCostAmount,
                                    allocation.ratio
                                )
                                : null,
                    })
                );
            });
        }

        // 3. MATERIALS
        materials.forEach((material) => {
            const row = materialsReport?.[material.id];
            if (!row) return;

            const qty = Number(row.qty || 0);
            const wasteQty = Number(row.wasteQty || 0);
            const materialStep = Number(material.step || row.step || 0.01);

            if (!qty && !wasteQty) return;

            const qtyAllocations = allocateAmountByRatioWithStep(
                qty,
                allocations,
                materialStep
            );

            const wasteAllocations = allocateAmountByRatioWithStep(
                wasteQty,
                allocations,
                materialStep
            );

            qtyAllocations.forEach((qtyAllocation, index) => {
                const wasteAllocation = wasteAllocations[index];

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
                        structureId,
                        periodId,
                        productionTaskId,
                        isRepair: isRework || getTaskIsRework(qtyAllocation.task),

                        isPlan: materialIsPlan,
                        isActive: materialIsActive,
                        source: materialSource,

                        isPrimaryMaterial: true,
                        isWaste: false,

                        qty: qtyAllocation.allocatedAmount,
                        unit: row.unit ?? material.unit,
                        wasteQty: wasteAllocation?.allocatedAmount ?? 0,

                        unitCost: null,
                        costAmount: null,
                        remarks: materialRemarks ?? getTaskRemarks(qtyAllocation.task),
                        attrs: null,
                    })
                );
            });
        });

        // 4. OUTPUTS
        console.log(allocations);

        allocations.forEach((allocation) => {
            const outputQty = getTaskQuantity(allocation.task);
            const goodQty = getTaskQuantityGood(allocation.task);
            const defectQty = getTaskQuantityScrap(allocation.task);

            const hasAnyOutput =
                Number(outputQty || 0) > 0 ||
                Number(goodQty || 0) > 0 ||
                Number(defectQty || 0) > 0;

            if (!hasAnyOutput) return;

            outputLogs.push(
                outputLogDto({
                    task: allocation.task,
                    employee: selectedEmployees[0] ?? null,
                    process: selectedProcess,
                    workDate: outputWorkDate,
                    structureId,
                    periodId,
                    productionTaskId,
                    isRepair: isRework || getTaskIsRework(allocation.task),

                    source: outputSource,
                    defectCategory: outputReport?.defectCategory ?? null,
                    defectReason: outputReport?.defectReason ?? null,

                    outputQty,
                    defectQty,
                    goodQty,
                    wasteQty: null,
                    unit: outputReport?.unit ?? null,

                    remarks: outputRemarks ?? getTaskRemarks(allocation.task),
                    attrs: outputReport?.attrs ?? null,
                })
            );
        });
    }

    // TRYB OGÓLNY
    if (!requiresTasks) {
        selectedEmployees.forEach((employee) => {
            const employeeTime = normalizeTimeValue(employee.time);

            operationLogs.push(
                operationLogDto({
                    task: null,
                    employee,
                    process: selectedProcess,
                    time: employeeTime,
                    structureId,
                    periodId,
                    productionTaskId: null,
                    remarks: null,
                    isRepair: isRework,
                    qty: requiresQuantity ? 1 : null,
                })
            );
        });
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
        requiresTasks,
        requiresQuantity,
        requiresRemarks,
        isRework,
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