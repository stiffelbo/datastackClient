import React, { useMemo, useState } from "react";

import {
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";


const ProcessFilter = ({
    filter,
    setFilter,
    options: {
        structureNames = [],
    } = {},
}) => {
    const structureName = filter.structureName ?? "";

    const handleStructureChange = (event) => {
        const value = event.target.value;

        setFilter(current => ({
            ...current,
            structureName: value,
        }));
    };

    const handleReset = () => {
        setFilter({});
    };

    return (
        <Box
            sx={{
                px: 1.5,
                py: 1.25,
                bgcolor: "grey.50",
            }}
        >
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
            >
                <FormControl
                    size="small"
                    fullWidth
                >
                    <InputLabel id="process-structure-filter-label">
                        Struktura
                    </InputLabel>

                    <Select
                        labelId="process-structure-filter-label"
                        value={structureName}
                        label="Struktura"
                        onChange={handleStructureChange}
                        sx={{
                            bgcolor: "background.paper",
                            "& .MuiSelect-select": {
                                fontSize: 13,
                            },
                        }}
                    >
                        <MenuItem value="">
                            <em>Wszystkie</em>
                        </MenuItem>

                        {structureNames.map(name => (
                            <MenuItem
                                key={name}
                                value={name}
                            >
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {structureName && (
                    <Button
                        size="small"
                        variant="text"
                        onClick={handleReset}
                        sx={{
                            minWidth: "auto",
                            px: 1,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Wyczyść
                    </Button>
                )}
            </Stack>
        </Box>
    );
};


const Processes = ({
    onAddProcess,
    processes = [],
    loading = true,
}) => {
    const [filter, setFilter] = useState({});

    const structureNames = useMemo(
        () => [
            ...new Set(
                processes
                    .map(process => process.structureName)
                    .filter(Boolean)
            ),
        ].sort((a, b) => a.localeCompare(b)),
        [processes]
    );

    const filtered = useMemo(() => {
        if (!filter.structureName) {
            return processes;
        }

        return processes.filter(
            process =>
                process.structureName === filter.structureName
        );
    }, [processes, filter.structureName]);

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRight: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Box
                sx={{
                    px: 1.5,
                    pt: 1.5,
                    pb: 0.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                }}
            >
                <Typography
                    variant="overline"
                    sx={{
                        fontWeight: 700,
                        lineHeight: 1,
                        letterSpacing: "0.08em",
                        color: "text.secondary",
                    }}
                >
                    Procesy
                </Typography>

                <Chip
                    size="small"
                    label={`${filtered.length} / ${processes.length}`}
                    variant="outlined"
                    sx={{
                        height: 20,
                        fontSize: 11,
                        fontVariantNumeric: "tabular-nums",
                    }}
                />
            </Box>

            <ProcessFilter
                filter={filter}
                setFilter={setFilter}
                options={{
                    structureNames,
                }}
            />

            <Divider />

            <List
                disablePadding
                sx={{
                    flex: 1,
                    overflow: "auto",
                }}
            >
                {filtered.map(process => (
                    <ListItem
                        key={process.id}
                        divider
                        onClick={() =>
                                    onAddProcess(process)
                                }
                        sx={{
                            py: 0.75,
                            pr: 9,
                            transition: "background-color 120ms ease",
                            corsor: "pointer",
                            "&:hover": {
                                bgcolor: "action.hover",
                            },
                        }}
                    >
                        <ListItemText
                            primary={process.name}
                            secondary={process.structureName}
                            primaryTypographyProps={{
                                noWrap: true,
                                sx: {
                                    fontSize: 13,
                                    fontWeight: 600,
                                },
                            }}
                            secondaryTypographyProps={{
                                noWrap: true,
                                sx: {
                                    mt: 0.15,
                                    fontSize: 11,
                                    fontFamily: "monospace",
                                    color: "text.secondary",
                                },
                            }}
                        />
                    </ListItem>
                ))}

                {filtered.length === 0 && (
                    <Box
                        sx={{
                            px: 2,
                            py: 4,
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Brak procesów dla wybranego filtra
                        </Typography>
                    </Box>
                )}
            </List>
        </Box>
    );
};

export default Processes;