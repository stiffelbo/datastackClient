import React from "react";

import { Stack, Button, Input, IconButton, Chip, Tooltip } from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import UndoIcon from '@mui/icons-material/Undo';

const DirtyToolbar = ({
  dirty,
  stagedDirty,
  onSave,
  onDiscard,
  onRefresh,
  onClose,
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: dirty ? 'warning.light' : 'transparent',
        transition: 'background-color 180ms ease',
      }}
    >
      {dirty ? (
        <Chip
          size="small"
          color="warning"
          icon={<WarningAmberIcon />}
          label="Niezapisane"
        />
      ) : (
        <Chip size="small" label="Zapisane" />
      )}

      <Tooltip title="Zapisz aktywny preset">
        <span>
          <IconButton
            size="small"
            color="primary"
            onClick={onSave}
            disabled={!dirty}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Odrzuć staged changes">
        <span>
          <IconButton
            size="small"
            onClick={onDiscard}
            disabled={!stagedDirty}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Odśwież defaultowy preset">
        <IconButton
          size="small"
          color="warning"
          onClick={onRefresh}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Zamknij">
        <IconButton
          size="small"
          color="error"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default DirtyToolbar;