const opLogSchema = [
    {
        "field": "work_date",
        "headerName": "Data",
        "type": "date",
        "width": 160,
        "hidden": false,
        "align": "left",
        "order": 0
    },
    {
        "field": "task",
        "headerName": "Task",
        "type": "date",
        "width": 110,
        "hidden": false,
        "align": "left",
        "order": 1
    },
    {
        "field": "employee_id",
        "headerName": "Pracownik",
        "type": "fk",
        "width": 130,
        "hidden": false,
        "align": "right",
        "order": 2
    },
    {
        "field": "process_id",
        "headerName": "Process / Czynność",
        "type": "fk",
        "width": 140,
        "hidden": false,
        "align": "right",
        "order": 3
    },
    {
        "field": "structure_id",
        "headerName": "Dział",
        "type": "fk",
        "width": 140,
        "hidden": false,
        "align": "right",
        "order": 4
    },
    {
        "field": "qty",
        "headerName": "Ilość",
        "type": "number",
        "width": 80,
        "hidden": false,
        "align": "right",
        "aggregation": "sum",
        "order": 5
    },
    {
        "field": "duration_decimal",
        "headerName": "Czas h",
        "type": "number",
        "width": 80,
        "hidden": false,
        "align": "right",
        "aggregation": "sum",
        "order": 6
    },
    {
        "field": "start_time",
        "headerName": "Start",
        "type": "date",
        "width": 140,
        "hidden": false,
        "align": "left",
        "order": 7
    },
    {
        "field": "end_time",
        "headerName": "Koniec",
        "type": "date",
        "width": 140,
        "hidden": false,
        "align": "left",
        "order": 8
    },
    {
        "field": "is_repair",
        "headerName": "Poprawka",
        "type": "bool",
        "width": 80,
        "hidden": false,
        "align": "right",
        "order": 9
    },
    {
        "field": "remarks",
        "headerName": "Uwagi",
        "type": "string",
        "width": 260,
        "hidden": false,
        "align": "left",
        "order": 10
    },
    {
        "field": "issue_id",
        "headerName": "Issue Id",
        "hidden": true,
        "order": 11
    },
    {
        "field": "production_task_id",
        "headerName": "Issue Id",
        "hidden": true,
        "order": 12
    }
];

const machineLogSchema = [
    {
        "field": "work_date",
        "headerName": "Data",
        "type": "date",
        "width": 160,
        "hidden": false,
        "align": "left",
        "order": 0
    },
    {
        "field": "task",
        "headerName": "Task",
        "type": "date",
        "width": 110,
        "hidden": false,
        "align": "left",
        "order": 1
    },
    {
        "field": "employee_id",
        "headerName": "Pracownik",
        "type": "fk",
        "width": 130,
        "hidden": false,
        "align": "right",
        "order": 2
    },
    {
        "field": "machine_id",
        "headerName": "Maszyna",
        "type": "fk",
        "width": 80,
        "hidden": false,
        "align": "right",
        "order": 3
    },
    {
        "field": "process_id",
        "headerName": "Process / Czynność",
        "type": "fk",
        "width": 140,
        "hidden": false,
        "align": "right",
        "order": 4
    },
    {
        "field": "structure_id",
        "headerName": "Dział",
        "type": "fk",
        "width": 140,
        "hidden": false,
        "align": "right",
        "order": 5
    },

    {
        "field": "duration_decimal",
        "headerName": "Czas h",
        "type": "number",
        "width": 80,
        "hidden": false,
        "align": "right",
        "aggregation": 'sum',
        "order": 6
    },
    {
        "field": "start_time",
        "headerName": "Start",
        "type": "date",
        "width": 140,
        "hidden": false,
        "align": "left",
        "order": 7
    },
    {
        "field": "end_time",
        "headerName": "Koniec",
        "type": "date",
        "width": 140,
        "hidden": false,
        "align": "left",
        "order": 8
    },
    {
        "field": "usage_kind",
        "headerName": "Rodzaj użycia",
        "type": "string",
        "width": 80,
        "hidden": false,
        "align": "right",
        "order": 9
    },
    {
        "field": "is_setup",
        "headerName": "Przezbrojenie",
        "type": "bool",
        "width": 80,
        "hidden": false,
        "align": "right",
        "order": 9
    },
    {
        "field": "is_repair",
        "headerName": "Poprawka",
        "type": "bool",
        "width": 80,
        "hidden": false,
        "align": "right",
        "order": 9
    },
    {
        "field": "remarks",
        "headerName": "Uwagi",
        "type": "string",
        "width": 260,
        "hidden": false,
        "align": "left",
        "order": 10
    },
    {
        "field": "issue_id",
        "headerName": "Issue Id",
        "hidden": true,
        "order": 11
    },
    {
        "field": "production_task_id",
        "headerName": "Issue Id",
        "hidden": true,
        "order": 12
    }
];

