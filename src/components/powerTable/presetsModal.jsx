import React, { useMemo, useState } from 'react';
import {
  Modal, Box, Stack, Typography, Divider, List, ListItem, ListItemButton,
  ListItemText, IconButton, TextField, Button, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// 👇 zamiast swoich funkcji, importujesz z usePresets.js
import { normalizeOverrides, equalOverrides, importPresetFromFile, exportPresetToFile } from './hooks/usePresets';

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

  // --- Rename state ---
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // --- Delete confirm ---
  const [confirmDeleteName, setConfirmDeleteName] = useState(null);

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
    setSaveAsName('');
  };

  const handleKey = (e, action) => {
    if (e.key === 'Enter') action();
    if (e.key === 'Escape') onClose?.();
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
          </Stack>
        </Stack>

        <Divider />

        {/* Content */}
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ flex: 1, minHeight: 0 }}>
          {/* Left: list */}
          <Box sx={{ flex: '0 0 420px', borderRight: { md: 1, xs: 0 }, borderColor: 'divider', pr: { md: 2, xs: 0 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
              Lista presetów
            </Typography>

            <List dense sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              {list.length === 0 && (
                <Typography variant="body2" sx={{ opacity: 0.7, px: 2, py: 1 }}>
                  Brak presetów.
                </Typography>
              )}

              {list.map((name) => {
                const isActive = name === activeName;
                const isRenaming = renaming === name;
                return (
                  <ListItem
                    key={name}
                    disableGutters
                    secondaryAction={
                      isRenaming ? (
                        <Stack direction="row" gap={0.5}>
                          <IconButton size="small" color="success" onClick={confirmRename} aria-label="Zatwierdź">
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={cancelRename} aria-label="Anuluj">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" gap={0.5}>
                          <Tooltip title="Zmień nazwę">
                            <IconButton size="small" onClick={() => startRename(name)} aria-label="Zmień nazwę">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Usuń preset">
                            <IconButton
                              size="small"
                              onClick={() => setConfirmDeleteName(name)}
                              aria-label="Usuń"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )
                    }
                    sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' }, mb: 0.5 }}
                  >
                    {isRenaming ? (
                      <TextField
                        size="small"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => handleKey(e, confirmRename)}
                        autoFocus
                        sx={{ mr: 1, flex: 1 }}
                      />
                    ) : (
                      <ListItemButton
                        selected={isActive}
                        onClick={() => setActive(name)}
                        sx={{ borderRadius: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Typography variant="body2" fontWeight={isActive ? 600 : 400}>
                                {name}
                              </Typography>
                              {isActive && <Chip size="small" color="primary" label="Aktywny" />}
                              {isActive && canSave && (
                                <Chip size="small" color="warning" variant="outlined" label="Niezapisane" />
                              )}
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* Right: actions */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack gap={2}>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Akcje
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                <TextField
                  label="Zapisz jako…"
                  placeholder="np. compact / analytical"
                  size="small"
                  value={saveAsName}
                  onChange={(e) => setSaveAsName(e.target.value)}
                  onKeyDown={(e) => handleKey(e, handleSaveAs)}
                  error={Boolean(saveAsName && saveAsError)}
                  helperText={saveAsName ? saveAsError || ' ' : ' '}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  onClick={handleSaveAs}
                  disabled={!saveAsName.trim() || Boolean(saveAsError)}
                >
                  <SaveAsIcon />
                </IconButton>
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Wskazówka: porównujemy bieżący układ kolumn z zapisanym presetem.
                Jeśli się różnią, możesz <b>Zapisz</b> albo <b>Zapisz jako</b>.
              </Typography>
            </Stack>



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

          <Button onClick={onClose} size="small" startIcon={<CloseIcon />}>
            Zamknij
          </Button>
        </Stack>

        {/* Delete confirm */}
        <Dialog open={Boolean(confirmDeleteName)} onClose={() => setConfirmDeleteName(null)}>
          <DialogTitle>Usunąć preset „{confirmDeleteName}”?</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Tej operacji nie można cofnąć. Jeśli usuniesz aktywny preset, zostanie wybrany inny (np. „default”).
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteName(null)} size="small">Anuluj</Button>
            <Button
              color="error"
              variant="contained"
              startIcon={<DeleteIcon />}
              size="small"
              onClick={() => {
                remove(confirmDeleteName);
                setConfirmDeleteName(null);
              }}
            >
              Usuń
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
};

export default PresetsModal;
