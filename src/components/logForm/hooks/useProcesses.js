import { useEffect, useState } from "react";

import { normalizeTimeValue, isSameTime } from "../utils";

//Maszyny czasy osobne nie działają

function createMaterialReportRow(material) {
    return {
        materialId: material?.id ?? null,
        name: material?.name ?? "",
        unit: material?.unit ?? "",
        step: material?.step ?? 0.01,
        required: Boolean(material?.required),
        canWaste: Boolean(material?.canWaste),

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

function timeToMinutes(value) {
    const time = String(value ?? "").padStart(4, "0");

    const hours = Number(time.slice(0, 2));
    const minutes = Number(time.slice(2, 4));

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}${String(mins).padStart(2, "0")}`;
}

function getMachineTime(employeeTimeMap = {}) {
    const employeeTimes = Object.values(employeeTimeMap)
        .filter((item) => item?.date && item?.start && item?.end)
        .map((item) => ({
            ...item,
            startMinutes: timeToMinutes(item.start),
            endMinutes: timeToMinutes(item.end),
        }))
        .filter((item) => (
            item.startMinutes !== null &&
            item.endMinutes !== null &&
            item.endMinutes > item.startMinutes
        ));

    if (employeeTimes.length === 0) {
        return normalizeTimeValue(null);
    }

    const startMinutes = Math.min(
        ...employeeTimes.map((item) => item.startMinutes)
    );

    const endMinutes = Math.max(
        ...employeeTimes.map((item) => item.endMinutes)
    );

    return normalizeTimeValue({
        date: employeeTimes[0].date,
        start: minutesToTime(startMinutes),
        end: minutesToTime(endMinutes),
        duration: (endMinutes - startMinutes) / 60,
    });
}

function getEmployeeTimeSignature(employeeTimeMap = {}) {
    return Object.values(employeeTimeMap)
        .filter((item) => item?.date && item?.start && item?.end)
        .map((item) => `${item.date}|${item.start}|${item.end}`)
        .sort()
        .join(";");
}

export default function useProcessForm({
    processes = [],
    initialProcessId = "",
    initialIsRework = false,
    onChange,
    employeeTimeMap = {}
}) {

    const [processId, setProcessId] = useState(initialProcessId);
    const [machineId, setMachineId] = useState("");
    const [isRework, setIsRework] = useState(Boolean(initialIsRework));
    const [machineTime, setMachineTime] = useState(
        getMachineTime(employeeTimeMap)
    )
    const [materialsReport, setMaterialsReport] = useState({});

    const selectedProcess = processes.find((item) => String(item.id) === String(processId)) ?? null;

    const machines = selectedProcess?.machines ?? [];
    const materials = selectedProcess?.materials ?? [];

    const requiredMachine = machines.find(machine => machine?.required) || null;
    const requiredMachineId = requiredMachine ? requiredMachine.id : '';

    const employeeTimeSignature =
        getEmployeeTimeSignature(employeeTimeMap);

    const processOptions = processes.map((process) => ({
        id: process.id,
        val: process.name,
        title: process.description,
    }));

    const machineOptions = machines.map((machine) => ({
        id: machine.id,
        val: machine.name,
        isConstant: machine.isConstant,
        required: machine.required
    }));

    useEffect(() => {
        setMachineId(requiredMachineId);
        setIsRework(Boolean(initialIsRework));
        setMachineTime(getMachineTime(employeeTimeMap));
        setMaterialsReport(createMaterialsReport(materials));
    }, [processId]);

    useEffect(() => {
        const nextTime = getMachineTime(employeeTimeMap);

        setMachineTime((prev) => {
            if (isSameTime(prev, nextTime)) return prev;
            return nextTime;
        });
    }, [employeeTimeSignature]);


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
        setMachineTime(getMachineTime(employeeTimeMap));
        setMaterialsReport({});
    }

    const selectedMachine =
        machines.find((item) => String(item.id) === String(machineId)) ?? null;

    const requiredMaterials =
        materials.filter((item) => item.required);

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