import React, { useMemo } from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { colorFromString } from "../../../utils/colorHash";

const formatNumber = (value, max = 1) =>
    new Intl.NumberFormat("pl-PL", {
        maximumFractionDigits: max,
    }).format(value);

const normalize = (items) => {
    return [...items]
        .filter(i => Number(i.value) > 0)
        .sort((a, b) => Number(b.value) - Number(a.value))
        .map((item) => ({
            ...item,
            color: item.color || colorFromString(item.label),
        }));
};

const DistributionBar = ({
    title,
    items = [],
    height = 22,
    valueFormatter = (v) => v,
}) => {
    const data = useMemo(() => normalize(items), [items]);

    const total = useMemo(() => {
        return data.reduce((sum, i) => sum + Number(i.value), 0);
    }, [data]);

    if (!data.length || total <= 0) return null;

    console.log(data);

    return (
        <Box>
            <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 0.5 }}
            >
                <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                    {title}
                </Typography>

                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    {valueFormatter(total)}
                </Typography>
            </Stack>

            <Box
                sx={{
                    display: "flex",
                    width: "100%",
                    height,
                    borderRadius: 0.75,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "grey.100",
                }}
            >
                {data.map((item, idx) => {
                    const pct = (Number(item.value) / total) * 100;

                    return (
                        <Tooltip
                            key={item.key || idx}
                            title={`${item.label}: ${valueFormatter(item.value)} (${formatNumber(pct)}%)`}
                        >
                            <Box
                                sx={{
                                    width: `${pct}%`,
                                    minWidth: 3,
                                    height: "100%",
                                    bgcolor: item.color,
                                    transition: "filter 120ms ease",
                                    "&:hover": {
                                        filter: "brightness(0.85)",
                                    },
                                }}
                            />
                        </Tooltip>
                    );
                })}
            </Box>

            {/* legenda (ultra compact) */}
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
                {data.map((item, idx) => (
                    <Stack
                        key={item.key || idx}
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                    >
                        <Box
                            sx={{
                                width: 7,
                                height: 7,
                                borderRadius: 0.25,
                                bgcolor: item.color,
                            }}
                        />
                        <Typography sx={{ fontSize: 10.5, color: "text.secondary" }}>
                            {item.label}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
};

export default DistributionBar;

