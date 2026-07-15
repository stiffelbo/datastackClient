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
    const handleChange = (event) => {
        const rawValue = event.target.value;

        if (rawValue === "") {
            onChange?.("");
            return;
        }

        const normalizedValue = rawValue.replace(",", ".");
        const numberValue = Number(normalizedValue);

        if (!Number.isFinite(numberValue)) {
            return;
        }

        if (min !== undefined && numberValue < min) {
            return;
        }

        if (max !== undefined && numberValue > max) {
            return;
        }

        onChange?.(numberValue);
    };

    return (
        <TextField
            fullWidth={fullWidth}
            size={size}
            type="number"
            label={label}
            value={value ?? ""}
            required={required}
            disabled={disabled}
            onChange={handleChange}
            inputProps={{
                min,
                max,
                step,
                inputMode: "decimal",
            }}
        />
    );
};

export default InputNumber;