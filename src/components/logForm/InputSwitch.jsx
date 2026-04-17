import React from "react";
import {
    FormControlLabel,
    Switch,
} from "@mui/material";

const InputSwitch = ({
    label = "",
    value = false,
    onChange,
    disabled = false,
}) => {
    function handleChange(event) {
        if (typeof onChange === "function") {
            onChange(event.target.checked);
        }
    }

    return (
        <FormControlLabel
            control={
                <Switch
                    checked={Boolean(value)}
                    onChange={handleChange}
                    disabled={disabled}
                />
            }
            label={label}
            sx={{ m: 0 }}
        />
    );
};

export default InputSwitch;