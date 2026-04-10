import {buildDateTimeFromTimeValue, toStringOrNull, toIntOrNull, toBool01, toNumberOrNull } from "../utils";

export function outputLogDto({
    task,
    employee,
    process,
    workDate = null,
    structureId,
    periodId,
    productionTaskId = null,
    isRepair = false,

    source = null,
    defectCategory = null,
    defectReason = null,

    outputQty = null,
    defectQty = null,
    goodQty = null,
    wasteQty = null,
    unit = null,

    remarks = null,
    attrs = null,
}) {
    return {
        task: toStringOrNull(task?.jiraKey),
        issue_id: toIntOrNull(task?.id),
        production_task_id: toIntOrNull(productionTaskId),

        process_id: toIntOrNull(process?.id),
        is_repair: toBool01(isRepair),

        source: toStringOrNull(source),
        defect_category: toStringOrNull(defectCategory),
        defect_reason: toStringOrNull(defectReason),

        output_qty: toNumberOrNull(outputQty) ?? 0,
        defect_qty: toNumberOrNull(defectQty) ?? 0,
        good_qty: toNumberOrNull(goodQty) ?? 0,
        waste_qty: toNumberOrNull(wasteQty),
        unit: toStringOrNull(unit),

        work_date: toStringOrNull(workDate),
        employee_id: toIntOrNull(employee?.id),
        structure_id: toIntOrNull(structureId),
        period_id: toIntOrNull(periodId),

        remarks: toStringOrNull(remarks),
        attrs: attrs ? JSON.stringify(attrs) : null,
    };
}