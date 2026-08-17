import React, { useMemo, useState } from "react";

// MUI imports
import {
    Alert,
    Box,
    Chip,
    Collapse,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

// Components
import DistributionBar from "./DistributionBar";
import CompactField from "./CompactField";
import SummaryValue from "./SummaryValue";
import Schedule from "./Schedule";

// DTO
import { createBilansSummaryDto } from "./dto";

const BilansSummary = ({ data }) => {
    const [remarksOpen, setRemarksOpen] = useState(false);

    const dto = useMemo(() => {
        if (!data) {
            return null;
        }

        return createBilansSummaryDto(data);
    }, [data]);

    if (!dto) {
        return (
            <Alert severity="warning">
                Brak danych bilansu projektu.
            </Alert>
        );
    }

    const renderProject = () => {
        const {
            heading,
        } = dto.project;

        const StatusIcon = dto.status.icon;

        const projectMeta = [
            {
                key: "productGroup",
                label: "Grupa produktowa",
                value: heading.productGroup,
            },
            {
                key: "structure",
                label: "Struktura",
                value: heading.structure,
            },
            {
                key: "projectStatus",
                label: "Status projektu",
                value: heading.projectStatus,
            },
            {
                key: "active",
                label: "Aktywność",
                value: heading.active,
            },
        ].filter((item) => item.value);

        return (
            <Stack
                spacing={1}
            >
                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{
                        xs: "flex-start",
                        sm: "center",
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: 14,
                                lineHeight: 1.25,
                                fontWeight: 700,
                            }}
                        >
                            {heading.title}
                        </Typography>

                        {heading.contractor && (
                            <Typography
                                sx={{
                                    mt: 0.25,
                                    fontSize: 11.5,
                                    lineHeight: 1.2,
                                    color: "text.secondary",
                                }}
                            >
                                {heading.contractor}
                            </Typography>
                        )}
                    </Box>

                    <Chip
                        size="small"
                        icon={
                            <StatusIcon
                                sx={{
                                    fontSize: 16,
                                }}
                            />
                        }
                        color={dto.status.color}
                        variant="outlined"
                        label={dto.status.label}
                        sx={{
                            height: 25,
                            flexShrink: 0,
                            fontSize: 11,
                            fontWeight: 700,
                            "& .MuiChip-label": {
                                px: 1,
                            },
                        }}
                    />
                </Stack>

                {projectMeta.length > 0 && (
                    <Stack
                        direction="row"
                        spacing={1.5}
                        useFlexGap
                        flexWrap="wrap"
                        divider={
                            <Divider
                                orientation="vertical"
                                flexItem
                            />
                        }
                    >
                        {projectMeta.map((item) => {
                            return (
                                <Stack
                                    key={item.key}
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="baseline"
                                >
                                    <Typography
                                        sx={{
                                            fontSize: 11,
                                            lineHeight: 1.2,
                                            color: "text.secondary",
                                        }}
                                    >
                                        {item.label}:
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: 11.5,
                                            lineHeight: 1.2,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {item.value}
                                    </Typography>
                                </Stack>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        );
    };

    const renderFields = (
        fields,
        columns = {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 6,
        },
        backgroundColor = "transparent"
    ) => {
        if (!fields) return;
        return (
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: `repeat(${columns.xs}, minmax(0, 1fr))`,
                        sm: `repeat(${columns.sm}, minmax(0, 1fr))`,
                        md: `repeat(${columns.md}, minmax(0, 1fr))`,
                        lg: `repeat(${columns.lg}, minmax(0, 1fr))`,
                    },
                    gap: 1.25,
                    backgroundColor
                }}
                mt={2}
            >
                {fields.map((field) => (
                    <CompactField
                        key={String(field.key)}
                        {...field}
                    />
                ))}
            </Box>
        );
    };


    const renderProjectQuantities = () => {
        return renderFields(dto.quantities.fields, {
            xs: 2,
            sm: 3,
            md: 5,
            lg: 5
        });
    };

    const renderProjectSchedule = () => {
        const {
            project,
            production,
            dates,
        } = dto.schedule;

        if (
            !project?.start
            && !dates?.length
        ) {
            return null;
        }

        return (
            <Stack spacing={1}>
                {dates?.length > 0 && (
                    renderFields(
                        dates,
                        {
                            xs: 2,
                            sm: 3,
                            md: 5,
                            lg: 5,
                        }
                    )
                )}
                <Schedule
                    project={project}
                    production={production}
                />
            </Stack>
        );
    };

    const renderRemarks = () => {
        if (!dto.remarks.count) {
            return null;
        }

        return (
            <Box>
                <Alert
                    severity={dto.remarks.severity}
                    variant="outlined"
                    onClick={() => {
                        setRemarksOpen((current) => !current);
                    }}
                    action={
                        <ExpandMoreRoundedIcon
                            sx={{
                                fontSize: 18,
                                transform: remarksOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                transition: "transform 150ms ease",
                            }}
                        />
                    }
                    sx={{
                        py: 0,
                        minHeight: 34,
                        cursor: "pointer",
                        alignItems: "center",
                        "& .MuiAlert-icon": {
                            py: 0.75,
                            fontSize: 18,
                        },
                        "& .MuiAlert-message": {
                            py: 0.75,
                            fontSize: 11.5,
                            lineHeight: 1.25,
                        },
                        "& .MuiAlert-action": {
                            alignItems: "center",
                            py: 0,
                        },
                    }}
                >
                    {dto.remarks.label}
                </Alert>

                <Collapse in={remarksOpen}>
                    <Stack
                        spacing={0.5}
                        sx={{
                            mt: 0.75,
                            pl: 1,
                        }}
                    >
                        {dto.remarks.items.map((remark, index) => (
                            <Box
                                key={`${remark.code ?? "remark"}-${index}`}
                                sx={{
                                    py: 0.5,
                                    pl: 1,
                                    borderLeft: 2,
                                    borderColor:
                                        remark.severity === "error"
                                            ? "error.main"
                                            : remark.severity === "warning"
                                                ? "warning.main"
                                                : "info.main",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 11.5,
                                        lineHeight: 1.3,
                                        fontWeight: 600,
                                    }}
                                >
                                    {remark.title
                                        || remark.group
                                        || "Uwaga"
                                    }
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 11,
                                        lineHeight: 1.3,
                                        color: "text.secondary",
                                    }}
                                >
                                    {remark.content}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Collapse>
            </Box>
        );
    };


    const renderProjectSummary = () => (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                    lg: `repeat(${dto.summary.values.length}, minmax(0, 1fr))`,
                },
                gap: 0.5,
            }}
        >
            {dto.summary.values.map((item) => (
                <SummaryValue
                    key={item.key}
                    {...item}
                />
            ))}
        </Box>
    );

    const renderProjectRevenue = () => {
        const {
            title,
            fields,
            totals,
        } = dto.revenue;

        if (!fields?.length && !totals?.length) {
            return null;
        }

        return (
            <Stack spacing={1}>
                <Typography
                    sx={{
                        fontSize: 12,
                        lineHeight: 1.2,
                        fontWeight: 700,
                    }}
                >
                    {title}
                </Typography>

                {fields?.length > 0 && (
                    renderFields(
                        fields,
                        {
                            xs: 2,
                            sm: 3,
                            md: 3,
                            lg: 6,
                        }
                    )
                )}

                {totals?.length > 0 && (
                    <Box
                        sx={{
                            pt: 1,
                            borderTop: 1,
                            borderColor: "divider",
                        }}
                    >
                        {renderFields(
                            totals,
                            {
                                xs: 1,
                                sm: 2,
                                md: 2,
                                lg: 2,
                            }
                        )}
                    </Box>
                )}
            </Stack>
        );
    };

    const renderProjectCosts = () => (
        <Box>
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{
                    xs: "stretch",
                    sm: "flex-end",
                }}
                sx={{ mb: 1 }}
            >
                <Typography
                    sx={{
                        fontSize: 12,
                        lineHeight: 1.2,
                        fontWeight: 700,
                    }}
                >
                    {dto.costs.title}
                </Typography>

                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-end"
                >
                    {dto.costs.totals.map((item) => (
                        <CompactField
                            key={item.key}
                            {...item}
                        />
                    ))}
                </Stack>
            </Stack>

            <Stack spacing={1.5}>
                {dto.costs.distributions.map((distribution) => (
                    <DistributionBar
                        key={distribution.key}
                        title={distribution.title}
                        items={distribution.items}
                        valueFormatter={distribution.valueFormatter}
                    />
                ))}
            </Stack>
        </Box>
    );

    return (
        <Paper
            variant="outlined"
            sx={{
                width: "100%",
                borderRadius: 1.5,
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    px: {
                        xs: 1.5,
                        sm: 2,
                    },
                    py: 1.5,
                }}
            >
                <Stack spacing={1.25}>
                    {renderProject()}
                    {renderProjectQuantities()}

                    {renderProjectSchedule()}

                    {renderRemarks()}

                    <Divider />

                    {renderProjectSummary()}

                    <Divider />

                    {renderProjectRevenue()}

                    <Divider />

                    {renderProjectCosts()}
                </Stack>
            </Box>
        </Paper>
    );
};


export default BilansSummary;

