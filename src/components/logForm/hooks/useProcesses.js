import { useEffect, useMemo, useState } from "react";

import { normalizeTimeValue, isSameTime } from "../utils";

function createMaterialReportRow(material) {
    return {
        materialId: material?.id ?? null,
        name: material?.name ?? "",
        unit: material?.unit ?? "",
        step: material?.step ?? 0.01,
        required: Boolean(material?.required),

        qty: "",
        wasteQty: "",
    };
}

function createMaterialsReport(materials = []) {
    const result = {};

    materials.forEach((material) => {
        if (!material?.id) return;
        result[material.id] = createMaterialReportRow(material);
    });

    return result;
}

function areMaterialReportsEqual(a = {}, b = {}) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) => {
        const left = a[key] ?? {};
        const right = b[key] ?? {};

        return (
            left.materialId === right.materialId &&
            left.name === right.name &&
            left.unit === right.unit &&
            left.step === right.step &&
            left.required === right.required &&
            String(left.qty ?? "") === String(right.qty ?? "") &&
            String(left.wasteQty ?? "") === String(right.wasteQty ?? "")
        );
    });
}

export default function useProcessForm({
    processes = [],
    initialProcessId = "",
    initialMachineTime = null,
    initialIsRework = false,
    onChange,
}) {
    const [processId, setProcessId] = useState(initialProcessId);
    const [machineId, setMachineId] = useState("");
    const [isRework, setIsRework] = useState(Boolean(initialIsRework));
    const [machineTime, setMachineTime] = useState(
        normalizeTimeValue(initialMachineTime)
    );
    const [materialsReport, setMaterialsReport] = useState({});

    const selectedProcess = useMemo(() => {
        return processes.find((item) => String(item.id) === String(processId)) ?? null;
    }, [processes, processId]);

    const machines = selectedProcess?.machines ?? [];
    const materials = selectedProcess?.materials ?? [];

    const processOptions = useMemo(() => {
        return processes.map((process) => ({
            id: process.id,
            val: process.name,
            title: process.description,
        }));
    }, [processes]);

    const machineOptions = useMemo(() => {
        return machines.map((machine) => ({
            id: machine.id,
            val: machine.name,
        }));
    }, [machines]);

    useEffect(() => {
        setMachineId("");
        setIsRework(Boolean(initialIsRework));
        setMachineTime(normalizeTimeValue(initialMachineTime));
        setMaterialsReport(createMaterialsReport(materials));
    }, [processId]);

    useEffect(() => {
        const nextTime = normalizeTimeValue(initialMachineTime);

        setMachineTime((prev) => {
            if (isSameTime(prev, nextTime)) return prev;
            return nextTime;
        });
    }, [
        initialMachineTime?.date,
        initialMachineTime?.start,
        initialMachineTime?.end,
        initialMachineTime?.duration,
    ]);

    useEffect(() => {
        if (typeof onChange !== "function") return;

        onChange({
            processId,
            process: selectedProcess,
            machineId,
            isRework,
            machineTime,
            materialsReport,
        });
    }, [
        processId,
        selectedProcess,
        machineId,
        isRework,
        machineTime,
        materialsReport,
        onChange,
    ]);

    function handleProcessChange(nextProcessId) {
        setProcessId(nextProcessId);
    }

    function handleMachineChange(nextMachineId) {
        setMachineId(nextMachineId);
    }

    function handleReworkChange(nextValue) {
        setIsRework(Boolean(nextValue));
    }

    function handleMachineTimeChange(nextTime) {
        const normalized = normalizeTimeValue(nextTime);

        setMachineTime((prev) => {
            if (isSameTime(prev, normalized)) return prev;
            return normalized;
        });
    }

    function handleMaterialFieldChange(materialId, field, value) {
        setMaterialsReport((prev) => {
            const current = prev[materialId];
            if (!current) return prev;

            const next = {
                ...prev,
                [materialId]: {
                    ...current,
                    [field]: value,
                },
            };

            if (areMaterialReportsEqual(prev, next)) return prev;
            return next;
        });
    }

    function resetProcesses() {
        setProcessId("");
        setMachineId("");
        setIsRework(Boolean(initialIsRework));
        setMachineTime(normalizeTimeValue(initialMachineTime));
        setMaterialsReport({});
    }

    const selectedMachine = useMemo(() => {
        return machines.find((item) => String(item.id) === String(machineId)) ?? null;
    }, [machines, machineId]);

    const requiredMaterials = useMemo(() => {
        return materials.filter((item) => item.required);
    }, [materials]);

    const hasMachines = machines.length > 0;
    const hasMaterials = materials.length > 0;

    return {
        state: {
            processId,
            machineId,
            isRework,
            machineTime,
            materialsReport,
        },

        data: {
            selectedProcess,
            selectedMachine,
            processes,
            machines,
            materials,
        },

        options: {
            processOptions,
            machineOptions,
        },

        actions: {
            handleProcessChange,
            handleMachineChange,
            handleReworkChange,
            handleMachineTimeChange,
            handleMaterialFieldChange,
            resetProcesses,
        },

        computed: {
            hasProcess: Boolean(selectedProcess),
            hasMachines,
            hasMaterials,
            requiredMaterials,
        },
    };
}