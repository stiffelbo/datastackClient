import React, { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Divider,
    Paper,
    Stack,
} from "@mui/material";

import EntityQueryPresetMetadata from "./EntityQueryPresetMetadata";
import EntityQueryFiltersConfigurator from "./filters/EntityQueryFiltersConfigurator";

import {
    cloneEntityQueryPreset,
    createEntityQueryPresetDraft,
    getPresetId,
    normalizeEntityQueryPreset,
    updateEntityQueryPresetQuerySection,
} from "./entityQueryUtils";

const EntityQueryPresetConfigurator = ({
    preset = null,
    filterableFields = [],
    filterOptions = {},
    submitting = false,
    onSave = () => { },
    onChange = () => { },
}) => {
    const [draft, setDraft] = useState(() => createEntityQueryPresetDraft(preset));
    const [errors, setErrors] = useState({});
    const [actionError, setActionError] = useState("");

    const presetId = getPresetId(preset);
    const editing = presetId !== null;
    const state = draft?.state ?? {};

    useEffect(() => {
        setDraft(createEntityQueryPresetDraft(preset));
        setErrors({});
        setActionError("");
    }, [preset]);

    useEffect(() => {
        onChange(cloneEntityQueryPreset(draft));
    }, [draft, onChange]);

    const updateMetadata = (metadata) => {
        setDraft((currentDraft) => ({
            ...currentDraft,
            ...metadata,
        }));

        setErrors((currentErrors) => {
            const nextErrors = { ...currentErrors };

            Object.keys(metadata).forEach((fieldName) => {
                delete nextErrors[fieldName];
            });

            return nextErrors;
        });

        setActionError("");
    };

    const updateStateSection = (section, value) => {
        setDraft((currentDraft) => ({
            ...currentDraft,
            state: {
                ...currentDraft.state,
                [section]: value,
            },
        }));

        setActionError("");
    };

    const validate = () => {
        const nextErrors = {};
        const name = String(draft?.name ?? "").trim();
        const description = String(draft?.description ?? "");

        if (name === "") {
            nextErrors.name = "Nazwa presetu jest wymagana.";
        }

        if (name.length > 120) {
            nextErrors.name = "Nazwa presetu może mieć maksymalnie 120 znaków.";
        }

        if (description.length > 500) {
            nextErrors.description = "Opis presetu może mieć maksymalnie 500 znaków.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const buildPayload = () => {
        return cloneEntityQueryPreset({
            ...draft,
            name: String(draft?.name ?? "").trim(),
            description: String(draft?.description ?? "").trim(),
            public: Boolean(draft?.public),
        });
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setActionError("");

        try {
            const payload = buildPayload();
            await onSave(payload);
        } catch (error) {
            setActionError(String(error?.message ?? "Nie udało się zapisać presetu."));
        }
    };

    const renderMetadataSection = () => {
        return (
            <Box component="section" aria-label="Metadane presetu">
                <EntityQueryPresetMetadata
                    value={{
                        name: draft.name,
                        description: draft.description,
                        isPublic: draft.isPublic,
                    }}
                    disabled={submitting}
                    errors={errors}
                    onChange={updateMetadata}
                />
            </Box>
        );
    };

    const renderFiltersSection = () => {
        return (
            <Box component="section" aria-label="Filtry zapytania">
                <EntityQueryFiltersConfigurator
                    fields={filterableFields}
                    options={filterOptions}
                    value={state.filters ?? []}
                    disabled={submitting}
                    onChange={(filters) => updateStateSection("filters", filters)}
                />
            </Box>
        );
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                width: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {actionError !== "" && (
                <Alert
                    severity="error"
                    onClose={() => setActionError("")}
                    sx={{ m: 1 }}
                >
                    {actionError}
                </Alert>
            )}

            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    overflow: "auto",
                }}
            >
                <Stack divider={<Divider flexItem />}>
                    {renderMetadataSection()}
                    {renderFiltersSection()}
                </Stack>
            </Box>

            <Box
                sx={{
                    px: 1,
                    py: 0.75,
                    borderTop: 1,
                    borderColor: "divider",
                    flexShrink: 0,
                    pb: 3,
                }}
            >
                <Button
                    variant="contained"
                    disabled={submitting}
                    onClick={handleSubmit}
                    fullWidth
                >
                    {editing ? "Zapisz zmiany" : "Utwórz preset"}
                </Button>
            </Box>
        </Paper>
    );
};

export default EntityQueryPresetConfigurator;