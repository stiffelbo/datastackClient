import React, { useState } from "react";
import {
  List, ListItem, ListItemButton, ListItemText,
  Stack, IconButton, TextField, Chip, Tooltip, Typography
} from "@mui/material";
import { Edit, Delete, Check, Close } from "@mui/icons-material";

const PresetsList = ({ presets }) => {
  const {
    list = [],
    activeName,
    setActive,
    rename,
    remove,
    dirty,
  } = presets || {};

  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const startRename = (name) => {
    setRenaming(name);
    setRenameValue(name);
  };

  const confirmRename = () => {
    const oldName = renaming;
    const newName = renameValue.trim();
    if (!newName || oldName === newName) {
      setRenaming(null);
      return;
    }
    rename(oldName, newName);
    setRenaming(null);
  };

  const cancelRename = () => {
    setRenaming(null);
    setRenameValue("");
  };

  if (!list.length) {
    return (
      <Typography variant="body2" sx={{ opacity: 0.6, px: 2, py: 1 }}>
        Brak presetów.
      </Typography>
    );
  }

  return (
    <List dense sx={{ overflow: "auto", maxHeight: "60vh" }}>
      {list.map((name) => {
        const isActive = name === activeName;
        const isRenaming = renaming === name;

        return (
          <ListItem
            key={name}
            disableGutters
            sx={{
              borderRadius: 1,
              mb: 0.5,
              "&:hover": { bgcolor: "action.hover" },
            }}
            secondaryAction={
              isRenaming ? (
                <Stack direction="row" gap={0.5}>
                  <IconButton size="small" color="success" onClick={confirmRename}>
                    <Check fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={cancelRename}>
                    <Close fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <Stack direction="row" gap={0.5}>
                  <Tooltip title="Zmień nazwę">
                    <IconButton size="small" onClick={() => startRename(name)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Usuń preset">
                    <IconButton size="small" onClick={() => remove(name)}>
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
                onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                autoFocus
                sx={{ flex: 1, mr: 1 }}
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
                      <Typography
                        variant="body2"
                        fontWeight={isActive ? 600 : 400}
                      >
                        {name}
                      </Typography>
                      {isActive && <Chip size="small" color="primary" label="Aktywny" />}
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
  );
};

export default PresetsList;
