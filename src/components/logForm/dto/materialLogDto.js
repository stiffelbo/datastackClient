import {
    toStringOrNull,
    toIntOrNull,
    toBool01,
    toNumberOrNull,
} from "../utils";

export function materialLogDto({
    task,
    process,
    material,

    workDate = null,
    structureId = null,
    employee= null,

    productionTaskId = null,
    fromProductionTaskId = null,

    isRepair = false,
    isPlan = false,
    isActive = true,

    movementType = "consume_good",
    qty = null,

    remarks = null
}) {
    return {
        task: toStringOrNull(task?.jiraKey ?? task?.key ?? task?.task),
        issue_id: toIntOrNull(task?.id ?? task?.issue_id),
        production_task_id: toIntOrNull(productionTaskId),

        process_id: toIntOrNull(process?.id),

        is_repair: toBool01(isRepair),
        is_plan: toBool01(isPlan),
        is_active: toBool01(isActive),

        resource_id: toIntOrNull(material?.id ?? material?.resource_id),
        from_production_task_id: toIntOrNull(fromProductionTaskId),

        movement_type: toStringOrNull(movementType) ?? "consume_good",
        qty: toNumberOrNull(qty) ?? 0,

        work_date: toStringOrNull(workDate),
        structure_id: toIntOrNull(structureId),

        employee_id: toIntOrNull(employee.id),

        remarks: toStringOrNull(remarks),
    };
}