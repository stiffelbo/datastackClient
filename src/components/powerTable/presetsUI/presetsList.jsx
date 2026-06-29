import React, { useMemo, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  IconButton,
  TextField,
  Chip,
  Tooltip,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';

import {
  Edit,
  Delete,
  Check,
  Close,
  Add,
} from '@mui/icons-material';

const PresetsList = ({ presets }) => {
  const {
    list = [],
    activeName,
    setActive,
    rename,
    remove,
    saveAs,
    dirty,
    effective,
  } = presets || {};

  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const normalizedNewName = newName.trim();

  const newNameError = useMemo(() => {
    if (!normalizedNewName) return null;
    if (normalizedNewName.length < 2) return 'Min. 2 znaki';
    if (list.includes(normalizedNewName)) return 'Nazwa zajęta';
    return null;
  }, [normalizedNewName, list]);

  const canCreate = !!normalizedNewName && !newNameError;

  const createPreset = () => {
    if (!canCreate) return;

    saveAs?.(normalizedNewName, effective?.columns || []);
    setNewName('');
  };

  const startRename = (name) => {
    setRenaming(name);
    setRenameValue(name);
  };

  const confirmRename = () => {
    const oldName = renaming;
    const nextName = renameValue.trim();

    if (!nextName || oldName === nextName) {
      setRenaming(null);
      setRenameValue('');
      return;
    }

    if (list.includes(nextName)) return;

    rename?.(oldName, nextName);
    setRenaming(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenaming(null);
    setRenameValue('');
  };

  return (
    <Stack gap={1.5} sx={{ height: '100%', minHeight: 0 }}>
      <Box>
        <TextField
          fullWidth
          size="small"
          value={newName}
          placeholder="Nowy preset..."
          error={!!newNameError}
          helperText={newNameError || ' '}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') createPreset();
            if (e.key === 'Escape') setNewName('');
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Dodaj preset">
                  <span>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={createPreset}
                      disabled={!canCreate}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider />

      <Box sx={{ minHeight: 0, flex: 1 }}>
        {!list.length ? (
          <Typography variant="body2" sx={{ opacity: 0.6, px: 1, py: 1 }}>
            Brak presetów.
          </Typography>
        ) : (
          <List
            dense
            disablePadding
            sx={{
              overflow: 'auto',
              maxHeight: '100%',
              pr: 0.5,
            }}
          >
            {list.map((name) => {
              const isActive = name === activeName;
              const isRenaming = renaming === name;
              const renameTrimmed = renameValue.trim();
              const renameInvalid =
                !renameTrimmed ||
                (renameTrimmed !== name && list.includes(renameTrimmed));

              return (
                <ListItem
                  key={name}
                  disableGutters
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  secondaryAction={
                    isRenaming ? (
                      <Stack direction="row" gap={0.5}>
                        <Tooltip title="Zatwierdź">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={confirmRename}
                              disabled={renameInvalid}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Anuluj">
                          <IconButton size="small" onClick={cancelRename}>
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Stack direction="row" gap={0.5}>
                        <Tooltip title="Zmień nazwę">
                          <IconButton
                            size="small"
                            onClick={() => startRename(name)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Usuń preset">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => remove?.(name)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )
                  }
                >
                  {isRenaming ? (
                    <TextField
                      size="small"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename();
                        if (e.key === 'Escape') cancelRename();
                      }}
                      autoFocus
                      error={renameInvalid}
                      sx={{ flex: 1, mr: 7 }}
                    />
                  ) : (
                    <ListItemButton
                      selected={isActive}
                      onClick={() => setActive?.(name)}
                      sx={{
                        borderRadius: 1,
                        pr: 8,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Typography
                              variant="body2"
                              fontWeight={isActive ? 600 : 400}
                              noWrap
                            >
                              {name}
                            </Typography>

                            {isActive && (
                              <Chip
                                size="small"
                                color="primary"
                                label="Aktywny"
                              />
                            )}

                            {isActive && dirty && (
                              <Chip
                                size="small"
                                color="warning"
                                variant="outlined"
                                label="Niezapisane"
                              />
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
        )}
      </Box>
    </Stack>
  );
};

export default PresetsList;