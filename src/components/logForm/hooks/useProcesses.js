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

function getTasksFormSettings(selectedProcess) {
    if (!selectedProcess) {
        return {
            qty: { show: false, disabled: true, initialValue: "", required: false },
            qtyGood: { show: false, disabled: true, initialValue: "", required: false },
            qtyScrap: { show: false, disabled: true, initialValue: "", required: false },
            structures: { show: false, disabled: true, initialValue: "", required: true },
            remarks: { show: false, disabled: true, initialValue: "", required: false },
        };
    }

    const isGeneral = Boolean(selectedProcess.is_general);
    const isProduction = Boolean(selectedProcess.is_production);
    const isDesign = Boolean(selectedProcess.is_design);
    const isSetup = Boolean(selectedProcess.is_setup);

    const requiresQuantity = Boolean(selectedProcess.requires_quantity);
    const requiresRemarks = Boolean(selectedProcess.requires_remarks);

    const isProductionReporting =
        isProduction && !isDesign && !isSetup && !isGeneral;

    return {
        qty: {
            show: true,
            disabled: false,
            initialValue: isGeneral || !requiresQuantity ? 1 : "",
            required: requiresQuantity && !isGeneral,
            label: isGeneral
                ? `Ilość czynności: ${selectedProcess.name}`
                : `Ilość wykonanej czynności: ${selectedProcess.name}`,
            description: isGeneral
                ? "Proces ogólny jest raportowany jako pojedyncza czynność. Ilość została zablokowana."
                : "Ilość wykonanej czynności przypisana do taska.",
        },

        qtyGood: {
            show: isProductionReporting,
            disabled: !isProductionReporting,
            initialValue: "",
            required: false,
            label: `Ilość dobrych wyrobów: ${selectedProcess.finishedProduct ?? ""}`,
            description: isProductionReporting
                ? "Liczba poprawnie wykonanych wyrobów w ramach procesu produkcyjnego."
                : "Pole dostępne tylko dla procesów produkcyjnych.",
        },

        qtyScrap: {
            show: isProductionReporting,
            disabled: !isProductionReporting,
            initialValue: "",
            required: false,
            label: `Ilość odpadów: ${selectedProcess.finishedProduct ?? ""}`,
            description: isProductionReporting
                ? "Liczba braków lub odpadów powstałych podczas procesu produkcyjnego."
                : "Pole dostępne tylko dla procesów produkcyjnych.",
        },

        remarks: {
            show: true,
            disabled: false,
            initialValue: "",
            required: requiresRemarks,
            label: "Uwagi dotyczące wykonania",
            description: requiresRemarks
                ? "Komentarz jest wymagany dla tego procesu."
                : "Opcjonalny komentarz do raportowanego wykonania.",
        },

        structures: {
            show: !isProduction,
            disabled: false,
            initialValue: selectedProcess.structureId,
            required: true,
            label: "Dział dla którego wykonywana praca",
            description: "",
        },

        meta: {
            isGeneral,
            requiresTasks: !isGeneral,
            isProductionReporting,
            disableOutputs: !isProductionReporting,
            reason: isGeneral
                ? "Proces ogólny — bez rozliczania tasków produkcyjnych i wydań."
                : !isProductionReporting
                    ? "Proces nie jest klasycznym procesem produkcyjnym — pola produkcyjne są ukryte lub zablokowane."
                    : "Proces produkcyjny — dostępne raportowanie ilości dobrej i odpadu.",
        },
    };
}

export default function useProcessForm({
    processes = [],
    initialProcessId = "",
    initialIsRework = false,
    onChange,
    employeeTimeMap = {},
    mode = "process"
}) {

    const [structureId, setStructureId] = useState(null);
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

    const machineOptions = machines.map((machine) => ({
        id: machine.id,
        val: machine.name,
        isConstant: machine.isConstant,
        required: machine.required
    }));

    useEffect(() => {
        if (mode === "process") {
            setMachineId(requiredMachineId);
        }

        setIsRework(Boolean(initialIsRework));
        setMachineTime(getMachineTime(employeeTimeMap));
        setMaterialsReport(createMaterialsReport(materials));

        if(selectedProcess){
            console.log(selectedProcess);
            setStructureId(selectedProcess.structureId);
        }
    }, [
        processId,
        mode,
        requiredMachineId,
    ]);

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

    function handleStructureChange(nextStructureId) {
        setStructureId(nextStructureId);
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
        setStructureId(null);
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
            structureId,
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

        settings: {
            tasks: getTasksFormSettings(selectedProcess),
        },

        actions: {
            handleStructureChange,
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