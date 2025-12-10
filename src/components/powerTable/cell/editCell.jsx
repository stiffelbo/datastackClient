import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextField, Select, MenuItem, TableCell, Box, Typography } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';

const EditCell = ({ value: initialValue, settings, onCommit, onCancel, onChange, column = {}, params = {} }) => {
  const [value, setValue] = useState(initialValue ?? "");
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const didFocusRef = useRef(false);

  const isVirtual = settings.isVirtualized && settings.rowHeight;

  const virtualizedClampSx = isVirtual
    ? {
        height: settings.rowHeight,
        maxHeight: settings.rowHeight,
        overflow: "hidden",
      }
    : {};

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  // focus tylko raz
  useEffect(() => {
    if (didFocusRef.current) return;
    didFocusRef.current = true;

    if (inputRef.current && typeof inputRef.current.focus === "function") {
      inputRef.current.focus();
      return;
    }
    if (containerRef.current) {
      const input = containerRef.current.querySelector("input, textarea, select");
      if (input && typeof input.focus === "function") {
        input.focus();
      }
    }
  }, []);

  // validation wrapper (returns true if valid)
  const validate = useCallback(
    (val) => {
      setError(null);
      if (typeof column?.validationFn === "function") {
        const res = column.validationFn(val, params);
        if (res === true || res === null || res === undefined) {
          setError(null);
          return true;
        }
        if (typeof res === "string") {
          setError(res);
          return false;
        }
        if (res === false) {
          setError("Nieprawidłowa wartość");
          return false;
        }
      }
      return true;
    },
    [column, params]
  );

  // local change (bez commita)
  const handleLocalChange = (next) => {
    setValue(next);
    const ok = validate(next);
    if (typeof onChange === "function") onChange(next, params, ok ? null : error);
    return ok;
  };

  // commit helper
  const handleCommit = async (maybeValue = undefined) => {
    const v = maybeValue === undefined ? value : maybeValue;
    const ok = validate(v);
    if (!ok) return false;
    try {
      if (typeof onCommit === "function") {
        await onCommit(v, params);
      }
      return true;
    } catch (err) {
      setError(err?.message ?? String(err));
      return false;
    }
  };

  const handleCancel = () => {
    if (typeof onCancel === "function") onCancel();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const inputType = (column?.input || column?.type || "text").toLowerCase();

  let inputElement = null;

  if (inputType === "number") {
    inputElement = (
      <TextField
        inputRef={inputRef}
        value={value}
        onChange={(e) => handleLocalChange(e.target.value)}
        onBlur={() => handleCommit()}
        onKeyDown={handleKeyDown}
        fullWidth
        size="small"
        variant="standard"
        type="number"
        error={!!error}
        helperText={error || ""}
        title={error || undefined}
      />
    );
  } else if (inputType === "date") {
    inputElement = (
      <TextField
        inputRef={inputRef}
        value={value ?? ""}
        onChange={(e) => handleLocalChange(e.target.value)}
        onBlur={() => handleCommit()}
        onKeyDown={handleKeyDown}
        fullWidth
        size="small"
        variant="standard"
        type="date"
        error={!!error}
        helperText={error || ""}
        title={error || undefined}
      />
    );
  } else if (inputType === "select") {
    const opts = Array.isArray(column?.options) ? column.options : [];

    const handleChangeSelect = async (e) => {
      const v = e.target.value;
      handleLocalChange(v);
      await handleCommit(v); // commit od razu przy zmianie
    };

    inputElement = (
      <Select
        inputRef={inputRef}
        value={value ?? ""}
        onChange={handleChangeSelect}
        size="small"
        variant="standard"
        fullWidth
        error={!!error}
        title={error || undefined}
      >
        {opts.map((opt, idx) => {
          const val = (opt && typeof opt === "object") ? opt.value : opt;
          const lab = (opt && typeof opt === "object") ? (opt.label ?? String(val)) : String(opt);
          return (
            <MenuItem key={`${String(val)}_${idx}`} value={val}>
              {lab}
            </MenuItem>
          );
        })}
      </Select>
    );
  } else if (inputType === "bool" || inputType === "boolean") {
    const normalizeIncoming = (v) => {
      if (v === null || v === undefined || v === "") return null;
      if (typeof v === "boolean") return v;
      if (v === "true" || v === "1" || v === 1) return true;
      if (v === "false" || v === "0" || v === 0) return false;
      return null;
    };

    const toSelectValue = (v) => (v === null ? "" : v === true ? "true" : "false");
    const normalized = normalizeIncoming(value);

    const handleChangeBool = async (e) => {
      let v = e.target.value;
      if (v === "") v = null;
      else if (v === "true") v = true;
      else if (v === "false") v = false;

      handleLocalChange(v);
      await handleCommit(v);
    };

    const itemStyle = { display: "flex", alignItems: "center", gap: 1 };

    inputElement = (
      <Select
        inputRef={inputRef}
        value={toSelectValue(normalized)}
        onChange={handleChangeBool}
        size="small"
        variant="standard"
        fullWidth
        error={!!error}
        title={error || undefined}
      >
        <MenuItem value="">
          <Box sx={itemStyle}>
            <RemoveIcon fontSize="small" sx={{ color: "text.disabled" }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              — Brak —
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem value="true">
          <Box sx={itemStyle}>
            <CheckIcon fontSize="small" sx={{ color: "success.main" }} />
            <Typography variant="body2">Tak</Typography>
          </Box>
        </MenuItem>
        <MenuItem value="false">
          <Box sx={itemStyle}>
            <CloseIcon fontSize="small" sx={{ color: "error.main" }} />
            <Typography variant="body2">Nie</Typography>
          </Box>
        </MenuItem>
      </Select>
    );
  } else {
    // text / textarea / default
    inputElement = (
      <TextField
        inputRef={inputRef}
        value={value}
        onChange={(e) => handleLocalChange(e.target.value)}
        onBlur={() => handleCommit()}
        onKeyDown={handleKeyDown}
        fullWidth
        size="small"
        variant="standard"
        error={!!error}
        helperText={error || ""}
        title={error || undefined}
        multiline={inputType === "textarea"}
        minRows={inputType === "textarea" ? 2 : 1}
      />
    );
  }

  return (
    <TableCell ref={containerRef} sx={{ padding: "6px 8px", ...virtualizedClampSx }}>
      {inputElement}
    </TableCell>
  );
};

export default EditCell;
