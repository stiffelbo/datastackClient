
import React, { useEffect, useState } from "react";

import { Box, Grid } from "@mui/material";
import { alpha, useTheme } from '@mui/material/styles';

import useEntity from "../../hooks/useEntity";
import { useMonths } from "../../hooks/useMonths";

import PowerTable from "../../components/powerTable/powerTable";
import MonthPicker from "../../components/MonthPicker";
import EmployeeWorkReportDayDetails from "./EmployeeWorkReportDayDetails";

const EmployeeWorkReport = ({ id = null, rwd, heightSpan = 188 }) => {
    const entityName = "EmployeeWorkReport";
    const month = useMonths();
    const [selected, setSelected] = useState(null);

    const entity = useEntity({
        entityName,
        endpoint: "/reports_worklog/",
        query: {
            employeeId: id,
            dateFrom: month.startDate,
            dateTo: month.endDate,
        },
    });

    const height = rwd.height - heightSpan;
    const tableHeight = height - 26;

    useEffect(() => {
        setSelected(null);
    }, [id, month.startDate, month.endDate]);

    const handleSelect = (data) => {
        setSelected(data);
    };

    const theme = useTheme();

    const getRowStyles = (row) => {
        const rcp = Number(row.rcpHours) || 0;
        const reported = Number(row.reportedHours) || 0;
        const unreported = Number(row.unreportedHours) || 0;

        // Brak obecności w RCP
        if (rcp <= 0) {
            return {
                backgroundColor: alpha(theme.palette.text.primary, 0.10),
                '&:hover': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.15),
                },
                ...(reported > 0 ? {
                    borderLeft: `3px solid ${theme.palette.warning.main}`,
                } : {}),
            };
        }

        // Wszystkie godziny zaraportowane
        if (unreported <= 0) return {};

        // Intensywność koloru zależna od brakującego czasu
        const ratio = Math.min(1, Math.max(0, unreported / rcp));
        const opacity = 0.02 + ratio * 0.18;
        const color = theme.palette.error.main;

        return {
            backgroundColor: alpha(color, opacity),
            '&:hover': {
                backgroundColor: alpha(color, opacity + 0.04),
            },
        };
    };

    return (
        <Box sx={{ width: "100%", height, maxHeight: height }}>
            <MonthPicker
                value={month.currentMonth}
                onPrev={month.prev}
                onNext={month.next}
                disabled={entity.loading}
            />
            <Grid container spacing={1} sx={{ height: tableHeight }}>
                <Grid size={{ xs: 12, md: selected ? 6 : 12 }} sx={{ minWidth: 0 }}>
                    <PowerTable
                        entityName={entityName}
                        height={tableHeight}
                        data={entity.rows.map(r => ({ ...r, id: r.date }))}
                        loading={entity.loading}
                        onRefresh={entity.refresh}
                        columnSchema={entity.schema.columns}
                        selected={selected}
                        onSelect={handleSelect}
                        getRowStyles={getRowStyles}
                    />
                </Grid>

                {selected && (
                    <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                        <EmployeeWorkReportDayDetails
                            id={id}
                            day={selected}
                            height={tableHeight}
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default EmployeeWorkReport;