const materialLogSchema = [
    {
        "field": "work_date",
        "headerName": "Data",
        "type": "date",
        "width": 160,
        "hidden": false,
        "align": "left",
        "order": 0
    },
    {
        "field": "task",
        "headerName": "Task",
        "type": "date",
        "width": 110,
        "hidden": false,
        "align": "left",
        "order": 1
    },
    {
        "field": "employee_id",
        "headerName": "Pracownik",
        "type": "fk",
        "width": 130,
        "hidden": false,
        "align": "right",
        "order": 2
    },
    {
        "field": "resource_id",
        "headerName": "Zasób",
        "type": "fk",
        "width": 140,
        "hidden": false,
        "align": "right",
        "order": 3
    },
    {
        "field": "process_id",
        "headerName": "Process / Czynność",
        "type": "fk",
        "width": 140,
        "hidden": false,
        "align": "right",
        "order": 4
    },
    {
        "field": "structure_id",
        "headerName": "Dział",
        "type": "fk",
        "width": 140,
        "hidden": false,
        "align": "right",
        "order": 5
    },

    {
        "field": "qty",
        "headerName": "Ilość",
        "type": "number",
        "width": 80,
        "hidden": false,
        "align": "right",
        "aggregation": "sum",
        "order": 6
    },

    {
        "field": "movement_type",
        "headerName": "Rodzaj użycia",
        "type": "string",
        "width": 80,
        "hidden": false,
        "align": "right",
        "order": 9
    },
    {
        "field": "is_repair",
        "headerName": "Poprawka",
        "type": "bool",
        "width": 80,
        "hidden": false,
        "align": "right",
        "order": 9
    },
    {
        "field": "remarks",
        "headerName": "Uwagi",
        "type": "string",
        "width": 260,
        "hidden": false,
        "align": "left",
        "order": 10
    },
    {
        "field": "issue_id",
        "headerName": "Issue Id",
        "hidden": true,
        "order": 11
    },
    {
        "field": "production_task_id",
        "headerName": "Issue Id",
        "hidden": true,
        "order": 12
    },
    {
        "field": "is_plan",
        "hidden": true,
        "order": 13
    },
    {
        "field": "is_active",
        "hidden": true,
        "order": 14
    },
];

const outputLogSchema = [
    {
        "field": "work_date",
        "headerName": "Data",
        "type": "date",
        "width": 160,
        "hidden": false,
        "align": "left",
        "order": 0
    },
    {
        "field": "task",
        "headerName": "Task",
        "type": "date",
        "width": 110,
        "hidden": false,
        "align": "left",
        "order": 1
    },
    {
        "field": "employee_id",
        "headerName": "Pracownik",
        "type": "fk",
        "width": 130,
        "hidden": false,
        "align": "right",
        "order": 2
    },
    {
        "field": "process_id",
        "headerName": "Process / Czynność",
        "type": "fk",
        "width": 140,
        "hidden": false,
        "align": "right",
        "order": 4
    },
    {
        "field": "structure_id",
        "headerName": "Dział",
        "type": "fk",
        "width": 140,
        "hidden": false,
        "align": "right",
        "order": 5
    },

    {
        "field": "qty",
        "headerName": "Ilość",
        "type": "number",
        "width": 80,
        "hidden": false,
        "align": "right",
        "aggregation": "sum",
        "order": 6
    },

    {
        "field": "movement_type",
        "headerName": "Rodzaj użycia",
        "type": "string",
        "width": 80,
        "hidden": false,
        "align": "right",
        "order": 9
    },
    {
        "field": "remarks",
        "headerName": "Uwagi",
        "type": "string",
        "width": 260,
        "hidden": false,
        "align": "left",
        "order": 10
    },
    {
        "field": "issue_id",
        "hidden": true,
        "order": 11
    },
    {
        "field": "production_task_id",
        "hidden": true,
        "order": 12
    },
    {
        "field": "from_production_task_id",
        "hidden": true,
        "order": 12
    },
];

export const makeControlTablesSchemas = ({
    employees,
    selectedProcess,
    structures
}) => {

    if (!selectedProcess) return null;

    const makeOptionsMap = (options = []) =>
        Object.fromEntries(options.map(option => [option.value, option]));

    const normalizeOptions = (items = [], getValue, getLabel) => {
        const options = Array.isArray(items)
            ? items
                .map(item => ({
                    value: getValue(item),
                    label: getLabel(item)
                }))
                .filter(option => option.value !== null && option.value !== undefined)
            : [];

        return {
            options,
            optionsMap: makeOptionsMap(options)
        };
    };

    const details = selectedProcess.details ?? selectedProcess;

    const fkSources = {
        employee_id: normalizeOptions(
            employees,
            e => e.id,
            e => e.fullName ?? e.name ?? `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim()
        ),

        process_id: normalizeOptions(
            [selectedProcess],
            p => p.id,
            p => p.name ?? p.processName ?? p.label
        ),

        machine_id: normalizeOptions(
            details.machines,
            m => m.id ?? m.machine_id,
            m => m.name ?? m.machineName ?? m.label
        ),

        resource_id: normalizeOptions(
            details.materials,
            r => r.id ?? r.resource_id ?? r.material_id,
            r => r.name ?? r.materialName ?? r.resourceName ?? r.label
        ),

        structure_id: normalizeOptions(structures, r => r.id, r => r.label)

    };

    const fillSchemaOptions = (schema = []) =>
        schema
            .map(column => {
                if (column.type !== 'fk') return column;

                const source = fkSources[column.field] ?? {
                    options: [],
                    optionsMap: {}
                };

                return {
                    ...column,
                    options: source.options,
                    optionsMap: source.optionsMap
                };
            })
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    return {
        operationLog: fillSchemaOptions(opLogSchema),
        outputLog: fillSchemaOptions(outputLogSchema),
        machineLog: fillSchemaOptions(machineLogSchema),
        materialLog: fillSchemaOptions(materialLogSchema)
    };

};