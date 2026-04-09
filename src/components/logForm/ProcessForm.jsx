import React, { useMemo, useState, useEffect } from "react";
import {
    Box,
    Stack,
    Typography,
} from "@mui/material";

import InputSelectObject from "./InputSelectObject";
import InputNumber from "./InputNumber";

import { processesDto } from "./dto/processesDto";

const ProcessForm = ({ user, onChange }) => {
    const processes = useMemo(
        () => processesDto(user?.processes),
        [user?.processes]
    );

    const [processId, setProcessId] = useState("");
    const [machineId, setMachineId] = useState("");
    const [materials, setMaterials] = useState({});

    const selectedProcess = useMemo(
        () => processes.find((p) => String(p.id) === String(processId)) ?? null,
        [processes, processId]
    );

    // 🔴 reset zależnych danych przy zmianie procesu
    useEffect(() => {
        setMachineId("");
        setMaterials({});
    }, [processId]);

    // 🔴 emit do parenta
    useEffect(() => {
        if (typeof onChange !== "function") return;

        onChange({
            processId,
            process: selectedProcess,
            machineId,
            materials,
        });
    }, [processId, machineId, materials, selectedProcess, onChange]);

    const handleProcessChange = (val) => {
        setProcessId(val);
    };

    const handleMachineChange = (val) => {
        setMachineId(val);
    };

    const handleMaterialChange = (materialId, value) => {
        setMaterials((prev) => ({
            ...prev,
            [materialId]: value,
        }));
    };

    const processOptions = processes.map((p) => ({
        id: p.id,
        val: p.name,
        title: p.description,
    }));

    const machineOptions = selectedProcess?.machines?.map((m) => ({
        id: m.id,
        val: m.name,
    })) ?? [];

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
                <Typography variant="subtitle2" fontWeight={600}>
                    Proces
                </Typography>

                {/* SELECT PROCESU */}
                <InputSelectObject
                    selectOptions={processOptions}
                    value={processId}
                    label="Wybierz czynność"
                    onChange={handleProcessChange}
                />

                {/* MASZYNY */}
                {selectedProcess?.machines?.length > 0 && (
                    <InputSelectObject
                        selectOptions={machineOptions}
                        value={machineId}
                        label="Maszyna"
                        onChange={handleMachineChange}
                    />
                )}

                {/* MATERIAŁY */}
                {selectedProcess?.materials?.length > 0 && (
                    <Stack spacing={2}>
                        <Typography variant="body2" fontWeight={500}>
                            Materiały
                        </Typography>

                        {selectedProcess.materials.map((material) => (
                            <InputNumber
                                key={material.id}
                                label={`${material.name}${material.unit ? ` (${material.unit})` : ""}`}
                                value={materials[material.id] ?? ""}
                                required={material.required}
                                step={material.step}
                                min={0}
                                onChange={(val) =>
                                    handleMaterialChange(material.id, val)
                                }
                            />
                        ))}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
};

export default ProcessForm;