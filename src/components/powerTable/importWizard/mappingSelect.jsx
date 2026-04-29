// MappingSelect.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Autocomplete, TextField } from "@mui/material";

import {
  CONSTANT_PREFIX,
  isConstantMapping,
  encodeConstantMapping,
  decodeConstantMapping,
  NONE_MAPPING,
  EMPTY_MAPPING
} from "./utils";

/**
 * MappingSelect - kontrolowany input/select używany do mapowania pól.
 * Pozwala wybrać nagłówek z pliku albo wpisać stałą wartość,
 * która zostanie rozlana na całą kolumnę.
 */
const MappingSelect = ({
  value,
  headers = [],
  onChange = () => {},
  includeNone = true,
  includeEmpty = true,
  minWidth = 120,
  size = "small",
  sx = {},
}) => {
  const options = useMemo(() => {
    const base = [];

    if (includeEmpty) {
      base.push({ value: EMPTY_MAPPING, label: "-- brak --", type: "system" });
    }

    if (includeNone) {
      base.push({ value: NONE_MAPPING, label: "Pusta wartość", type: "system" });
    }

    headers.forEach((header) => {
      base.push({ value: header, label: header, type: "header" });
    });

    return base;
  }, [headers, includeEmpty, includeNone]);

  const selectedValue = value ?? "";

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const autocompleteValue =
    selectedOption ??
    (isConstantMapping(selectedValue)
      ? decodeConstantMapping(selectedValue)
      : selectedValue);

  const commitValue = (nextValue) => {
    if (nextValue === null) {
      onChange("");
      return;
    }

    if (typeof nextValue === "string") {
      const trimmed = nextValue.trim();

      if (!trimmed) {
        onChange("");
        return;
      }

      const matchingOption = options.find(
        (option) => option.label === trimmed || option.value === trimmed
      );

      onChange(
        matchingOption
          ? matchingOption.value
          : encodeConstantMapping(trimmed)
      );

      return;
    }

    onChange(nextValue.value ?? "");
  };

  return (
    <Autocomplete
      freeSolo
      autoSelect
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      size={size}
      value={autocompleteValue}
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option;
        return option?.label ?? "";
      }}
      isOptionEqualToValue={(option, selected) => {
        const selectedRaw =
          typeof selected === "string" ? selected : selected?.value;

        return option.value === selectedRaw;
      }}
      onChange={(_, nextValue) => commitValue(nextValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Wybierz lub wpisz"
          variant="outlined"
          sx={{
            "& .MuiInputBase-root": {
              mt: 0.5,
              minWidth,
              fontSize: "0.72rem",
              py: 0,
            },
            "& .MuiInputBase-input": {
              py: "6px !important",
              px: "6px !important",
              fontSize: "0.72rem",
            },
          }}
        />
      )}
      slotProps={{
        paper: { sx: { maxHeight: 320 } },
      }}
      sx={{
        minWidth,
        ...sx,
      }}
    />
  );
};

MappingSelect.propTypes = {
  value: PropTypes.string,
  headers: PropTypes.array,
  onChange: PropTypes.func,
  includeNone: PropTypes.bool,
  includeEmpty: PropTypes.bool,
  minWidth: PropTypes.number,
  size: PropTypes.oneOf(["small", "medium"]),
  sx: PropTypes.object,
};

export default MappingSelect;