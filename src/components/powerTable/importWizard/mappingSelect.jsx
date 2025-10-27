// MappingSelect.jsx
import React from "react";
import PropTypes from "prop-types";
import { Select, MenuItem } from "@mui/material";

/**
 * MappingSelect - mały, kontrolowany select używany do mapowania pól
 *
 * Props:
 *  - value: string        // obecna wartość (header | "" | "__none__")
 *  - headers: string[]    // lista nagłówków z arkusza
 *  - onChange: fn(value)  // wywoływane z nową wartością
 *  - includeNone: bool    // czy dodać opcję "__none__" (explicit empty)
 *  - includeEmpty: bool   // czy dodać opcję pustą ("")
 *  - minWidth: number     // minimalna szerokość selecta
 *  - size: "small"|"medium"
 *  - sx: object           // dodatkowy sx
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
  return (
    <Select
      size={size}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      displayEmpty
      sx={{
        mt: 0.5,
        fontSize: "0.72rem",
        minWidth,
        ".MuiSelect-select": { py: "6px", px: "6px", fontSize: "0.72rem" },
        ...sx,
      }}
      MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
    >
      {includeEmpty && <MenuItem value="">-- brak --</MenuItem>}
      {includeNone && <MenuItem value="__none__">Pusta wartość</MenuItem>}
      {headers.map((h) => (
        <MenuItem key={h} value={h} sx={{ fontSize: "0.72rem" }}>
          {h}
        </MenuItem>
      ))}
    </Select>
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
