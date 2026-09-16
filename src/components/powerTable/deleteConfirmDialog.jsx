import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

const DeleteConfirmDialog = ({
  open,
  onCancel,
  onConfirm,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        Usunąć wiersz?
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Czy na pewno chcesz usunąć ten wiersz?
          Tej operacji nie można cofnąć.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onCancel}
          disabled={loading}
        >
          Anuluj
        </Button>

        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          startIcon={<DeleteIcon />}
          disabled={loading}
        >
          Usuń
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;