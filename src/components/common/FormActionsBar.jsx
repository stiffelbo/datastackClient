// src/components/common/FormActionsBar.jsx
import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";

const FormActionsBar = ({
  onSubmit = null,
  onCancel = null,
  submitText = "Zapisz",
  cancelText = "Anuluj",
  disabled = false,
  loading = false,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        mt: 2,
        ...sx,
      }}
    >
      {onCancel ? (
        <Button
          variant="outlined"
          color="default"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>
      ) : null}

      {onSubmit ? (
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={disabled || loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {submitText}
        </Button>
      ) : null}
    </Box>
  );
};

export default FormActionsBar;