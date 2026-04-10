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
        task: toStringOrNull(task?.jiraKey),
        issue_id: toIntOrNull(task?.id),
        production_task_id: toIntOrNull(productionTaskId),

        process_id: toIntOrNull(process?.id),
        remarks: toStringOrNull(remarks),
        is_repair: toBool01(isRepair),
        qty: toNumberOrNull(qty) ?? 0,

        work_date: timeFields.work_date,
        start_time: timeFields.start_time,
        end_time: timeFields.end_time,
        duration_decimal: timeFields.duration_decimal ?? 0,

        period_id: toIntOrNull(periodId),
        employee_id: toIntOrNull(employee?.id),
        structure_id: toIntOrNull(structureId),
    };
}
