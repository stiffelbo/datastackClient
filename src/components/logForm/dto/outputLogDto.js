import {
    toStringOrNull,
    toIntOrNull,
    toNumberOrNull,
} from "../utils";

export function outputLogDto({
    task,
    employee,
    process,

    workDate = null,
    structureId = null,
    periodId = null,

    productionTaskId = null,
    fromProductionTaskId = null,

    movementType = "produce_good",
    qty = null,

    remarks = null,
    attrs = null,
}) {
    return {
        task: toStringOrNull(task?.jiraKey ?? task?.key ?? task?.task),
        issue_id: toIntOrNull(task?.id ?? task?.issue_id),
        production_task_id: toIntOrNull(productionTaskId),
        from_production_task_id: toIntOrNull(fromProductionTaskId),
        process_id: toIntOrNull(process?.id),

        movement_type: toStringOrNull(movementType) ?? "produce_good",
        qty: toNumberOrNull(qty) ?? 0,

        work_date: toStringOrNull(workDate),
        employee_id: toIntOrNull(employee?.id),
        structure_id: toIntOrNull(structureId),
        period_id: toIntOrNull(periodId),

        remarks: toStringOrNull(remarks),
        attrs: attrs ? JSON.stringify(attrs) : null,
    };
}