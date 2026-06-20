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
}) {
    return {
        work_date: toStringOrNull(workDate),
        task: toStringOrNull(task?.jiraKey ?? task?.key ?? task?.task),
       
        employee_id: toIntOrNull(employee?.id),
        process_id: toIntOrNull(process?.id),
        structure_id: toIntOrNull(structureId),

        qty: toNumberOrNull(qty) ?? 0,
        movement_type: toStringOrNull(movementType) ?? "produce_good",
        remarks: toStringOrNull(remarks),


        issue_id: toIntOrNull(task?.id ?? task?.issue_id),
        production_task_id: toIntOrNull(productionTaskId),
        from_production_task_id: toIntOrNull(fromProductionTaskId),
    };
}