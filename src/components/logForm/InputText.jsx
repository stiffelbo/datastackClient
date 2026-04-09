import React from "react";
import { TextField } from "@mui/material";

const InputText = ({
    label,
    value,
    onChange,
    multiline = false,
    rows = 1,
    required = false,
    disabled = false,
    fullWidth = true,
    size = "small",
}) => {
    return (
        <TextField
            fullWidth={fullWidth}
            size={size}
            label={label}
            value={value ?? ""}
            required={required}
            disabled={disabled}
            multiline={multiline}
            rows={rows}
            onChange={(event) => onChange?.(event.target.value)}
        />
    );
};

export default InputText;