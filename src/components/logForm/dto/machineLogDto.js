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
        task: toStringOrNull(task?.jiraKey),
        issue_id: toIntOrNull(task?.id),
        production_task_id: toIntOrNull(productionTaskId),

        machine_id: toIntOrNull(machine?.id),
        process_id: toIntOrNull(process?.id),
        usage_kind: toStringOrNull(usageKind),
        is_setup: toBool01(isSetup),
        is_repair: toBool01(isRepair),
        remarks: toStringOrNull(remarks),

        work_date: timeFields.work_date,
        start_time: timeFields.start_time,
        end_time: timeFields.end_time,
        duration_decimal: timeFields.duration_decimal ?? 0,

        employee_id: toIntOrNull(employee?.id),
        structure_id: toIntOrNull(structureId),
    };
}
