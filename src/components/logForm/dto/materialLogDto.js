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
        work_date: toStringOrNull(workDate),
        task: toStringOrNull(task?.jiraKey ?? task?.key ?? task?.task),
        employee_id: toIntOrNull(employee.id),
        resource_id: toIntOrNull(material?.id ?? material?.resource_id),
        process_id: toIntOrNull(process?.id),
        structure_id: toIntOrNull(structureId),
        qty: toNumberOrNull(qty) ?? 0,
        movement_type: toStringOrNull(movementType) ?? "consume_good",
        is_repair: toBool01(isRepair),
        remarks: toStringOrNull(remarks),        
        is_active: toBool01(isActive),
        is_plan: toBool01(isPlan),
        issue_id: toIntOrNull(task?.id ?? task?.issue_id),
        production_task_id: toIntOrNull(productionTaskId),
        from_production_task_id: toIntOrNull(fromProductionTaskId),
    };
}