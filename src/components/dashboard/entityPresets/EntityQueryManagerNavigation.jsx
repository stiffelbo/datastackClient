import React from "react";

import {
    Box,
    Chip,
    Divider,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

const VIEW_PRESETS = "presets";
const VIEW_CREATE = "create";
const VIEW_CONFIGURATOR = "configurator";

const MODE_ALL = "all";
const MODE_MINE = "mine";
const MODE_OTHER = "other";

const EntityQueryManagerNavigation = ({
    view = VIEW_PRESETS,
    activePreset = null,
    busy = false,

    presetMode = MODE_ALL,
    presetCounters = {
        all: 0,
        mine: 0,
        other: 0,
    },

    onPresetModeChange = () => {},
    onShowPresets = () => {},
    onStartCreatePreset = () => {},
    onShowEditor = () => {},
    onClose = () => {},

    children = null,
}) => {
    const hasActivePreset =
        activePreset !== null &&
        activePreset !== undefined;

    const activePresetName =
        String(activePreset?.name ?? "").trim() ||
        "Brak wybranego presetu";

    const configuratorLabel =
        view === VIEW_CREATE
            ? "Nowy preset"
            : activePresetName;

    const getNavigationButtonSx = (
        expectedView
    ) => {
        if (view !== expectedView) {
            return {};
        }

        return {
            bgcolor: "action.selected",
        };
    };

    const renderModeLabel = (
        label,
        count
    ) => {
        return (
            <Box
                component="span"
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                }}
            >
                {label}

                <Chip
                    component="span"
                    size="small"
                    label={count}
                    sx={{
                        height: 18,
                        minWidth: 22,
                        pointerEvents: "none",

                        "& .MuiChip-label": {
                            px: 0.75,
                            fontSize: "0.68rem",
                        },
                    }}
                />
            </Box>
        );
    };

    return (
        <Box
            component="nav"
            aria-label="Nawigacja menedżera zapytań"
            sx={{
                minHeight: 48,
                px: 1,
                py: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                flexShrink: 0,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    flexShrink: 0,
                }}
            >
                <Tooltip title="Pokaż listę presetów">
                    <span>
                        <IconButton
                            size="small"
                            color={
                                view === VIEW_PRESETS
                                    ? "primary"
                                    : "default"
                            }
                            disabled={busy}
                            onClick={onShowPresets}
                            aria-label="Pokaż listę presetów"
                            sx={getNavigationButtonSx(
                                VIEW_PRESETS
                            )}
                        >
                            <ListAltIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Utwórz nowy preset">
                    <span>
                        <IconButton
                            size="small"
                            color={
                                view === VIEW_CREATE
                                    ? "primary"
                                    : "default"
                            }
                            disabled={busy}
                            onClick={onStartCreatePreset}
                            aria-label="Utwórz nowy preset"
                            sx={getNavigationButtonSx(
                                VIEW_CREATE
                            )}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Edytuj aktualnie wybrany preset">
                    <span>
                        <IconButton
                            size="small"
                            color={
                                view === VIEW_CONFIGURATOR
                                    ? "primary"
                                    : "default"
                            }
                            disabled={
                                busy ||
                                !hasActivePreset
                            }
                            onClick={onShowEditor}
                            aria-label="Edytuj wybrany preset"
                            sx={getNavigationButtonSx(
                                VIEW_CONFIGURATOR
                            )}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            <Divider
                orientation="vertical"
                flexItem
            />

            {view === VIEW_PRESETS ? (
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={presetMode}
                    disabled={busy}
                    onChange={(
                        event,
                        nextMode
                    ) => {
                        if (
                            nextMode !== null
                        ) {
                            onPresetModeChange(
                                nextMode
                            );
                        }
                    }}
                    aria-label="Filtrowanie listy presetów"
                    sx={{
                        flexShrink: 0,

                        "& .MuiToggleButton-root": {
                            px: 1,
                            py: 0.5,
                            textTransform: "none",
                        },
                    }}
                >
                    <ToggleButton value={MODE_ALL}>
                        {renderModeLabel(
                            "Wszystkie",
                            presetCounters.all
                        )}
                    </ToggleButton>

                    <ToggleButton value={MODE_MINE}>
                        {renderModeLabel(
                            "Moje",
                            presetCounters.mine
                        )}
                    </ToggleButton>

                    <ToggleButton value={MODE_OTHER}>
                        {renderModeLabel(
                            "Obce",
                            presetCounters.other
                        )}
                    </ToggleButton>
                </ToggleButtonGroup>
            ) : (
                <Box
                    sx={{
                        minWidth: 0,
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <ManageSearchIcon
                        fontSize="small"
                        color="action"
                    />

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                        >
                            {configuratorLabel}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                        >
                            Konfiguracja filtrów
                        </Typography>
                    </Box>
                </Box>
            )}

            <Box sx={{ flex: 1 }} />

            {children && (
                <>
                    <Box
                        sx={{
                            minWidth: 0,
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 1,
                        }}
                    >
                        {children}
                    </Box>

                    <Divider
                        orientation="vertical"
                        flexItem
                    />
                </>
            )}

            <Tooltip title="Zamknij menedżer zapytań">
                <span>
                    <IconButton
                        size="small"
                        disabled={busy}
                        onClick={onClose}
                        aria-label="Zamknij menedżer zapytań"
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
};

export default EntityQueryManagerNavigation;