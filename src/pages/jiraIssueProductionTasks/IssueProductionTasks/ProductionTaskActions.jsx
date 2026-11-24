import React from "react";

import {
    Stack,
    IconButton,
    Tooltip,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const ProductionTaskActions = ({
    task,
    actions,
    ui,
    disabled = false,
    sx = {},
}) => {
    if (!task) return null;

    const openTaskPanel = (panel) => {
        ui.selectTask(task.id);
        ui.openPanel(panel);
    };

    const controls = [
        {
            key: 'edit',
            label: 'Edycja zadania',
            icon: EditOutlinedIcon,
            action: () => openTaskPanel('task'),
        },
        {
            key: 'reports',
            label: 'Raporty produkcyjne',
            icon: QueryStatsOutlinedIcon,
            action: () => openTaskPanel('reports'),
        },
        {
            key: 'tools',
            label: 'Narzędzia i wyposażenie',
            icon: BuildOutlinedIcon,
            action: () => openTaskPanel('tools'),
        },
        {
            key: 'files',
            label: 'Pliki i dokumentacja',
            icon: AttachFileOutlinedIcon,
            action: () => openTaskPanel('files'),
        },
        {
            key: 'relations',
            label: 'Zależności zadania',
            icon: AccountTreeOutlinedIcon,
            action: () => openTaskPanel('relations-in'),
        },
        {
            key: 'delete',
            label: 'Usuń zadanie produkcyjne',
            icon: DeleteForeverIcon,
            color: 'error',
            action: () => actions.remove(task.id),
        },
    ];

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.25}
            className="nodrag nopan"
            onClick={(event) => event.stopPropagation()}
            sx={{
                width: 'fit-content',
                ...sx,
            }}
        >
            {controls.map(control => {
                const Icon = control.icon;

                return (
                    <Tooltip key={control.key} title={control.label}>
                        <span>
                            <IconButton
                                size="small"
                                color={control.color ?? 'default'}
                                disabled={disabled || control.disabled}
                                aria-label={control.label}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    control.action();
                                }}
                                sx={{
                                    p: 0.5,
                                    borderRadius: 1,
                                    '& .MuiSvgIcon-root': {
                                        fontSize: 17,
                                    },
                                }}
                            >
                                <Icon />
                            </IconButton>
                        </span>
                    </Tooltip>
                );
            })}
        </Stack>
    );
};

export default ProductionTaskActions;