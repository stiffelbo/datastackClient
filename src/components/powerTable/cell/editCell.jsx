import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextField, Select, MenuItem, TableCell, Box, Typography } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';

/**
 * EditCell
 *
 * Props:
 * - value: initial value
 * - onCommit(value, params): commit handler (calls commitEdit in hook)
 * - onCancel(): cancel editing
 * - onChange(value, params, validationError) optional: for live validation feedback
 * - column: column schema (may contain .input, .options, .validationFn, .commitOnSelect)
 * - params: cell params from table (must contain id, field)
 */
const EditCell = ({ value: initialValue, onCommit, onCancel, onChange, column = {}, params = {} }) => {
  const [value, setValue] = useState(initialValue ?? "");
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  // focus first input when mounting
  useEffect(() => {
    if (inputRef.current) {
      if (typeof inputRef.current.focus === 'function') {
        inputRef.current.focus();
        if (inputRef.current.select) inputRef.current.select();
      }
    } else if (containerRef.current) {
      const input = containerRef.current.querySelector("input, textarea, select");
      if (input) {
        input.focus();
        if (input.select) input.select();
      }
    }
  }, []);

  // validation wrapper (returns true if valid)
  const validate = useCallback((val) => {
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
  }, [column, params]);

  // local change handler used for all inputs (doesn't commit)
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
      // jeśli backend odrzucił, ustaw error (możesz przekazać err do powerTable state)
      setError(err?.message ?? String(err));
      return false;
    }
  };

  // cancel helper
  const handleCancel = () => {
    if (typeof onCancel === "function") onCancel();
  };

  // Key handling for text/number/date
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // prevent default submit maybe
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // ---------------- subcomponents ----------------

  // TEXT
  const InputText = () => (
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
      autoFocus
    />
  );

  // NUMBER
  const InputNumber = () => (
    <TextField
      inputRef={inputRef}
      value={value}
      onChange={(e) => {
        // allow empty and numbers
        const v = e.target.value;
        // optional: filter to numeric characters if needed
        handleLocalChange(v);
      }}
      onBlur={() => handleCommit()}
      onKeyDown={handleKeyDown}
      fullWidth
      size="small"
      variant="standard"
      type="number"
      error={!!error}
      helperText={error || ""}
      title={error || undefined}
      autoFocus
    />
  );

  // DATE (ISO YYYY-MM-DD)
  const InputDate = () => (
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
      autoFocus
    />
  );

  // SELECT (commits immediately onChange to avoid Select portal blur race)
  const InputSelect = () => {
    const opts = Array.isArray(column?.options) ? column.options : [];

    const handleChange = async (e) => {
      const v = e.target.value;
      // local update + notify
      handleLocalChange(v);
      // commit immediately (avoid blur race)
      await handleCommit(v);
    };

    return (
      <Select
        inputRef={inputRef}
        value={value ?? ""}
        onChange={handleChange}
        size="small"
        variant="standard"
        fullWidth
        error={!!error}
        title={error || undefined}
        // do not rely on onBlur for commit here
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
  };

  // SELECT BOOL (specialized)
  const InputSelectBool = () => {
    // normalization helpers
    const normalizeIncoming = (v) => {
      if (v === null || v === undefined || v === '') return null;
      if (typeof v === 'boolean') return v;
      if (v === 'true' || v === '1' || v === 1) return true;
      if (v === 'false' || v === '0' || v === 0) return false;
      return null;
    };
    const toSelectValue = (v) => (v === null ? "" : v === true ? "true" : "false");

    const normalized = normalizeIncoming(value);

    const handleChange = async (e) => {
      let v = e.target.value;
      if (v === "") v = null;
      else if (v === "true") v = true;
      else if (v === "false") v = false;

      handleLocalChange(v);
      await handleCommit(v);
    };

    const itemStyle = { display: 'flex', alignItems: 'center', gap: 1 };

    return (
      <Select
        inputRef={inputRef}
        value={toSelectValue(normalized)}
        onChange={handleChange}
        size="small"
        variant="standard"
        fullWidth
        error={!!error}
        title={error || undefined}
      >
        <MenuItem value="">
          <Box sx={itemStyle}>
            <RemoveIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>— Brak —</Typography>
          </Box>
        </MenuItem>
        <MenuItem value="true">
          <Box sx={itemStyle}>
            <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
            <Typography variant="body2">Tak</Typography>
          </Box>
        </MenuItem>
        <MenuItem value="false">
          <Box sx={itemStyle}>
            <CloseIcon fontSize="small" sx={{ color: 'error.main' }} />
            <Typography variant="body2">Nie</Typography>
          </Box>
        </MenuItem>
      </Select>
    );
  };

  // fallback render
  const inputType = (column?.input || column?.type || "text").toLowerCase();

  const map = {
    text: <InputText />,
    textarea: <InputText />, // you can replace with multiline if desired
    number: <InputNumber />,
    date: <InputDate />,
    select: <InputSelect />,
    bool: <InputSelectBool />,
    boolean: <InputSelectBool />,
  };

  const rendered = map[inputType] ?? map.text;

  return (
    <TableCell ref={containerRef} sx={{ padding: '6px 8px' }}>
      {rendered}
    </TableCell>
  );
};

export default EditCell;
