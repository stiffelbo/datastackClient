import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Box,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";

import useEntityPresets from "../../../hooks/useEntityPresets";

import EntityQueryManagerNavigation from './EntityQueryManagerNavigation';
import EntityQueryPresetsList from "./EntityQueryPresetsList";
import EntityQueryActiveStoredPreset from "./EntityQueryActiveStoredPreset";

import {
    createEntityQueryPresetDraft,
    getFilterableFields,
    getOptionFieldNames,
    makeFilterOptions,
    createEmptyEntityQuery,
    normalizeEntityQuery,
    ENTITY_PRESET_MODE_ALL,
    getEntityPresetCounters,
    filterEntityPresets,
    getActivePreset
} from "./entityQueryUtils";
import EntityQueryPresetConfigurator from "./EntityQueryPresetConfigurator";

const BASE_ENDPOINT = "/entity_presets";
const PRESET_TYPE = "entityQuery";

const VIEW_PRESETS = "presets";
const VIEW_CONFIGURATOR = "configurator";
const MODE_ALL = "all";

const EntityQueryManager = ({ entity, onClose = () => { } }) => {
    const [view, setView] = useState(VIEW_PRESETS);
    const [selectedPresetId, setSelectedPresetId] = useState(null);

    const [presetMode, setPresetMode] = useState(ENTITY_PRESET_MODE_ALL); //stan filtrów listy

    const schema = entity?.schema ?? {};
    const entityName = String(schema.entityName ?? "").trim();

    const filterableFields = getFilterableFields(schema);
    const optionFieldNames = getOptionFieldNames(filterableFields);

    const entityPresets = useEntityPresets({
        baseEndpoint: BASE_ENDPOINT,
        entityName,
        presetType: PRESET_TYPE,
        optionsFields: optionFieldNames,
    });

    const filterOptions = makeFilterOptions({
        options: entityPresets.options,
        filterableFields,
        schema,
    });

    const configuratorPreset =
        selectedPresetId === null
            ? null
            : entityPresets.presets.find((preset) => {
                return preset.id === selectedPresetId;
            }) ?? null;

    const configuratorDraft = createEntityQueryPresetDraft({
        preset: configuratorPreset,
    });

    useEffect(() => {
        if (!entityName) {
            return;
        }
        entityPresets.fetchPresets();
    }, [
        entityName,
        entityPresets.fetchPresets,
    ]);

    //sets db stored active preset to state whenever changes
    useEffect(() => {
        setSelectedPresetId(entityPresets.selectedPresetId);
    }, [entityPresets.selectedPresetId]);

    const handleSelectPreset = async (presetId) => {
        const result = await entityPresets.selectPreset(presetId);
    };

    const handleStartCreatePreset = () => {
        setSelectedPresetId(null);
        setView(VIEW_CONFIGURATOR);
    };

    const handleEditPreset = (presetId) => {
        setSelectedPresetId(presetId);
        setView(VIEW_CONFIGURATOR);
    };

    const handleCancelConfigurator = () => {
        setSelectedPresetId(null);
        setView(VIEW_PRESETS);
    };

    const handleSavePreset = async (preset) => {
        //edytowany preset czyjkolwiek
        if(preset.id)
        {
           const result = await entityPresets.updatePreset(preset);
        }
        else //nowy preset
        {
            const result = await entityPresets.createPreset(preset);
        }
        
        setView(VIEW_PRESETS);
    };

    const handleDeletePreset = async (presetId) => {
        await entityPresets.deletePreset(presetId);

        if (selectedPresetId === presetId) {
            setSelectedPresetId(null);
        }
    };

    if (!entityName) {
        return (
            <Alert severity="error">
                Brak nazwy encji w przekazanym schemacie.
            </Alert>
        );
    }

    if (entityPresets.loading && entityPresets.presets.length === 0) {
        return (
            <Box
                sx={{
                    width: "100%",
                    minHeight: 240,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress size={28} />
            </Box>
        );
    }

    const presetCounters = getEntityPresetCounters(entityPresets.presets);
    const visiblePresets = filterEntityPresets({ presets: entityPresets.presets, mode: presetMode });
    const activePreset = getActivePreset({ presets: entityPresets.presets, selectedPresetId: selectedPresetId });
    return (
        <Box
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
            {entityPresets.error && (
                <Alert
                    severity="error"
                    sx={{
                        mx: 2,
                        mt: 2,
                    }}
                >
                    {entityPresets.error}
                </Alert>
            )}
            <EntityQueryManagerNavigation
                view={view}
                activePreset={activePreset}
                activeStoredPreset={entityPresets.activePreset}
                busy={entityPresets.busy}
                presetMode={presetMode}
                presetCounters={presetCounters}
                onPresetModeChange={setPresetMode}
                onShowPresets={() => setView(VIEW_PRESETS)}
                onStartCreatePreset={handleStartCreatePreset}
                onShowEditor={() => setView(VIEW_CONFIGURATOR)}
                onClose={onClose}
            >
                <EntityQueryActiveStoredPreset 
                    activePreset={entityPresets.activePreset}
                    filterOptions={filterOptions}
                    filterableFields={filterableFields}
                    onClear={entityPresets.clearState}
                />
            </EntityQueryManagerNavigation>
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                }}
            >
                {view === VIEW_PRESETS && (
                    <EntityQueryPresetsList
                        presets={visiblePresets}
                        selectedPresetId={selectedPresetId}
                        busy={entityPresets.busy}
                        onSelect={handleSelectPreset}
                        onDelete={handleDeletePreset}
                        onClose={onClose}
                    />
                )}

                {view === VIEW_CONFIGURATOR && (
                    <EntityQueryPresetConfigurator
                        mode={null}
                        preset={activePreset}
                        filterableFields={filterableFields}
                        filterOptions={filterOptions}
                        submitting={entityPresets.busy}
                        onSave={handleSavePreset}
                        onChange={(data)=>{}} //store user state??
                    />
                )}
            </Box>
        </Box>
    );
};

export default EntityQueryManager;