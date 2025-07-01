import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  TextField,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SendIcon from "@mui/icons-material/Send";

const SlugInput = ({ value, onSubmit, label = "Search", width = 300 }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const prevValueRef = useRef(value || "");

  useEffect(() => {
    setInputValue(value || "");
    prevValueRef.current = value || "";
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (!newValue) onSubmit("");
  };

  const handleSubmit = () => {
    const cleaned = inputValue.trim().replace(/\s+/g, ';'); // normalize spaces to ;
    if (prevValueRef.current !== cleaned) {
      prevValueRef.current = cleaned;
      onSubmit(cleaned);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onSubmit("");
  };

  return (
    <Box sx={{ width: width }}>
      <TextField
        label={label}
        size="small"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        fullWidth
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {inputValue && (
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon />
                </IconButton>
              )}
              {prevValueRef.current !== inputValue.trim().replace(/\s+/g, ';') && inputValue.trim() !== "" && (
                <IconButton size="small" onClick={handleSubmit} color="primary">
                  <SendIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

SlugInput.propTypes = {
  value: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  label: PropTypes.string,
  width: PropTypes.number,
};

export default SlugInput;
