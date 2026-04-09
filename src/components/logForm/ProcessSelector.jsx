import React from "react";
import { Stack, Typography } from "@mui/material";
import InputSelectObject from "./InputSelectObject";

const ProcessSelector = ({
    value = "",
    options = [],
    onChange,
    title = "Proces",
    label = "Wybierz czynność",
    disabled = false,
}) => {
    return (
        <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
                {title}
            </Typography>

            <InputSelectObject
                selectOptions={options}
                value={value}
                label={label}
                onChange={onChange}
                disabled={disabled}
            />
        </Stack>
    );
};

export default ProcessSelector;