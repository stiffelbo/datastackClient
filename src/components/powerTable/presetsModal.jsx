import React, { useMemo, useState } from 'react';
import {
  Modal, Box, Stack, Typography, Divider, IconButton, Button, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

// 👇 zamiast swoich funkcji, importujesz z usePresets.js
import { normalizeOverrides, equalOverrides, importPresetFromFile, exportPresetToFile } from './hooks/usePresets';
import PresetsList from './presetsUI/presetsList';
import PresetForm from './presetsUI/presetForm';
import PresetGroups from './presetsUI/presetGroups';

const PresetsModal = ({ open, onClose, presets, columns }) => {
  const {
    list = [],
    activeName,
    dirty,
    save,
    saveAs,
    discard,
    setActive,
    remove,
    rename,
    stage,
    persistedActive,
  } = presets || {};

  // 🔑 lokalny diff – ale teraz na tych samych helperach
  const localDirty = useMemo(() => {
    const current = normalizeOverrides(columns?.columns || []);
    const persisted = normalizeOverrides(persistedActive?.columns || []);
    return !equalOverrides(current, persisted);
  }, [columns, persistedActive]);

  const canSave = dirty || localDirty;

  // --- Save As state ---
  const [saveAsName, setSaveAsName] = useState('');
  const saveAsError = useMemo(() => {
    const trimmed = saveAsName.trim();
    if (!trimmed) return null;
    if (list.includes(trimmed)) return 'Taka nazwa już istnieje';
    if (trimmed.length < 2) return 'Nazwa za krótka';
    return null;
  }, [saveAsName, list]);


  // --- Delete confirm ---
  const [confirmDeleteName, setConfirmDeleteName] = useState(null);

  const handleSave = () => {
    const current = normalizeOverrides(columns?.columns || []);
    stage(current);
    save(current);
  };


  return (
    <Modal open={open} onClose={onClose}>
      <Box
        role="dialog"
        aria-modal="true"
        sx={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(1100px, 90vw)',
          height: 'min(80vh, 800px)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h6">Presety tabeli</Typography>
            {canSave ? (
              <Tooltip title="Masz niezapisane zmiany w układzie kolumn">
                <Chip size="small" color="warning" label="Niezapisane" />
              </Tooltip>
            ) : (
              <Chip size="small" label="Stan zapisany" />
            )}
          </Stack>

          <Stack direction="row" alignItems="center" gap={1}>
            <Tooltip title="Zapisz do aktywnego presetu">
              <span>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  Zapisz
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Odrzuć niezapisane zmiany">
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={discard}
                  disabled={!dirty}   // odrzuca tylko to, co było staged; lokalny diff zostaje
                >
                  Odrzuć
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Zrob deafultowy preset na nowo">
              <span>
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  startIcon={<RefreshIcon />}
                  onClick={() => presets.reinitialize()}
                >
                  Odśwież
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        <Divider />

        {/* Content */}
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ flex: 1, minHeight: 0 }}>
          {/* Left: list */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <PresetsList presets={presets}/>
          </Box>

          {/* Right: actions */}
          <Box sx={{ flex: 0.7, minWidth: 0, overflow: 'scroll' }}>
            <PresetForm
              presets={presets}
              columns={columns}
              onClose={onClose}
            />
            <PresetGroups 
              columns={columns}
            />
          </Box>
        </Stack>

        <Divider />

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

      </Box>
    </Modal>
  );
};

export default PresetsModal;
