import { z } from "zod";

const dbBoolean = z.preprocess((value) => {
    if (value === 1 || value === "1" || value === true) return true;
    if (value === 0 || value === "0" || value === false) return false;

    return value;
}, z.boolean());

const nullableString = z.string().nullable().optional();

export const ProcessSchema = z.object({
    id: z.coerce.number().int().positive(),

    name: z.string().min(1),
    description: nullableString,

    structure_id: z.coerce.number().int().positive(),
    resource_id: z.coerce.number().int().positive().nullable().optional(),

    category: nullableString,

    is_production: dbBoolean.default(false),
    is_general: dbBoolean.default(false),
    is_design: dbBoolean.default(false),
    is_setup: dbBoolean.default(false),
    is_task: dbBoolean.default(true),

    process_product_name: z.string().default(""),

    requires_quantity: dbBoolean.default(false),
    requires_remarks: dbBoolean.default(false),
    requires_material: dbBoolean.default(false),

    is_outsource: dbBoolean.default(false),
    is_correctable: dbBoolean.default(false),

    min_persons: z.coerce.number().int().min(0).default(1),
    max_persons: z.coerce.number().int().min(0).default(1),

    external_id: nullableString,
    attrs: z.unknown().nullable().optional(),

    is_active: dbBoolean.default(true),
    is_active_date: nullableString,

    created_at: nullableString,
    created_by: z.coerce.number().int().nullable().optional(),

    updated_at: nullableString,
    updated_by: z.coerce.number().int().nullable().optional(),

    structureName: nullableString,

    // Pole nie występuje w pokazanej odpowiedzi,
    // więc pozostaje wartością wyliczaną/domyslną.
    process_class: z.string().default("production"),
});

export const ProductionTaskSchema = z.object({
    id: z.number().int().positive(),
    issue_id: z.number().int().positive(),

    process_id: z.number().int().positive(),
    name: z.string().min(1),

    task_type: z.string().default("production"),
    status: z.string().default("draft"),

    output_label: z.string().nullable().default(null),
    output_unit: z.string().nullable().default(null),

    target_qty: z.number().nullable().default(null),
    sequence_no: z.number().int().default(1),

    created_at: z.string(),
    updated_at: z.string(),

    is_deleted: z.boolean().default(false),
});

export const ProductionTaskRelationSchema = z.object({
    id: z.number().int().positive(),
    issue_id: z.number().int().positive(),

    from_task_id: z.number().int().positive(),
    to_task_id: z.number().int().positive(),

    relation_type: z.string().default("flow"),
    is_required: z.boolean().default(true),
    is_active: z.boolean().default(true),

    created_at: z.string(),
    updated_at: z.string(),

    is_deleted: z.boolean().default(false),
});

export const ProductionTaskLayoutSchema = z.object({
    id: z.number().int().positive(),
    issue_id: z.number().int().positive(),
    task_id: z.number().int().positive(),

    position_x: z.number(),
    position_y: z.number(),

    node_type: z.string().default("productionTask"),
    is_hidden: z.boolean().default(false),
    is_locked: z.boolean().default(false),

    created_at: z.string(),
    updated_at: z.string(),

    is_deleted: z.boolean().default(false),
});