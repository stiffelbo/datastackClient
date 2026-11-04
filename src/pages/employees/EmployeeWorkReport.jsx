
import React, { useEffect, useState } from "react";

import { Box, Grid } from "@mui/material";

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
