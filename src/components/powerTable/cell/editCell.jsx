import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { normalizeCellOptions } from "./utils";

import {
  getCellSx,
  getCellInnerSx,
  getVirtualInputSx,
} from "./cellLayout";

import {
  TextField,
  Select,
  MenuItem,
  TableCell,
  Box,
  Typography,
  ListSubheader,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */


function toDatetimeLocalValue(value) {
  if (!value) return "";

  /*
   * backend:
   * "2026-05-29 12:00:00"
   *
   * input:
   * "2026-05-29T12:00"
   */
  if (typeof value === "string") {
    return value
      .replace(" ", "T")
      .slice(0, 16);
  }

  return "";
}


function renderGroupedMenuItems(options = []) {
  const groupedOptions =
    normalizeCellOptions(options).reduce(
      (acc, opt) => {
        const groupName =
          opt.group || "";

        if (!acc[groupName]) {
          acc[groupName] = [];
        }

        acc[groupName].push(opt);

        return acc;
      },
      {}
    );

  return Object.entries(groupedOptions)
    .flatMap(([groupName, groupItems]) => {
      const items = [];

      if (groupName) {
        items.push(
          <ListSubheader
            key={`group-${groupName}`}
            disableSticky
          >
            {groupName}
          </ListSubheader>
        );
      }

      groupItems.forEach((opt, idx) => {
        items.push(
          <MenuItem
            key={`opt-${String(opt.value)}_${idx}`}
            value={opt.value}
            disabled={opt.disabled}
            title={opt.title || ""}
          >
            {opt.label}
          </MenuItem>
        );
      });

      return items;
    });
}


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const EditCell = ({
  value: initialValue,
  settings = {},
  onCommit,
  onCancel,
  onChange,
  column = {},
  params = {},
}) => {
  const [value, setValue] =
    useState(initialValue ?? "");

  const [error, setError] =
    useState(null);

  const containerRef =
    useRef(null);

  const inputRef =
    useRef(null);

  const didFocusRef =
    useRef(false);


  /*
   * =======================================================
   * SETTINGS
   * =======================================================
   */

  const {
    sx = {},
    rowHeight: configuredRowHeight,
  } = settings;


  const isVirtual =
    !!settings.isVirtualized &&
    Number(configuredRowHeight) > 0;

  const baseCellSx = getCellSx({
    column,
    settings,
    sx: settings.sx,
  });

  const baseInnerSx = getCellInnerSx({
    settings,
    mode: "edit",
  });

  const virtualInputSx =
    getVirtualInputSx(settings);

  /*
   * =======================================================
   * VALUE SYNC
   * =======================================================
   */

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);


  /*
   * =======================================================
   * FOCUS
   * =======================================================
   */

  useEffect(() => {
    if (didFocusRef.current) {
      return;
    }

    didFocusRef.current = true;

    if (
      inputRef.current &&
      typeof inputRef.current.focus === "function"
    ) {
      inputRef.current.focus();
      return;
    }

    if (containerRef.current) {
      const input =
        containerRef.current.querySelector(
          "input, textarea, select"
        );

      if (
        input &&
        typeof input.focus === "function"
      ) {
        input.focus();
      }
    }
  }, []);


  /*
   * =======================================================
   * INPUT TYPE
   * =======================================================
   */

  const inputType =
    (
      column?.input ||
      column?.type ||
      "text"
    ).toLowerCase();


  /*
   * =======================================================
   * VALIDATION
   * =======================================================
   */

  const validate = useCallback(
    (val) => {
      setError(null);

      if (
        typeof column?.validationFn ===
        "function"
      ) {
        const res =
          column.validationFn(
            val,
            params
          );

        if (
          res === true ||
          res === null ||
          res === undefined
        ) {
          setError(null);
          return true;
        }

        if (
          typeof res === "string"
        ) {
          setError(res);
          return false;
        }

        if (res === false) {
          setError(
            "Nieprawidłowa wartość"
          );

          return false;
        }
      }

      return true;
    },
    [
      column,
      params,
    ]
  );


  /*
   * =======================================================
   * LOCAL CHANGE
   * =======================================================
   */

  const handleLocalChange = (next) => {
    setValue(next);

    const ok =
      validate(next);

    if (
      typeof onChange === "function"
    ) {
      onChange(
        next,
        params,
        ok ? null : error
      );
    }

    return ok;
  };


  /*
   * =======================================================
   * BACKEND VALUE
   * =======================================================
   */

  const toBackendValue = (v) => {
    if (
      inputType === "datetime"
    ) {
      if (!v) {
        return null;
      }

      if (
        typeof v === "string" &&
        v.includes("T")
      ) {
        return (
          v.replace("T", " ") +
          (
            v.length === 16
              ? ":00"
              : ""
          )
        );
      }
    }

    return v;
  };


  /*
   * =======================================================
   * COMMIT
   * =======================================================
   */

  const handleCommit = async (
    maybeValue = undefined
  ) => {
    const rawValue =
      maybeValue === undefined
        ? value
        : maybeValue;

    const backendValue =
      toBackendValue(rawValue);

    const ok =
      validate(backendValue);

    if (!ok) {
      return false;
    }

    try {
      if (
        typeof onCommit === "function"
      ) {
        await onCommit(
          backendValue,
          params
        );
      }

      return true;
    } catch (err) {
      setError(
        err?.message ??
        String(err)
      );

      return false;
    }
  };


  /*
   * =======================================================
   * CANCEL
   * =======================================================
   */

  const handleCancel = () => {
    if (
      typeof onCancel === "function"
    ) {
      onCancel();
    }
  };


  /*
   * =======================================================
   * KEYBOARD
   * =======================================================
   */

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      handleCommit();
    }

    else if (
      e.key === "Escape"
    ) {
      handleCancel();
    }
  };


  /*
   * =======================================================
   * INPUT
   * =======================================================
   */

  let inputElement = null;


  /*
   * NUMBER
   */
  if (inputType === "number") {
    inputElement = (
      <TextField
        inputRef={inputRef}

        value={value}

        onChange={(e) =>
          handleLocalChange(
            e.target.value
          )
        }

        onBlur={() =>
          handleCommit()
        }

        onKeyDown={
          handleKeyDown
        }

        fullWidth
        size="small"
        variant="standard"
        type="number"

        error={!!error}

        helperText={
          isVirtual
            ? undefined
            : error || ""
        }

        title={
          error || undefined
        }

        sx={virtualInputSx}
      />
    );
  }


  /*
   * DATE
   */
  else if (
    inputType === "date"
  ) {
    inputElement = (
      <TextField
        inputRef={inputRef}

        value={value ?? ""}

        onChange={(e) =>
          handleLocalChange(
            e.target.value
          )
        }

        onBlur={() =>
          handleCommit()
        }

        onKeyDown={
          handleKeyDown
        }

        fullWidth
        size="small"
        variant="standard"
        type="date"

        error={!!error}

        helperText={
          isVirtual
            ? undefined
            : error || ""
        }

        title={
          error || undefined
        }

        sx={virtualInputSx}
      />
    );
  }


  /*
   * DATETIME
   */
  else if (
    inputType === "datetime"
  ) {
    inputElement = (
      <TextField
        inputRef={inputRef}

        value={
          toDatetimeLocalValue(
            value
          )
        }

        onChange={(e) =>
          handleLocalChange(
            e.target.value
          )
        }

        onBlur={() =>
          handleCommit()
        }

        onKeyDown={
          handleKeyDown
        }

        fullWidth
        size="small"
        variant="standard"

        type="datetime-local"

        error={!!error}

        helperText={
          isVirtual
            ? undefined
            : error || ""
        }

        title={
          error || undefined
        }

        sx={virtualInputSx}
      />
    );
  }


  /*
   * SELECT
   */
  else if (
    inputType === "select" ||
    inputType === "select-object"
  ) {
    const opts =
      Array.isArray(column?.options)
        ? column.options
        : Array.isArray(
            column?.selectOptions
          )
          ? column.selectOptions
          : [];


    const handleChangeSelect =
      async (e) => {
        const nextValue =
          e.target.value;

        handleLocalChange(
          nextValue
        );

        await handleCommit(
          nextValue
        );
      };


    inputElement = (
      <Select
        inputRef={inputRef}

        value={value ?? ""}

        onChange={
          handleChangeSelect
        }

        size="small"
        variant="standard"

        fullWidth

        error={!!error}

        title={
          error || undefined
        }

        displayEmpty

        sx={virtualInputSx}
      >
        <MenuItem value="">
          {`-- ${
            column?.label ||
            column?.headerName ||
            "Wybierz"
          } --`}
        </MenuItem>

        {renderGroupedMenuItems(
          opts
        )}
      </Select>
    );
  }


  /*
   * BOOLEAN
   */
  else if (
    inputType === "bool" ||
    inputType === "boolean"
  ) {
    const normalizeIncoming =
      (v) => {
        if (
          v === null ||
          v === undefined ||
          v === ""
        ) {
          return null;
        }

        if (
          typeof v === "boolean"
        ) {
          return v;
        }

        if (
          v === "true" ||
          v === "1" ||
          v === 1
        ) {
          return true;
        }

        if (
          v === "false" ||
          v === "0" ||
          v === 0
        ) {
          return false;
        }

        return null;
      };


    const toSelectValue =
      (v) => (
        v === null
          ? ""
          : v === true
            ? "true"
            : "false"
      );


    const normalized =
      normalizeIncoming(value);


    const handleChangeBool =
      async (e) => {
        let nextValue =
          e.target.value;

        if (
          nextValue === ""
        ) {
          nextValue = null;
        }

        else if (
          nextValue === "true"
        ) {
          nextValue = true;
        }

        else if (
          nextValue === "false"
        ) {
          nextValue = false;
        }

        handleLocalChange(
          nextValue
        );

        await handleCommit(
          nextValue
        );
      };


    const itemStyle = {
      display: "flex",
      alignItems: "center",
      gap: 1,
    };


    inputElement = (
      <Select
        inputRef={inputRef}

        value={
          toSelectValue(
            normalized
          )
        }

        onChange={
          handleChangeBool
        }

        size="small"
        variant="standard"

        fullWidth

        error={!!error}

        title={
          error || undefined
        }

        sx={virtualInputSx}
      >
        <MenuItem value="">
          <Box sx={itemStyle}>
            <RemoveIcon
              fontSize="small"
              sx={{
                color:
                  "text.disabled",
              }}
            />

            <Typography
              variant="body2"
              sx={{
                color:
                  "text.secondary",
              }}
            >
              — Brak —
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem value="true">
          <Box sx={itemStyle}>
            <CheckIcon
              fontSize="small"
              sx={{
                color:
                  "success.main",
              }}
            />

            <Typography variant="body2">
              Tak
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem value="false">
          <Box sx={itemStyle}>
            <CloseIcon
              fontSize="small"
              sx={{
                color:
                  "error.main",
              }}
            />

            <Typography variant="body2">
              Nie
            </Typography>
          </Box>
        </MenuItem>
      </Select>
    );
  }


  /*
   * TEXT / TEXTAREA / DEFAULT
   */
  else {
    const useMultiline =
      inputType === "textarea" &&
      !isVirtual;

    inputElement = (
      <TextField
        inputRef={inputRef}

        value={value}

        onChange={(e) =>
          handleLocalChange(
            e.target.value
          )
        }

        onBlur={() =>
          handleCommit()
        }

        onKeyDown={
          handleKeyDown
        }

        fullWidth
        size="small"
        variant="standard"

        error={!!error}

        helperText={
          isVirtual
            ? undefined
            : error || ""
        }

        title={
          error || undefined
        }

        /*
         * Virtual row ma fixed height.
         *
         * Multiline nie może wtedy zwiększać
         * wysokości wiersza.
         */
        multiline={useMultiline}

        minRows={
          useMultiline
            ? 2
            : undefined
        }

        sx={virtualInputSx}
      />
    );
  }


  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <TableCell
      ref={containerRef}
      sx={baseCellSx}
    >
      <Box
        sx={baseInnerSx}
      >
        {inputElement}
      </Box>
    </TableCell>
  );
};

export default EditCell;