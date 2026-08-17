import {
    Box,
    Stack,
    Typography,
} from "@mui/material";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const parseDate = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};

const getDaysBetween = (
    start,
    end
) => {
    return Math.max(
        1,
        Math.ceil(
            (end.getTime() - start.getTime()) / DAY_IN_MS
        )
    );
};

const getMonthStart = (date) => {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );
};

const addMonths = (
    date,
    count
) => {
    return new Date(
        date.getFullYear(),
        date.getMonth() + count,
        1
    );
};

const formatMonth = (date) => {
    return new Intl.DateTimeFormat(
        "pl-PL",
        {
            month: "short",
            year: "2-digit",
        }
    ).format(date);
};

const getPosition = ({
    date,
    rangeStart,
    rangeDays,
}) => {
    const daysFromStart =
        (date.getTime() - rangeStart.getTime())
        / DAY_IN_MS;

    return Math.max(
        0,
        Math.min(
            100,
            (daysFromStart / rangeDays) * 100
        )
    );
};

const getBarDimensions = ({
    start,
    end,
    rangeStart,
    rangeDays,
}) => {
    const left = getPosition({
        date: start,
        rangeStart,
        rangeDays,
    });

    const right = getPosition({
        date: end,
        rangeStart,
        rangeDays,
    });

    return {
        left: `${left}%`,
        width: `${Math.max(right - left, 1)}%`,
    };
};



const Schedule = ({
    project,
    production,
}) => {
    const projectStart = parseDate(project?.start);
    const projectEnd = parseDate(project?.end);
    const productionRequest = parseDate(production?.request);
    const productionStart = parseDate(production?.start);
    const productionEnd = parseDate(production?.end);

    if (!projectStart || !projectEnd) {
        return null;
    }

    const rangeStart = getMonthStart(projectStart);

    const rangeEnd = new Date(
        projectEnd.getFullYear(),
        projectEnd.getMonth() + 1,
        1
    );

    const rangeDays = getDaysBetween(
        rangeStart,
        rangeEnd
    );

    const months = [];

    let currentMonth = rangeStart;



    while (currentMonth < rangeEnd) {
        const nextMonth = addMonths(
            currentMonth,
            1
        );

        const left = getPosition({
            date: currentMonth,
            rangeStart,
            rangeDays,
        });

        const right = getPosition({
            date: nextMonth,
            rangeStart,
            rangeDays,
        });

        months.push({
            key: currentMonth.toISOString(),
            label: formatMonth(currentMonth),
            left,
            width: right - left,
        });

        currentMonth = nextMonth;
    }

    const projectBar = getBarDimensions({
        start: projectStart,
        end: projectEnd,
        rangeStart,
        rangeDays,
    });

    const productionBar = productionStart && productionEnd
        ? getBarDimensions({
            start: productionStart,
            end: productionEnd,
            rangeStart,
            rangeDays,
        })
        : null;

    const requestPosition = productionRequest
        ? getPosition({
            date: productionRequest,
            rangeStart,
            rangeDays,
        })
        : null;

    console.log(requestPosition, productionRequest);

    const renderMonthScale = () => {
        return (
            <Box
                sx={{
                    position: "relative",
                    height: 25,
                    borderBottom: 1,
                    borderColor: "divider",
                    maxWidth: '100%',
                    overflowX: 'hidden'
                }}
            >
                {months.map((month) => {
                    return (
                        <Box
                            key={month.key}
                            sx={{
                                position: "absolute",
                                left: `${month.left}%`,
                                width: `${month.width}%`,
                                height: "100%",
                                borderLeft: 1,
                                borderColor: "divider",
                                px: 0.5,
                                overflow: "hidden",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 10,
                                    lineHeight: "24px",
                                    color: "text.secondary",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {month.label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        );
    };

    const renderGridLines = () => {
        return months.map((month) => {
            return (
                <Box
                    key={month.key}
                    sx={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: `${month.left}%`,
                        borderLeft: 1,
                        borderColor: "divider",
                        pointerEvents: "none",
                    }}
                />
            );
        });
    };

    const renderBar = ({
        key,
        label,
        durationDays,
        dimensions,
        backgroundColor,
        color,
    }) => {
        if (!dimensions) {
            return null;
        }

        return (
            <Box
                key={key}
                sx={{
                    position: "relative",
                    height: 30,
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 3,
                        bottom: 3,
                        left: dimensions.left,
                        width: dimensions.width,
                        minWidth: 40,
                        px: 1,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 0.75,
                        backgroundColor,
                        color,
                        overflow: "hidden",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 10.5,
                            lineHeight: 1.2,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        }}
                    >
                        {label}: {durationDays ?? "—"} dni
                    </Typography>
                </Box>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                minWidth: 0,
                overflowX: "auto",
            }}
        >
            <Box
                sx={{
                    minWidth: 520,
                }}
            >
                {renderMonthScale()}

                <Box
                    sx={{
                        position: "relative",
                        py: 0.5,
                        borderBottom: 1,
                        borderColor: "divider",
                    }}
                >
                    {renderGridLines()}

                    <Stack spacing={0.25}>
                        {renderBar({
                            key: "project",
                            label: "Projekt",
                            durationDays: project?.durationDays,
                            dimensions: projectBar,
                            backgroundColor: "warning.light",
                            color: "warning.contrastText",
                        })}

                        {requestPosition !== null && (
                            <Box
                                sx={{
                                    position: "relative",
                                    height: 22,
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        left: `calc(${requestPosition}% - 1px)`,
                                        top: 0,
                                        bottom: 0,
                                        width: 2,
                                        bgcolor: "warning.dark",
                                    }}
                                />

                                <Typography
                                    sx={{
                                        position: "absolute",
                                        left: `calc(${requestPosition}% + 4px)`,
                                        top: 2,
                                        fontSize: 10,
                                        color: "text.secondary",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Zlecenie produkcji
                                </Typography>
                            </Box>
                        )}

                        {renderBar({
                            key: "production",
                            label: "Produkcja",
                            durationDays: production?.durationDays,
                            dimensions: productionBar,
                            backgroundColor: "info.main",
                            color: "info.contrastText",
                        })}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};

export default Schedule;