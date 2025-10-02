import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";

const defaultSanitize = (v) => v;

const FieldForm = ({
  type = "text",
  value: initialValue = "",
  onCommit,
  onClear,
  validate = () => true,
  sanitize = defaultSanitize,
  restricted = [],
  options = [],
  textFieldProps = {},
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const validateValue = (val) => {
    if (restricted.includes(val)) {
      setError("Wartość jest już zajęta");
      return false;
    }
    if (!validate(val)) {
      setError("Nieprawidłowa wartość");
      return false;
    }
    setError("");
    return true;
  };

  const handleChange = (e) => {
    const rawVal = e.target.value;
    const sanitized = sanitize(rawVal);
    setValue(sanitized);
    validateValue(sanitized);
  };

  const handleCommit = () => {
    if (!validateValue(value)) return;
    if (onCommit) onCommit(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCommit();
    if (e.key === "Escape") setValue(initialValue); // opcjonalne
  };

  const handleClear = () => {
    setValue('');
    onCommit('');
  }

  const sharedProps = {
    value,
    onChange: handleChange,
    onBlur: handleCommit,
    onKeyDown: handleKeyDown,
    error: !!error,
    helperText: error || " ",
    size: "small",
    fullWidth: true,
    ...textFieldProps,
    InputProps: {
      ...textFieldProps.InputProps,
      endAdornment:
        !error && value !== "" ? (
          <InputAdornment position="end">
            {/* clear */}
            {onClear && (
              <Tooltip title="Wyczyść">
                <IconButton
                  onClick={handleClear}
                  size="small"
                  color="error"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* save */}
            <Tooltip title="Zapisz">
              <IconButton onClick={handleCommit} size="small" color="primary">
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ) : null,
    },

  };

  if (type === "select") {
    return (
      <TextField select {...sharedProps}>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return <TextField type={type} {...sharedProps} />;
};

export default FieldForm;
