import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import SettingsColumnsConfigurator from "./settingsColumnsConfigurator";
import FieldForm from "./fieldForm";

const SettingsColumns = ({ columnsSchema, entityName = "defaultEntity" }) => {
  const {
    presets,
    currentPresetName,
    loadPreset,
    savePreset,
    deletePreset,
    editPresetName,
    resetChanges,
    dirty,
  } = columnsSchema;

  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleRenamePreset = (newName) => {
    // skopiuj obecny preset pod nową nazwą, usuń stary, załaduj nowy
    const currentPreset = presets[currentPresetName];
    if (!currentPreset) return;

    editPresetName(newName, currentPreset);
    loadPreset(newName);
    setIsEditing(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Układ kolumn – {entityName}
      </Typography>

      {/* Preset Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        {/* Preset Selector */}
        <Select
          size="small"
          value={currentPresetName}
          onChange={(e) => loadPreset(e.target.value)}
          label="Aktualny preset"
          sx={{ width: 200 }}
        >
          {Object.keys(presets || {}).map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>

        {/* Delete */}
        <Button
          variant="outlined"
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => deletePreset(currentPresetName)}
        >
          Usuń '{currentPresetName}'
        </Button>

        {/* Toggle Edit Mode */}
        <Button
          variant="outlined"
          size="small"
          color="primary"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          {isEditing ? "Anuluj edycję" : `Zmień nazwę '${currentPresetName}'`}
        </Button>

        {/* Rename Form */}
        {isEditing && (
          <FieldForm
            onCommit={handleRenamePreset}
            initialValue={currentPresetName}
            editMode
            restricted={Object.keys(presets).filter((k) => k !== currentPresetName)}
            validate={(val) => val.length > 2}
            sanitize={(val) => val.replace(/[^a-zA-Z0-9_-]/g, "").trim()}
            textFieldProps={{
              label: "Nowa nazwa",
              placeholder: "np. raport_sierpien",
              sx: { maxWidth: 300 },
            }}
          />
        )}

        {/* Reset */}
        {dirty && (
          <Chip
            label="Zmodyfikowano"
            onDelete={resetChanges}
            color="warning"
            size="small"
          />
        )}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Configurator */}
      <SettingsColumnsConfigurator
        columnsSchema={columnsSchema}
        entityName={entityName}
        presetName={currentPresetName}
        width={800}
        height={800}
      />
    </Box>
  );
};

export default SettingsColumns;
