import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextField, Checkbox, Select, MenuItem, TableCell } from "@mui/material";

const EditCell = ({
  type = "text",
  value: initialValue,
  onCommit,
  onCancel,
  onChange,
  column,
  params,
}) => {
  const [value, setValue] = useState(initialValue ?? "");
  const [error, setError] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const input = ref.current.querySelector("input, select, textarea");
      if (input) input.focus();
    }
  }, []);

  /** Walidacja */
  const validate = useCallback(
    (val) => {
      if (typeof column?.validationFn === "function") {
        const result = column.validationFn(val, params); // 👈 przekazujemy cały params

        if (result === true || result === null) {
          setError(null);
          return true;
        }

        if (typeof result === "string") {
          setError(result);
          return false;
        }

        if (result === false) {
          setError("Nieprawidłowa wartość");
          return false;
        }
      }
      setError(null);
      return true;
    },
    [column, params]
  );

  const handleChange = (e) => {
    const val = e?.target?.value ?? e;
    setValue(val);

    const valid = validate(val);

    if (typeof onChange === "function") {
      onChange(val, params, valid ? null : error);
    }
  };

  const handleCommit = () => {
    const valid = validate(value);
    if (!valid) return;
    onCommit?.(value, params);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCommit();
    if (e.key === "Escape") onCancel?.();
  };

  const baseProps = {
    ref,
    value,
    onChange: handleChange,
    onBlur: handleCommit,
    onKeyDown: handleKeyDown,
    autoFocus: true,
    fullWidth: true,
    size: "small",
    variant: "standard",
    error: !!error,
    helperText: error || "",
    sx: error
      ? { "& .MuiInputBase-root": { borderColor: "error.main" } }
      : undefined,
    title: error || undefined,
  };

  const map = {
    text: <EditCell.InputText {...baseProps} />,
    number: <EditCell.InputNumber {...baseProps} />,
    checkbox: (
      <EditCell.InputCheckbox
        value={value}
        onChange={handleChange}
        onCommit={handleCommit}
        error={error}
      />
    ),
    select: (
      <EditCell.InputSelect
        {...baseProps}
        column={column}
        onChange={handleChange}
        onCommit={handleCommit}
        error={error}
      />
    ),
    date: <EditCell.InputDate {...baseProps} />,
  };

  if(map[type]) return <TableCell>{map[type]}</TableCell>
  else {
    return <TableCell>{map.text}</TableCell>
  }
}

/* --- subkomponenty --- */
EditCell.InputText = (props) => <TextField type="text" {...props} />;
EditCell.InputNumber = (props) => <TextField type="number" {...props} />;
EditCell.InputCheckbox = ({ value, onChange, error }) => (
  <Checkbox
    checked={!!value}
    onChange={(e) => onChange(e.target.checked)}
    sx={{
      p: 0,
      ...(error && {
        outline: "1px solid",
        outlineColor: "error.main",
        borderRadius: "4px",
      }),
    }}
    title={error || undefined}
  />
);
EditCell.InputSelect = ({ value, onChange, column, error }) => (
  <Select
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    size="small"
    variant="standard"
    fullWidth
    error={!!error}
    title={error || undefined}
    sx={error ? { borderColor: "error.main" } : undefined}
  >
    {(column?.options || []).map((opt) => (
      <MenuItem key={opt.value ?? opt} value={opt.value ?? opt}>
        {opt.label ?? opt}
      </MenuItem>
    ))}
  </Select>
);
EditCell.InputDate = (props) => <TextField type="date" {...props} />;

export default EditCell;
