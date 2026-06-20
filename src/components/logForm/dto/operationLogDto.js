import {buildDateTimeFromTimeValue, toStringOrNull, toIntOrNull, toBool01, toNumberOrNull } from "../utils";

export function operationLogDto({
    task,
    employee,
    process,
    time,
    structureId,
    periodId,
    productionTaskId = null,
    remarks = null,
    isRepair = false,
    qty = null,
}) {
    const timeFields = buildDateTimeFromTimeValue(time);

    return {
        work_date: timeFields.work_date,
        task: toStringOrNull(task?.jiraKey),
        employee_id: toIntOrNull(employee?.id),
        process_id: toIntOrNull(process?.id),
        structure_id: toIntOrNull(structureId),
        qty: toNumberOrNull(qty) ?? 0,
        duration_decimal: timeFields.duration_decimal ?? 0,
        start_time: timeFields.start_time,
        end_time: timeFields.end_time,
        is_repair: toBool01(isRepair),
        remarks: toStringOrNull(remarks),
               
        production_task_id: toIntOrNull(productionTaskId),
        issue_id: toIntOrNull(task?.id),
        
    };
}
