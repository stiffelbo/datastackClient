import React from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Menu,
    Select,
    ListSubheader,
} from "@mui/material";

const InputSelectObject = ({
    name,
    label,
    value,
    onChange,
    selectOptions = [],
    fullWidth = true,
    size = "small",
    disabled = false,
}) => {
    const sortedOptions = [...selectOptions].sort((a, b) =>
        String(a.group ?? "").localeCompare(String(b.group ?? ""))
    );

    const flatOptions = sortedOptions.flatMap((option, index) => {
        const previousOption = sortedOptions[index - 1];
        const items = [];

        if (option.group && option.group !== previousOption?.group) {
            items.push({
                type: "group",
                key: `group-${option.group}`,
                label: option.group,
            });
        }

        items.push({
            type: "option",
            key: `option-${option.id}`,
            value: option.id,
            label: option.val,
            title: option.title ?? "",
            disabled: option.disabled ?? false,
        });

        return items;
    });

    return (
        <FormControl fullWidth={fullWidth} size={size} disabled={disabled}>
            <InputLabel id={`${name}-label`}>{label}</InputLabel>

            <Select
                labelId={`${name}-label`}
                name={name}
                label={label}
                value={value ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
            >
                <MenuItem value="">
                    {`-- ${label || "Wybierz"} --`}
                </MenuItem>

                {flatOptions.map((item) =>
                    item.type === "group" ? (
                        <ListSubheader key={item.key} disableSticky>
                            {item.label}
                        </ListSubheader>
                    ) : (
                        <MenuItem
                            key={item.key}
                            value={item.value}
                            title={item.title}
                            disabled={item.disabled}
                        >
                            {item.label}
                        </MenuItem>
                    )
                )}
            </Select>
        </FormControl>
    );
};
export default InputSelectObject;