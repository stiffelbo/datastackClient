import React from "react";

import {
    Box,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PublicIcon from "@mui/icons-material/Public";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import {
    getPresetDescription,
    getPresetFiltersCount,
    getPresetId,
    getPresetName,
    getPresetOwnerName,
    isOwnedEntityPreset,
    isSelectedEntityPreset,
    isPublicEntityPreset,
    normalizeEntityPresets,
} from "./entityQueryUtils";

const EntityQueryPresetsList = ({
    presets = [],
    selectedPresetId = null,
    busy = false,
    onSelect = async () => {},
    onDelete = async () => {},
    
}) => {
    const normalizedPresets = normalizeEntityPresets(presets);

    if (normalizedPresets.length === 0) {
        return (
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Brak dostępnych presetów.
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer
            sx={{
                width: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                overflow: "auto",
            }}
        >
            <Table stickyHeader size="small" aria-label="Lista presetów zapytania">
                <TableHead>
                    <TableRow>
                        <TableCell align="center" sx={{width: 64}}>
                            Wybierz
                        </TableCell>

                        <TableCell sx={{width: 200}}>
                            Nazwa
                        </TableCell>

                        <TableCell>
                            Opis
                        </TableCell>

                        <TableCell align="center" sx={{width: 70}}>
                            Filtry
                        </TableCell>

                        <TableCell sx={{width: 70}}>
                            Czyj
                        </TableCell>

                        <TableCell sx={{width: 70}}>
                            Publiczny
                        </TableCell>

                        <TableCell align="right" sx={{width: 70}}>
                            Usuń
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {normalizedPresets.map((preset) => {
                        const presetId = getPresetId(preset);
                        const selected = isSelectedEntityPreset({preset, selectedPresetId});
                        const owned = isOwnedEntityPreset(preset);
                        const description = getPresetDescription(preset);
                        const isPublic = isPublicEntityPreset(preset);
                        const canDelete = preset.can_delete;
                        return (
                            <TableRow key={presetId} hover selected={selected}>
                                <TableCell align="center">
                                    <Tooltip title={selected ? "Aktualnie wybrany preset" : "Wybierz preset"}>
                                        <span>
                                            <IconButton
                                                size="small"
                                                color={selected ? "success" : "primary"}
                                                disabled={busy || selected}
                                                onClick={() => onSelect(presetId)}
                                                aria-label={selected ? "Aktualnie wybrany preset" : `Wybierz preset ${getPresetName(preset)}`}
                                            >
                                                {selected
                                                    ? <CheckCircleIcon fontSize="small" />
                                                    : <RadioButtonUncheckedIcon fontSize="small" />
                                                }
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>

                                <TableCell>
                                    <Typography variant="body2" fontWeight={selected ? 600 : 400}>
                                        {getPresetName(preset)}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {description || "—"}
                                    </Typography>
                                </TableCell>

                                <TableCell align="center">
                                    <Tooltip title="Liczba zapisanych filtrów">
                                        <Box
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                            }}
                                        >
                                            <FilterAltOutlinedIcon fontSize="small" color="action" />
                                            {getPresetFiltersCount(preset)}
                                        </Box>
                                    </Tooltip>
                                </TableCell>

                                <TableCell>
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color={owned ? "default" : "info"}
                                        icon={owned ? <PersonOutlineIcon /> : <PublicIcon />}
                                        label={getPresetOwnerName(preset)}
                                    />
                                </TableCell>
                                
                                <TableCell>
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color={isPublic ? "success" : "warning"}
                                        icon={isPublic ? <PublicIcon /> : <PersonOutlineIcon />}
                                        label={isPublic ? 'Publiczny' : 'Prywatny'}
                                    />
                                </TableCell>

                                <TableCell align="right">
                                    {canDelete && <Tooltip title="Usuń preset">
                                        <span>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                disabled={busy}
                                                onClick={() => onDelete(presetId)}
                                                aria-label={`Usuń preset ${getPresetName(preset)}`}
                                            >
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default EntityQueryPresetsList;