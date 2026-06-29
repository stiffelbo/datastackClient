import React from "react";

import {exportPresetToFile, importPresetFromFile} from '../hooks/presetUtils';

import { Stack, Button, Input, IconButton } from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

const PresetFile = ({ presets, onClose }) => {

    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} >
            <Stack direction="row" gap={1}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SaveAsIcon />}
                    onClick={() => exportPresetToFile(presets?.env, presets?.activeName)}
                    title="Eksportuj aktywny preset do pliku .json"
                >
                    Eksportuj
                </Button>

                <Button
                    component="label"
                    size="small"
                    variant="outlined"
                    color="warning"
                    title="Wgraj plik z presetem, nazwa pliku zostanie użyta jak nazwa presetu po imporcie"
                    startIcon={<SaveIcon />}
                >
                    Importuj
                    <input
                        type="file"
                        hidden
                        accept="application/json"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            try {
                                const { name, data } = await importPresetFromFile(file);
                                presets.saveAs(name, data.columns);
                            } catch (err) {
                                alert('Nie udało się zaimportować pliku. Sprawdź jego strukturę.');
                            }
                        }}
                    />
                </Button>
            </Stack>

            <IconButton onClick={onClose} size="small" color="error">
                <CloseIcon />
            </IconButton>
        </Stack>
    );
}

export default PresetFile;