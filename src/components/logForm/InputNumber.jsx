import React from "react";
import { TextField } from "@mui/material";

const InputNumber = ({
    label,
    value,
    onChange,
    min = 0,
    max,
    step = 0.01,
    required = false,
    disabled = false,
    fullWidth = true,
    size = "small",
}) => {
    return (
        <TextField
            fullWidth={fullWidth}
            size={size}
            type="number"
            label={label}
            value={value ?? ""}
            required={required}
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.value)}
            inputProps={{
                min,
                max,
                step,
            }}
        />
    );
};

export default InputNumber;