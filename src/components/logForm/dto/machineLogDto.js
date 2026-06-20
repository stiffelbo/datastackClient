import {buildDateTimeFromTimeValue, toStringOrNull, toIntOrNull, toBool01, toNumberOrNull } from "../utils";

export function machineLogDto({
    task,
    employee,
    process,
    machine,
    time,
    structureId,
    periodId,
    productionTaskId = null,
    usageKind = null,
    isSetup = false,
    isRepair = false,
    remarks = null,
}) {
    const timeFields = buildDateTimeFromTimeValue(time);

    return {
        work_date: timeFields.work_date,
        task: toStringOrNull(task?.jiraKey),
        employee_id: toIntOrNull(employee?.id),
        process_id: toIntOrNull(process?.id),
        structure_id: toIntOrNull(structureId),
        machine_id: toIntOrNull(machine?.id),
        duration_decimal: timeFields.duration_decimal ?? 0,
        start_time: timeFields.start_time,
        end_time: timeFields.end_time,
        usage_kind: toStringOrNull(usageKind),
        is_setup: toBool01(isSetup),
        is_repair: toBool01(isRepair),
        remarks: toStringOrNull(remarks),
               
        production_task_id: toIntOrNull(productionTaskId),
        issue_id: toIntOrNull(task?.id),
        
    };
}
