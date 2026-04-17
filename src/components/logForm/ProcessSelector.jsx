import React from "react";
import { Stack, Typography } from "@mui/material";
import InputSelectObject from "./InputSelectObject";
import InputSwitch from "./InputSwitch";

const ProcessSelector = ({
    value = "",
    options = [],
    onChange,
    isRework = false,
    onReworkChange,
    title = "Proces",
    label = "Wybierz czynność",
}) => {
    return (
        <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
                {title}
            </Typography>
            <Stack spacing={1} direction={"row"}>
                <InputSelectObject
                    selectOptions={options}
                    value={value}
                    label={label}
                    onChange={onChange}

                />

                <InputSwitch
                    label="Poprawka?"
                    value={isRework}
                    onChange={onReworkChange}
                />
            </Stack>
            
        </Stack>
    );
};

export default ProcessSelector;