import React from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    ListSubheader,
    Tooltip,
    Box,
    Typography,
} from "@mui/material";

import ProcessTooltipContent from "./ProcessTooltipContent";

function getTypeColor(typeGroup = "") {
    if (typeGroup.includes("Ogólne")) return "primary.main";
    if (typeGroup.includes("Projektowe")) return "info.main";
    if (typeGroup.includes("setup")) return "warning.main";
    if (typeGroup.includes("Produkcyjne")) return "success.main";

    return "text.secondary";
}

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
    const sortedOptions = [...selectOptions].sort((a, b) => {
        const taskGroupCompare =
            (a.taskGroupOrder ?? 99) - (b.taskGroupOrder ?? 99);

        if (taskGroupCompare !== 0) return taskGroupCompare;

        const groupCompare = String(a.group ?? "").localeCompare(
            String(b.group ?? "")
        );

        if (groupCompare !== 0) return groupCompare;

        return String(a.val ?? "").localeCompare(String(b.val ?? ""));
    });

    const flatOptions = sortedOptions.flatMap((option, index) => {
        const previousOption = sortedOptions[index - 1];
        const items = [];

        const isNewTaskGroup = option.taskGroup !== previousOption?.taskGroup;

        const isNewDepartment =
            option.group &&
            (isNewTaskGroup || option.group !== previousOption?.group);

        if (isNewTaskGroup) {
            items.push({
                type: "taskGroup",
                key: `task-group-${option.taskGroup}`,
                label: option.taskGroup,
            });
        }

        if (isNewDepartment) {
            items.push({
                type: "group",
                key: `group-${option.taskGroup}-${option.group}`,
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
            meta: option.meta ?? {},
            group: option.group ?? "",
            taskGroup: option.taskGroup ?? "",
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

                {flatOptions.map((item) => {
                    if (item.type === "taskGroup") {
                        const isRequired = item.label.includes("Wymaga");

                        return (
                            <ListSubheader
                                key={item.key}
                                disableSticky
                                sx={{
                                    bgcolor: isRequired ? "warning.50" : "success.50",
                                    color: isRequired ? "warning.dark" : "success.dark",
                                    fontWeight: 800,
                                    fontSize: 13,
                                    lineHeight: "34px",
                                    borderTop: "1px solid",
                                    borderColor: "divider",
                                }}
                            >
                                {item.label}
                            </ListSubheader>
                        );
                    }

                    if (item.type === "group") {
                        return (
                            <ListSubheader
                                key={item.key}
                                disableSticky
                                sx={{
                                    pl: 3,
                                    bgcolor: "background.paper",
                                    color: "text.secondary",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    lineHeight: "28px",
                                }}
                            >
                                ↳ {item.label}
                            </ListSubheader>
                        );
                    }

                    return (
                        <MenuItem
                            key={item.key}
                            value={item.value}
                            disabled={item.disabled}
                            sx={{ pl: 4 }}
                        >
                            <Tooltip
                                title={<ProcessTooltipContent option={item} />}
                                placement="right"
                                arrow
                                enterDelay={400}
                            >
                                <Box sx={{ width: "100%" }}>
                                    <Typography variant="body2">
                                        {item.label}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
};

export default InputSelectObject;