// TopBarLists.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

/**
 * TopBarLists - w pełni kontrolowany zestaw dropdownów do umieszczenia w TopBar
 *
 * Props:
 *  - lists: Array<{ field, label, options: [{value,label}], default?, required?, disabled?, mapsTo?, tip? }>
 *  - values: { [field]: value }  // required for controlled mode (but will fallback to '' if missing)
 *  - onChange: function({ field, value })
 *  - itemWidth: number|string (px or css) default 140
 *  - size: "small" | "medium"
 */
const TopBarLists = ({ lists = [], values = {}, onChange = () => {}, itemWidth = 160, size = "small" }) => {
  const handleChange = (field, value) => {
    try {
      onChange({ field, value });
    } catch (e) {
      // don't break UI if handler throws
      // eslint-disable-next-line no-console
      console.error("TopBarLists onChange threw:", e);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        overflowX: "auto",
        py: 0.25,
        // compact heights for topbar
        "& .MuiFormControl-root": { minHeight: 36 },
      }}
    >
      {(lists || []).map((l) => {
        const field = l.field;
        const label = l.label ?? field;
        const opts = Array.isArray(l.options) ? l.options : [];
        const value = values?.[field] ?? "";
        const disabled = !!l.disabled;
        const required = true;
        const tip = l.tip ?? (required ? "Wartość wymagana przed uploadem" : (l.description ?? ""));

        return (
          <Box key={field} sx={{ display: "flex", alignItems: "flexStart", gap: 0.5 }}>
            <FormControl size={size} sx={{ minWidth: itemWidth, maxWidth: itemWidth }}>
              <InputLabel sx={{ fontSize: "0.72rem", pl: 0.25 }}>{label}</InputLabel>

              <Tooltip title={tip || (disabled ? "Wyłączone" : "")}>
                <span>
                  {/* span needed so Tooltip works with disabled elements */}
                  <Select
                    size={size}
                    value={typeof value === "undefined" || value === null ? "" : value}
                    label={label}
                    onChange={(e) => handleChange(field, e.target.value)}
                    required={required}
                    disabled={disabled}
                    sx={{
                        width: '100%',
                        fontSize: "0.78rem",
                        "& .MuiSelect-select": { py: 0.4, px: 0.6 },

                    }}
                  >
                    <MenuItem value="">
                      <em>—</em>
                    </MenuItem>

                    {opts.length === 0 ? (
                      <MenuItem value="" disabled>
                        <em>Brak opcji</em>
                      </MenuItem>
                    ) : (
                      opts.map((o) => (
                        <MenuItem key={String(o.value)} value={o.value} sx={{ fontSize: "0.78rem" }}>
                          {o.label ?? String(o.value)}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </span>
              </Tooltip>
            </FormControl>

            {l.tip ? (
              <Tooltip title={l.tip}>
                <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </Tooltip>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
};

TopBarLists.propTypes = {
  lists: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.object),
      default: PropTypes.any,
      required: PropTypes.bool,
      disabled: PropTypes.bool,
      mapsTo: PropTypes.string,
      tip: PropTypes.string,
      description: PropTypes.string,
    })
  ),
  values: PropTypes.object,
  onChange: PropTypes.func,
  itemWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.oneOf(["small", "medium"]),
};

export default TopBarLists;
