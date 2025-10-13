import React, { useMemo, useState } from "react";
import {
  Stack,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment
} from "@mui/material";
import {
  Save as SaveIcon,
  SaveAs as SaveAsIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { normalizeOverrides, equalOverrides } from '../hooks/usePresets';


const PresetForm = ({
  presets,
  columns,
  onClose
}) => {
  const {
    dirty,
    save,
    saveAs,
    discard,
    reinitialize,
    persistedActive,
    stage,
    list,
  } = presets || {};

  // 🔍 lokalny diff (czy kolumny różnią się od zapisanych)
  const localDirty = useMemo(() => {
    const current = normalizeOverrides(columns?.columns || []);
    const persisted = normalizeOverrides(persistedActive?.columns || []);
    return !equalOverrides(current, persisted);
  }, [columns, persistedActive]);

  const canSave = dirty || localDirty;

  // 🔸 stan Save As
  const [saveAsName, setSaveAsName] = useState("");
  const saveAsError = useMemo(() => {
    const trimmed = saveAsName.trim();
    if (!trimmed) return null;
    if (list.includes(trimmed)) return "Taka nazwa już istnieje";
    if (trimmed.length < 2) return "Nazwa za krótka";
    return null;
  }, [saveAsName, list]);

  const handleSave = () => {
    const current = normalizeOverrides(columns?.columns || []);
    stage(current);
    save(current);
  };

  const handleSaveAs = () => {
    const name = saveAsName.trim();
    if (!name || saveAsError) return;
    const current = normalizeOverrides(columns?.columns || []);
    stage(current);
    saveAs(name, current);
    setSaveAsName("");
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
        <TextField
            label="Nazwa presetu"
            size="small"
            fullWidth
            value={saveAsName}
            onChange={(e) => setSaveAsName(e.target.value)}
            error={Boolean(saveAsError)}
            helperText={saveAsError || " "}
            InputProps={{
                endAdornment: (
                <InputAdornment position="end">
                    <Tooltip title="Zapisz jako nowy preset">
                    <span>
                        <IconButton
                            size="small"
                            onClick={handleSaveAs}
                            disabled={!saveAsName.trim() || Boolean(saveAsError)}
                            edge="end"
                            color={Boolean(saveAsError) ? 'warning' : 'success'}
                        >
                        <SaveAsIcon />
                        </IconButton>
                    </span>
                    </Tooltip>
                </InputAdornment>
                )
            }}
        />
    </Box>
  );
};

export default PresetForm;
