import React, {useEffect, useState} from "react";

import { Box, Grid, LinearProgress } from "@mui/material";

import useEntity from '../../hooks/useEntity';
import { useMonths } from "../../hooks/useMonths";
import http from '../../http';

import PowerTable from "../../components/powerTable/powerTable";
import ApiLoader from '../../components/ApiLoader';
import MonthPicker from "../../components/MonthPicker";

const EmployeeWorkReport = ({ id = null, rwd, heightSpan = 188 }) => {
    const entityName = "EmployeeWorkReport";
    const month = useMonths();

    console.log(id);
    
    const entity = useEntity({endpoint : '/reports_worklog/', query: {employeeId: id, dateFrom: month.startDate, dateTo: month.endDate}});

    //Geometria
    const height = rwd.height - heightSpan;
    const tableHeight = height - 26;

    return <Box sx={{width: '100%', height, maxHeight: height}}>
        {entity.loading ? <LinearProgress /> : <MonthPicker value={month.currentMonth} onPrev={month.prev} onNext={month.next}/>}
        <PowerTable 
            entityName={entityName}
            height={tableHeight}
            data={entity.rows}
            loading={entity.loading}
            onRefresh={entity.refresh}
            columnSchema={entity.schema.columns}
        />
    </Box>
}

export default EmployeeWorkReport;