import {buildDateTimeFromTimeValue, toStringOrNull, toIntOrNull, toBool01, toNumberOrNull } from "../utils";

export function materialLogDto({
    task,
    employee,
    process,
    material,
    workDate = null,
    structureId,
    periodId,
    productionTaskId = null,
    isRepair = false,

    isPlan = false,
    isActive = true,
    source = null,

    isPrimaryMaterial = true,
    isWaste = false,

    qty = null,
    unit = null,
    wasteQty = null,
    goodQty = null,

    unitCost = null,
    costAmount = null,
    remarks = null,
    attrs = null,
}) {
    return {
        task: toStringOrNull(task?.jiraKey),
        issue_id: toIntOrNull(task?.id),
        production_task_id: toIntOrNull(productionTaskId),

        process_id: toIntOrNull(process?.id),
        is_repair: toBool01(isRepair),

        is_plan: toBool01(isPlan),
        is_active: toBool01(isActive),
        source: toStringOrNull(source),

        material_id: toIntOrNull(material?.id),
        material_code: toStringOrNull(material?.code),
        material_name: toStringOrNull(material?.name),
        material_category: toStringOrNull(material?.category),

        is_primary_material: toBool01(isPrimaryMaterial),
        is_waste: toBool01(isWaste),

        qty: toNumberOrNull(qty) ?? 0,
        unit: toStringOrNull(unit ?? material?.unit),
        waste_qty: toNumberOrNull(wasteQty),
        good_qty: toNumberOrNull(goodQty),

        unit_cost: toNumberOrNull(unitCost),
        cost_amount: toNumberOrNull(costAmount),

        work_date: toStringOrNull(workDate),
        employee_id: toIntOrNull(employee?.id),
        structure_id: toIntOrNull(structureId),
        period_id: toIntOrNull(periodId),

        remarks: toStringOrNull(remarks),
        attrs: attrs ? JSON.stringify(attrs) : null,
    };
}