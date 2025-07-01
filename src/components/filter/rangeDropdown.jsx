import {
  Box,
  Button,
  TextField,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import StraightenIcon from "@mui/icons-material/Straighten";

import React, { useState } from "react";

const RangeDropdown = ({ value = {}, onChange, label = "Zakres", width = 150, type = 'number' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [temp, setTemp] = useState({ min: value.min || "", max: value.max || "" });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setTemp({ min: value.min || "", max: value.max || "" }); // Sync on open
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onChange({ min: temp.min || null, max: temp.max || null });
    handleClose();
  };

  const handleClear = () => {
    setTemp({ min: "", max: "" });
    onChange({ min: null, max: null });
    handleClose();
  };

  const labelText = () => {
    if (!value?.min && !value?.max) return label;
    return `${value.min || "–"} do ${value.max || "–"}`;
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<StraightenIcon fontSize="small" />}
        sx={{
          width,
          height: 40,
          textWrap: 'nowrap',
          justifyContent: 'start',
          px: 2,
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.87)',
          borderRadius: '4px',
          backgroundColor: 'white',
          color: 'rgba(0, 0, 0, 0.87)',
          fontSize: '0.875rem',
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
          '&:hover': {
            borderColor: '#1976d2',
          },
          ...(value?.min || value?.max
            ? {
              borderColor: '#ed6c02',
              color: '#ed6c02',
            }
            : {}),
        }}
        title={labelText()}
      >
        {label}
      </Button>


      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MenuItem disableRipple>
          <Box display="flex" flexDirection="column" gap={1} minWidth={250} p={1}>
            <Typography fontWeight="bold" fontSize="0.9rem">{label}</Typography>

            {/* Min Field */}
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                label="Min"
                size="small"
                type={type}
                disabled={temp.min === 'noval'}
                value={temp.min === 'noval' ? '' : temp.min}
                onChange={(e) => setTemp((prev) => ({ ...prev, min: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Max Field */}
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                label="Max"
                size="small"
                type={type}
                disabled={temp.max === 'noval'}
                value={temp.max === 'noval' ? '' : temp.max}
                onChange={(e) => setTemp((prev) => ({ ...prev, max: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>
            <Box display="flex" gap={1} alignItems="center">
              <Button
                  size="small"
                  fullWidth
                  color="info"
                  variant={temp.max === 'noval' ? 'contained' : 'outlined'}
                  onClick={() =>
                    setTemp((prev) => ({
                      min: prev.min === 'noval' ? null : 'noval',
                      max: prev.max === 'noval' ? null : 'noval',
                    }))
                  }
              >
                  Brak
              </Button>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Button size="small" onClick={handleClear} color="error">
                Wyczyść
              </Button>
              <Button size="small" variant="contained" onClick={handleApply}>
                Zastosuj
              </Button>
            </Box>
          </Box>
        </MenuItem>

      </Menu>
    </>
  );
};

export default RangeDropdown;
