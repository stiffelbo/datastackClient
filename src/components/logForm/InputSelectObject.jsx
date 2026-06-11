import React from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    ListSubheader,
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
    const hasGroups = selectOptions.some((option) => option.group);

    console.log(label, selectOptions);

    const groupedOptions = hasGroups
        ? selectOptions.reduce((acc, option) => {
            const group = option.group || "Inne";

            if (!acc[group]) {
                acc[group] = [];
            }

            acc[group].push(option);

            return acc;
        }, {})
        : null;

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

                {hasGroups
                    ? Object.entries(groupedOptions).map(([group, options]) => (
                        <React.Fragment key={group}>
                            <ListSubheader>{group}</ListSubheader>

                            {options.map((option) => (
                                <MenuItem
                                    key={option.id}
                                    value={option.id}
                                    title={option.title ?? ""}
                                >
                                    {option.val}
                                </MenuItem>
                            ))}
                        </React.Fragment>
                    ))
                    : selectOptions.map((option) => (
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