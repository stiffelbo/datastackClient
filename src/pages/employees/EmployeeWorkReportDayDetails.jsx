import React from "react";

import useEntity from '../../hooks/useEntity';
import PowerTable from "../../components/powerTable/powerTable";

const EmployeeWorkReportDayDetails = ({ id = null, day = null, height = 400 }) => {
    if(!day || !id) return null;

    const entityName = "EmployeeWorkReportDayDetails";
    
    const entity = useEntity({entityName: entityName, endpoint : '/reports_worklog/', schemaQuery: {daydetails : true}, query: {employeeId: id, daydetails: day}});
    return (
        <PowerTable 
            entityName={entityName}
            height={height}
            data={entity.rows.map(r => ({...r, id: r.date}))}
            loading={entity.loading}
            onRefresh={entity.refresh}
            columnSchema={entity.schema.columns}
        />);
}

export default EmployeeWorkReportDayDetails;