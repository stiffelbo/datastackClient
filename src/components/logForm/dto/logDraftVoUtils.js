import { normalizeTimeValue } from "../utils";

export function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

export function round2(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function round4(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 10000) / 10000;
}

export function getTaskQuantity(task) {
    return Number(task?.report?.quantity || 0);
}

export function getTaskQuantityGood(task) {
    return Number(task?.report?.quantityGood || 0);
}

export function getTaskQuantityScrap(task) {
    return Number(task?.report?.quantityScrap || 0);
}

export function getTaskRemarks(task) {
    return task?.report?.remarks ?? null;
}

export function getTaskIsRework(task) {
    return Boolean(task?.report?.is_rework);
}

export function getTimeDuration(time) {
    return Number(time?.duration || 0);
}

export function splitDurationByRatio(duration, ratio) {
    return round2(Number(duration || 0) * Number(ratio || 0));
}

export function splitAmountByRatio(amount, ratio) {
    return round4(Number(amount || 0) * Number(ratio || 0));
}

export function getTaskAllocations(tasks = []) {
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

export function roundToStepDown(value, step) {
    const normalizedStep = Number(step || 0);
    const normalizedValue = Number(value || 0);

    if (!normalizedStep || normalizedStep <= 0) {
        return round4(normalizedValue);
    }

    const units = Math.floor(normalizedValue / normalizedStep);
    return round4(units * normalizedStep);
}

export function allocateAmountByRatioWithStep(amount, allocations = [], step = 0.01) {
    const totalAmount = Number(amount || 0);
    const safeAllocations = safeArray(allocations);

    if (!safeAllocations.length) return [];
    if (!totalAmount) {
        return safeAllocations.map((allocation) => ({
            ...allocation,
            allocatedAmount: 0,
        }));
    }

    const result = [];
    let distributed = 0;

    safeAllocations.forEach((allocation, index) => {
        const rawAmount = totalAmount * Number(allocation.ratio || 0);

        if (index === 0) {
            result.push({
                ...allocation,
                allocatedAmount: 0,
            });
            return;
        }

        const roundedAmount = roundToStepDown(rawAmount, step);
        distributed += roundedAmount;

        result.push({
            ...allocation,
            allocatedAmount: roundedAmount,
        });
    });

    const firstAmount = round4(totalAmount - distributed);

    result[0] = {
        ...safeAllocations[0],
        allocatedAmount: firstAmount,
    };

    return result;
}

export function allocateIntegerAcrossPeople(total, items = []) {
    const safeItems = safeArray(items);
    const normalizedTotal = Math.max(0, parseInt(Number(total || 0), 10) || 0);

    if (!safeItems.length) return [];
    if (!normalizedTotal) {
        return safeItems.map((item) => ({
            ...item,
            allocatedInt: 0,
        }));
    }

    const base = Math.floor(normalizedTotal / safeItems.length);
    const remainder = normalizedTotal % safeItems.length;

    return safeItems.map((item, index) => ({
        ...item,
        allocatedInt: base + (index < remainder ? 1 : 0),
    }));
}

export function getOutputWorkDate(selectedEmployees = [], machineTime = null) {
    const firstEmployeeDate = selectedEmployees?.[0]?.time?.date ?? null;
    const machineDate = machineTime?.date ?? null;

    return firstEmployeeDate || machineDate || null;
}

export function buildPreview({
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
}) {
    return {
        process: selectedProcess
            ? {
                id: selectedProcess.id,
                name: selectedProcess.name,
                isTask: Boolean(selectedProcess.is_task),
                requiresQuantity: Boolean(selectedProcess.requires_quantity),
                requiresRemarks: Boolean(selectedProcess.requires_remarks),
            }
            : null,

        machine: selectedMachine
            ? {
                id: selectedMachine.id,
                name: selectedMachine.name,
            }
            : null,

        flags: {
            requiresTasks,
            requiresQuantity,
            requiresRemarks,
            isRework,
        },

        employees: selectedEmployees.map((employee) => ({
            id: employee.id,
            name:
                employee.fullName ??
                `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim(),
            time: normalizeTimeValue(employee.time),
        })),

        tasks: selectedTasks.map((task) => ({
            id: task.id,
            jiraKey: task.jiraKey,
            name: task.name,
            quantity: task?.report?.quantity ?? null,
            quantityGood: task?.report?.quantityGood ?? null,
            quantityScrap: task?.report?.quantityScrap ?? null,
            remarks: task?.report?.remarks ?? null,
            is_rework: task?.report?.is_rework ?? false,
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

export function buildValidation({
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
}) {
    const errors = [];

    if (!selectedProcess) {
        errors.push("Brak wybranego procesu.");
    }

    if (!selectedEmployees.length) {
        errors.push("Brak wybranych pracowników.");
    }

    if (requiresTasks && !selectedTasks.length) {
        errors.push("Brak wybranych tasków.");
    }

    if (requiresTasks && requiresQuantity) {
        const missingQuantity = selectedTasks.some(
            (task) => !Number(task?.report?.quantity || 0)
        );

        if (missingQuantity) {
            errors.push("Każdy task musi mieć uzupełnioną ilość czynności.");
        }
    }

    if (requiresTasks && requiresRemarks) {
        const missingRemarks = selectedTasks.some(
            (task) => !(task?.report?.remarks ?? "").trim()
        );

        if (missingRemarks) {
            errors.push("Każdy task musi mieć uzupełnione uwagi.");
        }
    }

    if (requiresTasks && selectedProcess?.machines?.length > 0 && !selectedMachine) {
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

    if (requiresTasks && !allocations.length) {
        errors.push("Brak poprawnej alokacji tasków. Uzupełnij ilości.");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}