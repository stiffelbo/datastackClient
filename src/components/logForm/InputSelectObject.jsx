import React from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from "@mui/material";

const InputSelectObject = ({
    label,
    value,
    onChange,
    selectOptions = [],
    fullWidth = true,
    size = "small",
    disabled = false,
}) => {
    return (
        <FormControl fullWidth={fullWidth} size={size} disabled={disabled}>
            <InputLabel>{label}</InputLabel>
            <Select
                value={value ?? ""}
                label={label}
                onChange={(event) => onChange?.(event.target.value)}
            >
                <MenuItem value="">
                    <em>—</em>
                </MenuItem>

                {selectOptions.map((option) => (
                    <MenuItem
                        key={option.id}
                        value={option.id}
                        title={option.title ?? ""}
                    >
                        {option.val}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default InputSelectObject;