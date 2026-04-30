const version = {
    nr: 1,
    descriprion: [
        'First transformation of existing databes structure to lean spec',
    ],
}

const entitySpec = {
    key: 'string',          // technical name, e.g. processes
    name: 'string',         // English name, e.g. Processes
    label: 'string',        // UI label, e.g. Procesy
    dimension: 'string',    // Definition | Transaction | Log | Config

    content: [
        'string'              // domain meaning and extraction rules
    ],

    relations: {
        relationName: {
            entity: 'string',
            type: 'string',     // manyToOne | oneToMany | manyToMany
            field: 'string',    // FK field if exists
            required: 'boolean',
            content: [
                'string'
            ],

            params: {
                paramName: {
                    type: 'string',
                    content: [
                        'string'
                    ]
                }
            }
        }
    },

    fields: [
        {
            name: 'string',
            type: 'string',     // id | string | text | number | boolean | json | fk
            required: 'boolean',
            content: [
                'string'
            ]
        }
    ],

    rules: [
        {
            name: 'string',
            content: [
                'string'
            ]
        }
    ]
}

const entities = {
    processes: {
        key: 'processes',
        name: 'Processes',
        label: 'Procesy',
        dimension: 'Definition',

        content: [
            'Definition of production or administration activity that can be instantiated within a given order as ProductionTask.',
            'Process is an operation definition, not only an activity. It may combine activity, purpose, machine, material, output, department and execution character.',
            'Create a new process when existing definition does not match activity, purpose, machine, output, execution character or department.'
        ],

        relations: {
            structure: {
                entity: 'structures',
                type: 'manyToOne',
                field: 'structure_id',
                required: true,
                content: [
                    'Owning department or organizational unit responsible for this process.'
                ]
            },

            resource: {
                entity: 'resources',
                type: 'manyToOne',
                field: 'resource_id',
                required: false,
                content: [
                    'Cost or resource element assigned to this process.'
                ]
            },

            machines: {
                entity: 'machines',
                type: 'manyToMany',
                field: null,
                required: false,
                content: [
                    'Machines that can execute this process.'
                ],
                params: {
                    is_required: {
                        type: 'boolean',
                        content: [
                            'Machine is required when instantiated task based on this process is executed.'
                        ]
                    }
                }
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary process identifier.']
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                content: ['Human-readable process name.']
            },
            {
                name: 'is_task',
                type: 'boolean',
                required: true,
                content: ['Defines whether this process can be instantiated as ProductionTask.']
            },
            {
                name: 'requires_quantity',
                type: 'boolean',
                required: true,
                content: ['Defines whether quantity must be reported during worklog.']
            },
            {
                name: 'requires_remarks',
                type: 'boolean',
                required: true,
                content: ['Defines whether remarks must be provided during worklog.']
            },
            {
                name: 'is_outsource',
                type: 'boolean',
                required: true,
                content: ['Defines whether execution is outsourced.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether process is available for use.']
            }
        ],

        rules: [
            {
                name: 'unique_process_per_structure',
                content: [
                    'Process name should be unique within owning structure.'
                ]
            },
            {
                name: 'active_task_instantiation',
                content: [
                    'Only active processes marked as is_task can be instantiated as ProductionTask.'
                ]
            }
        ]
    },
    machines: {
        key: 'machines',
        name: 'Machines',
        label: 'Maszyny',
        dimension: 'Definition',

        content: [
            'Register of machines and devices used to execute production, setup, maintenance or support processes.',
            'Machine is a physical or technical resource that can be assigned to processes and instantiated work.',
            'Create a new machine when equipment differs by technical identity, location, operational status, usage cost or required permissions.'
        ],

        relations: {
            structure: {
                entity: 'structures',
                type: 'manyToOne',
                field: 'structure_id',
                required: true,
                content: [
                    'Owning department or organizational unit responsible for this machine.'
                ]
            },

            location: {
                entity: 'locations',
                type: 'manyToOne',
                field: 'location_id',
                required: false,
                content: [
                    'Physical location where the machine is installed or usually stored.'
                ]
            },

            processes: {
                entity: 'processes',
                type: 'manyToMany',
                field: null,
                required: false,
                content: [
                    'Processes that can be executed using this machine.'
                ],
                params: {
                    is_required: {
                        type: 'boolean',
                        content: [
                            'Defines whether this machine is mandatory for executing the related process.'
                        ]
                    }
                }
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary machine identifier.']
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                content: ['Human-readable machine or device name.']
            },
            {
                name: 'brand',
                type: 'string',
                required: false,
                content: ['Machine manufacturer or brand.']
            },
            {
                name: 'model',
                type: 'string',
                required: false,
                content: ['Machine model.']
            },
            {
                name: 'serial_number',
                type: 'string',
                required: false,
                content: ['Unique manufacturer serial number.']
            },
            {
                name: 'inventory_number',
                type: 'string',
                required: false,
                content: ['Internal asset or inventory number.']
            },
            {
                name: 'machine_type',
                type: 'string',
                required: false,
                content: ['Technical machine type, for example CNC, printer, server or cutter.']
            },
            {
                name: 'category',
                type: 'string',
                required: false,
                content: ['Business category of machine usage, for example production, packing or printing.']
            },
            {
                name: 'power_supply',
                type: 'string',
                required: false,
                content: ['Power source or supply type, for example 230V, 400V, battery or manual.']
            },
            {
                name: 'is_stationary',
                type: 'boolean',
                required: true,
                content: ['Defines whether machine is stationary or mobile.']
            },
            {
                name: 'requires_license',
                type: 'boolean',
                required: true,
                content: ['Defines whether operator needs license, permissions or certification.']
            },
            {
                name: 'description',
                type: 'text',
                required: false,
                content: ['Additional machine description.']
            },
            {
                name: 'unit_usage_cost',
                type: 'number',
                required: false,
                content: ['Unit cost of machine usage, for example cost per hour, piece or cycle.']
            },
            {
                name: 'usage_unit',
                type: 'string',
                required: false,
                content: ['Unit used for calculating machine usage cost, for example h, pcs or cycle.']
            },
            {
                name: 'last_maintenance_date',
                type: 'date',
                required: false,
                content: ['Date of last maintenance or technical inspection.']
            },
            {
                name: 'maintenance_span_months',
                type: 'number',
                required: false,
                content: ['Maintenance interval in months.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether machine is available in the system.']
            },
            {
                name: 'is_operational',
                type: 'boolean',
                required: true,
                content: ['Defines whether machine is technically operational and can be used.']
            }
        ],

        rules: [
            {
                name: 'unique_machine_serial_number',
                content: [
                    'Serial number should be unique when provided.'
                ]
            },
            {
                name: 'unique_machine_inventory_number',
                content: [
                    'Inventory number should be unique when provided.'
                ]
            },
            {
                name: 'machine_can_be_used',
                content: [
                    'Machine can be assigned to executable work only when is_active and is_operational are true.'
                ]
            },
            {
                name: 'licensed_machine_operator',
                content: [
                    'If machine requires license, assigned operator must have required permission before work can be started.'
                ]
            },
            {
                name: 'maintenance_due',
                content: [
                    'Machine should be marked or warned when maintenance interval is exceeded.'
                ]
            }
        ]
    },
    resources: {
        key: 'resources',
        name: 'Resources',
        label: 'Zasoby',
        dimension: 'Definition',

        content: [
            'Dictionary of production, service and auxiliary resources used in costing, purchasing, stock and process definitions.',
            'Resource may represent material, service, combined resource or production process reference.',
            'Create a new resource when code, unit, costing logic, stock behavior or material/service character is different.'
        ],

        relations: {
            processes: {
                entity: 'processes',
                type: 'oneToMany',
                field: 'resource_id',
                required: false,
                content: [
                    'Processes may use resource as their cost or resource element.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary resource identifier.']
            },
            {
                name: 'code',
                type: 'string',
                required: true,
                content: ['Unique resource code or external SKU, for example Optima code.']
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                content: ['Human-readable resource name.']
            },
            {
                name: 'description',
                type: 'text',
                required: false,
                content: ['Additional resource description.']
            },
            {
                name: 'category',
                type: 'string',
                required: false,
                content: ['Resource category, for example paper, paint, foil, service or packaging.']
            },
            {
                name: 'unit',
                type: 'string',
                required: true,
                content: ['Base unit of resource, for example pcs, kg, m2 or lm.']
            },
            {
                name: 'unit_step',
                type: 'number',
                required: true,
                content: ['Measurement, ordering or consumption step for this resource.']
            },
            {
                name: 'weight_per_unit_g',
                type: 'number',
                required: false,
                content: ['Resource weight per base unit in grams.']
            },
            {
                name: 'is_service',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource represents a service.']
            },
            {
                name: 'is_material',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource represents a material or stock-consumable item.']
            },
            {
                name: 'is_combined',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource is composed from other resources.']
            },
            {
                name: 'is_production_process',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource represents a production process reference for mapping with processes.']
            },
            {
                name: 'is_stock_item',
                type: 'boolean',
                required: true,
                content: ['Defines whether stock quantity is tracked for this resource.']
            },
            {
                name: 'is_direct_purchase',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource can be purchased directly.']
            },
            {
                name: 'standard_unit_cost',
                type: 'number',
                required: false,
                content: ['Standard unit cost of resource in PLN per base unit.']
            },
            {
                name: 'margin',
                type: 'string',
                required: true,
                content: ['Margin group from 1 to 10 used for costing and pivot grouping.']
            },
            {
                name: 'attrs',
                type: 'json',
                required: false,
                content: ['Additional resource attributes, for example color, grammage, format or technical parameters.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource is available for use.']
            }
        ],

        rules: [
            {
                name: 'unique_resource_code',
                content: [
                    'Resource code must be unique.'
                ]
            },
            {
                name: 'resource_can_be_used',
                content: [
                    'Only active resources can be selected for new process, costing, stock or purchase operations.'
                ]
            },
            {
                name: 'unit_step_positive',
                content: [
                    'Unit step must be greater than zero.'
                ]
            },
            {
                name: 'resource_character',
                content: [
                    'Resource character should be defined by service, material, combined or production process flags.'
                ]
            },
            {
                name: 'stock_tracking',
                content: [
                    'Only resources marked as stock items should affect stock quantity.'
                ]
            }
        ]
    },
    resourcesRelations: {
        key: 'resources_relations',
        name: 'ResourcesRelations',
        label: 'Relacje zasobów',
        dimension: 'Association',

        content: [
            'Association used to define complex resources composed from other resources.',
            'Parent resource is the complex resource, child resource is its component, substitute, alternative, packaging or service element.',
            'Use this entity to extract atomic material BOM when complex resources are used in process, task, costing or stock logic.'
        ],

        relations: {
            parentResource: {
                entity: 'resources',
                type: 'manyToOne',
                field: 'parent_resource_id',
                required: true,
                content: [
                    'Complex or parent resource being composed.'
                ]
            },

            childResource: {
                entity: 'resources',
                type: 'manyToOne',
                field: 'child_resource_id',
                required: true,
                content: [
                    'Component or child resource used inside parent resource.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary association identifier.']
            },
            {
                name: 'parent_resource_id',
                type: 'fk',
                required: true,
                content: ['Parent complex resource identifier.']
            },
            {
                name: 'child_resource_id',
                type: 'fk',
                required: true,
                content: ['Child component resource identifier.']
            },
            {
                name: 'quantity',
                type: 'number',
                required: true,
                content: ['Child resource quantity required to create one unit of parent resource.']
            },
            {
                name: 'unit',
                type: 'string',
                required: true,
                content: ['Unit of child quantity in this relation, for example pcs, kg, m2 or lm.']
            },
            {
                name: 'waste_percent',
                type: 'number',
                required: false,
                content: ['Default technological waste percent for child resource.']
            },
            {
                name: 'relation_type',
                type: 'string',
                required: true,
                content: ['Relation type: component, alternative, substitute, packaging or service.']
            },
            {
                name: 'sort_order',
                type: 'number',
                required: true,
                content: ['Display or calculation order of component inside parent resource.']
            },
            {
                name: 'is_required',
                type: 'boolean',
                required: true,
                content: ['Defines whether child resource is required to create parent resource.']
            },
            {
                name: 'description',
                type: 'text',
                required: false,
                content: ['Technological notes or description of resource relation.']
            },
            {
                name: 'attrs',
                type: 'json',
                required: false,
                content: ['Additional resource relation attributes.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether this resource relation is active.']
            }
        ],

        rules: [
            {
                name: 'unique_parent_child_type',
                content: [
                    'Each parent-child-relation type combination must be unique.'
                ]
            },
            {
                name: 'no_self_relation',
                content: [
                    'Parent resource and child resource must not be the same resource.'
                ]
            },
            {
                name: 'no_recursive_bom_cycle',
                content: [
                    'Resource relations must not create recursive BOM cycles.'
                ]
            },
            {
                name: 'active_relation_usage',
                content: [
                    'Only active relations should be used when exploding complex resources into atomic materials.'
                ]
            },
            {
                name: 'bom_extraction',
                content: [
                    'When complex resource is used, active component relations should be recursively expanded into atomic resources for costing, stock and production planning.'
                ]
            },
            {
                name: 'quantity_positive',
                content: [
                    'Component quantity must be greater than zero.'
                ]
            },
            {
                name: 'waste_calculation',
                content: [
                    'Required component quantity should include waste_percent when calculating material demand.'
                ]
            },
            {
                name: 'substitute_handling',
                content: [
                    'Substitute and alternative relations should not be consumed automatically unless explicitly selected or resolved by planning logic.'
                ]
            }
        ]
    },
    toolsTypes: {
        key: 'tools_types',
        name: 'ToolsTypes',
        label: 'Typy narzędzi',
        dimension: 'Definition',

        content: [
            'Catalog of tool types used in postpress, packaging, dedicated print and mint operations.',
            'Tool type defines technological classification, physical character, usage rules, lifetime, setup time and default costing.',
            'Create a new tool type when tool family, branch, production usage, material group, serial/project requirement or cost behavior is different.'
        ],

        relations: {},

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary tool type identifier.']
            },
            {
                name: 'code',
                type: 'string',
                required: true,
                content: ['Unique technical code of tool type, for example DIE_CUT, EMBOSSING or FOIL_STAMP.']
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                content: ['Human-readable tool type name.']
            },
            {
                name: 'branch',
                type: 'string',
                required: true,
                content: ['Business or technological branch, for example postpress, packaging, dedicated_print or mint.']
            },
            {
                name: 'category',
                type: 'string',
                required: false,
                content: ['Tool category, for example die-cutting, embossing, hot-stamping, numbering or personalization.']
            },
            {
                name: 'tool_family',
                type: 'string',
                required: false,
                content: ['Tool family, for example die, matrix, stamp, cliché, cylinder, plate or insert.']
            },
            {
                name: 'material_group',
                type: 'string',
                required: false,
                content: ['Typical tool material group, for example steel, brass, polymer, aluminium, magnesium, rubber or composite.']
            },
            {
                name: 'requires_machine',
                type: 'boolean',
                required: true,
                content: ['Defines whether this tool type requires machine execution.']
            },
            {
                name: 'requires_serial_no',
                type: 'boolean',
                required: true,
                content: ['Defines whether concrete tools of this type should have serial number.']
            },
            {
                name: 'requires_project_no',
                type: 'boolean',
                required: true,
                content: ['Defines whether concrete tools of this type are usually assigned to project, order or product.']
            },
            {
                name: 'is_consumable',
                type: 'boolean',
                required: true,
                content: ['Defines whether this tool type is treated as consumable.']
            },
            {
                name: 'is_physical',
                type: 'boolean',
                required: true,
                content: ['Defines whether this tool type represents a physical tool.']
            },
            {
                name: 'default_lifetime_cycles',
                type: 'number',
                required: false,
                content: ['Default expected tool lifetime measured in cycles or usages.']
            },
            {
                name: 'default_setup_time_min',
                type: 'number',
                required: false,
                content: ['Default setup or changeover time for this tool type in minutes.']
            },
            {
                name: 'default_usage_cost',
                type: 'number',
                required: false,
                content: ['Default cost of using this tool type.']
            },
            {
                name: 'usage_unit',
                type: 'string',
                required: false,
                content: ['Usage cost unit, for example pcs, cycle, order or hour.']
            },
            {
                name: 'storage_requirements',
                type: 'text',
                required: false,
                content: ['Storage requirements, for example dry storage, anti-corrosion protection or protective packaging.']
            },
            {
                name: 'description',
                type: 'text',
                required: false,
                content: ['Description of tool type and its production usage.']
            },
            {
                name: 'attrs',
                type: 'json',
                required: false,
                content: ['Additional tool type attributes.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether tool type is available for use.']
            }
        ],

        rules: [
            {
                name: 'unique_tool_type_code',
                content: [
                    'Tool type code must be unique.'
                ]
            },
            {
                name: 'unique_tool_type_name_per_branch',
                content: [
                    'Tool type name should be unique within branch.'
                ]
            },
            {
                name: 'active_tool_type_usage',
                content: [
                    'Only active tool types can be selected for new concrete tools or production configuration.'
                ]
            },
            {
                name: 'serial_number_requirement',
                content: [
                    'Concrete tool should require serial number when its tool type has requires_serial_no enabled.'
                ]
            },
            {
                name: 'project_number_requirement',
                content: [
                    'Concrete tool should require project, order or product assignment when its tool type has requires_project_no enabled.'
                ]
            }
        ]
    },
    processesMachines: {
        key: 'processes_machines',
        name: 'ProcessesMachines',
        label: 'Procesy ↔ Maszyny',
        dimension: 'Association',

        content: [
            'Association between process definitions and machines that can execute them.',
            'This relation defines whether a machine is allowed or required for a given process.',
            'Use this entity to control machine availability during ProductionTask instantiation and execution planning.'
        ],

        relations: {
            process: {
                entity: 'processes',
                type: 'manyToOne',
                field: 'process_id',
                required: true,
                content: [
                    'Process that can be executed by related machine.'
                ]
            },

            machine: {
                entity: 'machines',
                type: 'manyToOne',
                field: 'machine_id',
                required: true,
                content: [
                    'Machine allowed or required for related process.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary association identifier.']
            },
            {
                name: 'process_id',
                type: 'fk',
                required: true,
                content: ['Related process identifier.']
            },
            {
                name: 'machine_id',
                type: 'fk',
                required: true,
                content: ['Related machine identifier.']
            },
            {
                name: 'is_required',
                type: 'boolean',
                required: true,
                content: ['Defines whether machine is required for this process or only allowed.']
            },
            {
                name: 'notes',
                type: 'text',
                required: false,
                content: ['Additional notes about machine usage in this process.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether this process-machine association is active.']
            }
        ],

        rules: [
            {
                name: 'unique_process_machine',
                content: [
                    'Each process-machine pair must be unique.'
                ]
            },
            {
                name: 'active_association_usage',
                content: [
                    'Only active associations should be used when selecting machines for task execution.'
                ]
            },
            {
                name: 'required_machine_for_process',
                content: [
                    'If association is required, task based on this process should require this machine or compatible execution resource.'
                ]
            }
        ]
    },
    processesResources: {
        key: 'processes_resources',
        name: 'ProcessesResources',
        label: 'Procesy ↔ Zasoby',
        dimension: 'Association',

        content: [
            'Association between process definitions and resources used by them.',
            'This relation defines whether a resource is required or optional for a given process.',
            'Use this entity to control material, service or cost resource requirements during task planning and costing.'
        ],

        relations: {
            process: {
                entity: 'processes',
                type: 'manyToOne',
                field: 'process_id',
                required: true,
                content: [
                    'Process that uses related resource.'
                ]
            },

            resource: {
                entity: 'resources',
                type: 'manyToOne',
                field: 'resource_id',
                required: true,
                content: [
                    'Resource required or allowed for related process.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary association identifier.']
            },
            {
                name: 'process_id',
                type: 'fk',
                required: true,
                content: ['Related process identifier.']
            },
            {
                name: 'resource_id',
                type: 'fk',
                required: true,
                content: ['Related resource identifier.']
            },
            {
                name: 'is_required',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource is required for this process or only optional.']
            },
            {
                name: 'notes',
                type: 'text',
                required: false,
                content: ['Additional notes about resource usage in this process, for example variant or alternative.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether this process-resource association is active.']
            }
        ],

        rules: [
            {
                name: 'unique_process_resource',
                content: [
                    'Each process-resource pair must be unique.'
                ]
            },
            {
                name: 'active_association_usage',
                content: [
                    'Only active associations should be used when selecting resources for task planning or costing.'
                ]
            },
            {
                name: 'required_resource_for_process',
                content: [
                    'If association is required, task based on this process should require this resource or explicitly selected substitute.'
                ]
            }
        ]
    },
    machinesResources: {
        key: 'machines_resources',
        name: 'MachinesResources',
        label: 'Maszyny ↔ Zasoby',
        dimension: 'Association',

        content: [
            'Association between machines and resources compatible with them.',
            'This relation defines materials, tools, consumables, equipment, services, media or spare parts required or allowed for machine usage.',
            'Use this entity to control machine-resource compatibility, default resources, usage limits and consumption basis.'
        ],

        relations: {
            machine: {
                entity: 'machines',
                type: 'manyToOne',
                field: 'machine_id',
                required: true,
                content: [
                    'Machine that uses or requires related resource.'
                ]
            },

            resource: {
                entity: 'resources',
                type: 'manyToOne',
                field: 'resource_id',
                required: true,
                content: [
                    'Resource compatible with, required by or blocked for related machine.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary association identifier.']
            },
            {
                name: 'machine_id',
                type: 'fk',
                required: true,
                content: ['Related machine identifier.']
            },
            {
                name: 'resource_id',
                type: 'fk',
                required: true,
                content: ['Related resource identifier.']
            },
            {
                name: 'relation_type',
                type: 'string',
                required: true,
                content: ['Type of machine-resource relation: material, tool, consumable, equipment, service, media or spare part.']
            },
            {
                name: 'is_required',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource is required for machine usage.']
            },
            {
                name: 'is_default',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource is default for this machine within its relation type.']
            },
            {
                name: 'min_quantity',
                type: 'number',
                required: false,
                content: ['Minimum resource quantity required for machine usage.']
            },
            {
                name: 'max_quantity',
                type: 'number',
                required: false,
                content: ['Maximum allowed resource quantity for machine usage.']
            },
            {
                name: 'unit',
                type: 'string',
                required: false,
                content: ['Unit for limits or consumption, for example pcs, kg, m2, lm or h.']
            },
            {
                name: 'default_usage_quantity',
                type: 'number',
                required: false,
                content: ['Default resource consumption quantity during machine usage.']
            },
            {
                name: 'usage_basis',
                type: 'string',
                required: false,
                content: ['Consumption basis, for example per_job, per_hour, per_cycle, per_piece, per_m2, per_mb or per_kg.']
            },
            {
                name: 'compatibility_level',
                type: 'string',
                required: true,
                content: ['Compatibility level between machine and resource: allowed, preferred, restricted or blocked.']
            },
            {
                name: 'notes',
                type: 'text',
                required: false,
                content: ['Additional notes about resource usage on this machine, for example variant, limitation or alternative.']
            },
            {
                name: 'attrs',
                type: 'json',
                required: false,
                content: ['Additional machine-resource relation attributes.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether this machine-resource association is active.']
            }
        ],

        rules: [
            {
                name: 'unique_machine_resource_type',
                content: [
                    'Each machine-resource-relation type combination must be unique.'
                ]
            },
            {
                name: 'active_association_usage',
                content: [
                    'Only active associations should be used when resolving machine-compatible resources.'
                ]
            },
            {
                name: 'blocked_resource_usage',
                content: [
                    'Resources with blocked compatibility level must not be selected for related machine.'
                ]
            },
            {
                name: 'preferred_resource_selection',
                content: [
                    'Preferred resources should be suggested before allowed or restricted resources.'
                ]
            },
            {
                name: 'required_resource_for_machine',
                content: [
                    'If association is required, related resource or valid substitute should be present before machine work can start.'
                ]
            },
            {
                name: 'quantity_range',
                content: [
                    'If both limits are set, max_quantity must be greater than or equal to min_quantity.'
                ]
            }
        ]
    },
    machinesToolTypes: {
        key: 'machines_tool_types',
        name: 'MachinesToolTypes',
        label: 'Maszyny ↔ Typy narzędzi',
        dimension: 'Association',

        content: [
            'Association between machines and tool types compatible with them.',
            'This relation defines technological compatibility, mounting method and physical limits for using a tool type on a machine.',
            'Use this entity to filter available tool types during machine setup, process planning and task execution.'
        ],

        relations: {
            machine: {
                entity: 'machines',
                type: 'manyToOne',
                field: 'machine_id',
                required: true,
                content: [
                    'Machine compatible with related tool type.'
                ]
            },

            toolType: {
                entity: 'tools_types',
                type: 'manyToOne',
                field: 'tool_type_id',
                required: true,
                content: [
                    'Tool type that can be mounted or used on related machine.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary association identifier.']
            },
            {
                name: 'machine_id',
                type: 'fk',
                required: true,
                content: ['Related machine identifier.']
            },
            {
                name: 'tool_type_id',
                type: 'fk',
                required: true,
                content: ['Related tool type identifier.']
            },
            {
                name: 'mounting_type',
                type: 'string',
                required: false,
                content: ['Mounting method, for example magnetic, mechanical, cylinder or quick-lock.']
            },
            {
                name: 'max_width_mm',
                type: 'number',
                required: false,
                content: ['Maximum tool width supported by this machine in millimeters.']
            },
            {
                name: 'max_height_mm',
                type: 'number',
                required: false,
                content: ['Maximum tool height, diameter or circumference supported by this machine in millimeters.']
            },
            {
                name: 'pressure_range',
                type: 'string',
                required: false,
                content: ['Supported pressure or force range for this tool type on this machine.']
            },
            {
                name: 'is_primary',
                type: 'boolean',
                required: true,
                content: ['Defines whether this is the primary tool type for the machine.']
            },
            {
                name: 'notes',
                type: 'text',
                required: false,
                content: ['Additional compatibility or mounting notes.']
            }
        ],

        rules: [
            {
                name: 'unique_machine_tool_type',
                content: [
                    'Each machine-tool type pair must be unique.'
                ]
            },
            {
                name: 'tool_type_machine_compatibility',
                content: [
                    'Tool type can be selected for machine work only when this association exists.'
                ]
            },
            {
                name: 'tool_dimension_limits',
                content: [
                    'Concrete tool should fit within max_width_mm and max_height_mm when those limits are defined.'
                ]
            },
            {
                name: 'primary_tool_type',
                content: [
                    'Primary tool type should be suggested first for related machine.'
                ]
            }
        ]
    },
    jiraIssue: {
        key: 'jira_issue',
        name: 'JiraIssue',
        label: 'Jira Issue',
        dimension: 'Context',

        content: [
            'Jira issue represents order, project or production context under which marchrutes and ProductionTasks are created.',
            'This entity is the bridge between Jira workflow and MES planning, execution, quantities, roles and financial control.',
            'Use current Jira issue as root context for loading, creating and managing production task manager data.'
        ],

        relations: {
            jiraIssueGroup: {
                entity: 'jira_issue_groups',
                type: 'manyToOne',
                field: 'jira_issue_groups_id',
                required: false,
                content: [
                    'Business or PM grouping of Jira issue.'
                ]
            },

            contractor: {
                entity: 'contractor',
                type: 'manyToOne',
                field: 'contractor_id',
                required: false,
                content: [
                    'Client or contractor related to this order or project.'
                ]
            },

            reporter: {
                entity: 'employees',
                type: 'manyToOne',
                field: 'reporter_id',
                required: false,
                content: ['Jira reporter.']
            },

            assignee: {
                entity: 'employees',
                type: 'manyToOne',
                field: 'assignee_id',
                required: false,
                content: ['Jira assignee or PM.']
            },

            productionManager: {
                entity: 'employees',
                type: 'manyToOne',
                field: 'production_manager_id',
                required: false,
                content: ['Employee responsible for production management.']
            },

            accountManager: {
                entity: 'employees',
                type: 'manyToOne',
                field: 'account_manager_id',
                required: false,
                content: ['Employee responsible for client relationship.']
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary Jira issue context identifier.']
            },
            {
                name: 'jira_key',
                type: 'string',
                required: true,
                content: ['Unique Jira issue key, for example ABC-123.']
            },
            {
                name: 'jira_parent_key',
                type: 'string',
                required: false,
                content: ['Parent Jira issue key.']
            },
            {
                name: 'jira_url',
                type: 'string',
                required: false,
                content: ['Link to Jira issue.']
            },
            {
                name: 'jira_project_key',
                type: 'string',
                required: false,
                content: ['Jira project key.']
            },
            {
                name: 'jira_issue_type',
                type: 'string',
                required: false,
                content: ['Jira issue type, for example Task, Epic, Bug or Sub-task.']
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                content: ['Order or project name synchronized from Jira.']
            },
            {
                name: 'product_group',
                type: 'string',
                required: false,
                content: ['Product group or business classification.']
            },
            {
                name: 'status',
                type: 'string',
                required: false,
                content: ['Internal project or order status used by MES workflow.']
            },
            {
                name: 'jira_status_category',
                type: 'string',
                required: false,
                content: ['Jira status category: To Do, In Progress or Done.']
            },
            {
                name: 'receipt_date',
                type: 'date',
                required: false,
                content: ['Date when order was received.']
            },
            {
                name: 'production_request_date',
                type: 'date',
                required: false,
                content: ['Date when order was requested for production.']
            },
            {
                name: 'start_date',
                type: 'date',
                required: false,
                content: ['Planned or actual production start date.']
            },
            {
                name: 'end_date',
                type: 'date',
                required: false,
                content: ['Planned or actual production end date.']
            },
            {
                name: 'ro_nr',
                type: 'string',
                required: false,
                content: ['RO number from Optima.']
            },
            {
                name: 'qty_ordered',
                type: 'number',
                required: false,
                content: ['Ordered quantity.']
            },
            {
                name: 'qty_to_do',
                type: 'number',
                required: false,
                content: ['Quantity remaining to produce.']
            },
            {
                name: 'qty_done',
                type: 'number',
                required: false,
                content: ['Completed quantity.']
            },
            {
                name: 'qty_invoiced',
                type: 'number',
                required: false,
                content: ['Invoiced quantity.']
            },
            {
                name: 'qty_dispatched',
                type: 'number',
                required: false,
                content: ['Dispatched quantity.']
            },
            {
                name: 'currency',
                type: 'string',
                required: true,
                content: ['Order currency, default PLN.']
            },
            {
                name: 'budget_net',
                type: 'number',
                required: true,
                content: ['Net budget for order or project.']
            },
            {
                name: 'planned_revenue_net',
                type: 'number',
                required: false,
                content: ['Planned net revenue.']
            },
            {
                name: 'committed_costs_net',
                type: 'number',
                required: true,
                content: ['Committed net costs from purchase orders or contracts.']
            },
            {
                name: 'is_order',
                type: 'boolean',
                required: true,
                content: ['Defines whether Jira issue represents an order.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether this Jira issue context is active in MES.']
            }
        ],

        rules: [
            {
                name: 'unique_jira_key',
                content: [
                    'Jira key must be unique.'
                ]
            },
            {
                name: 'jira_issue_as_task_manager_context',
                content: [
                    'Production task manager is embedded on a single Jira issue and should treat it as root context.'
                ]
            },
            {
                name: 'marchrutes_under_jira_issue',
                content: [
                    'Marchrutes should be created and loaded under a given Jira issue representing order or project.'
                ]
            },
            {
                name: 'active_order_context',
                content: [
                    'New production planning should be allowed only for active Jira issues marked as order when order context is required.'
                ]
            },
            {
                name: 'quantity_progress',
                content: [
                    'qty_done and qty_dispatched should not exceed qty_ordered unless explicitly allowed by business workflow.'
                ]
            },
            {
                name: 'date_sequence',
                content: [
                    'Production dates should follow logical order: receipt_date, production_request_date, start_date, end_date.'
                ]
            }
        ]
    },
    jiraIssueDirectPurchase: {
        key: 'jira_issue_direct_purchase',
        name: 'JiraIssueDirectPurchase',
        label: 'Zakupy bezpośrednie',
        dimension: 'Transaction',

        content: [
            'Direct purchase or contractor cooperation cost assigned to Jira issue context.',
            'Purchase may be connected directly to order/project or optionally to a specific ProductionTask.',
            'Use this entity to track planned and actual external costs, purchased resources, supplier cooperation and task-related outsourcing.'
        ],

        relations: {
            issue: {
                entity: 'jira_issue',
                type: 'manyToOne',
                field: 'issue_id',
                required: true,
                content: [
                    'Order or project context for this purchase.'
                ]
            },

            task: {
                entity: 'jira_issue_production_tasks',
                type: 'manyToOne',
                field: 'task_id',
                required: false,
                content: [
                    'Optional ProductionTask that this purchase or cooperation cost belongs to.'
                ]
            },

            resource: {
                entity: 'resources',
                type: 'manyToOne',
                field: 'resource_id',
                required: true,
                content: [
                    'Purchased resource, service, material or cost category.'
                ]
            },

            supplier: {
                entity: 'contractor',
                type: 'manyToOne',
                field: 'supplier_id',
                required: false,
                content: [
                    'Supplier, subcontractor or cooperation partner.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary direct purchase identifier.']
            },
            {
                name: 'issue_id',
                type: 'fk',
                required: true,
                content: ['Related Jira issue context identifier.']
            },
            {
                name: 'task_id',
                type: 'fk',
                required: false,
                content: ['Optional related ProductionTask identifier.']
            },
            {
                name: 'resource_id',
                type: 'fk',
                required: true,
                content: ['Purchased resource or cost category identifier.']
            },
            {
                name: 'supplier_id',
                type: 'fk',
                required: false,
                content: ['Supplier or contractor identifier.']
            },
            {
                name: 'margin',
                type: 'string',
                required: true,
                content: ['Margin group from 1 to 10 used for cost grouping.']
            },
            {
                name: 'is_verified',
                type: 'boolean',
                required: true,
                content: ['Defines whether purchase cost was verified.']
            },
            {
                name: 'qty_plan',
                type: 'number',
                required: true,
                content: ['Planned purchase quantity.']
            },
            {
                name: 'price_net_plan',
                type: 'number',
                required: true,
                content: ['Planned net unit price.']
            },
            {
                name: 'qty',
                type: 'number',
                required: true,
                content: ['Actual purchase quantity.']
            },
            {
                name: 'price_net',
                type: 'number',
                required: true,
                content: ['Actual net unit price.']
            },
            {
                name: 'currency',
                type: 'string',
                required: true,
                content: ['Purchase currency, default PLN.']
            },
            {
                name: 'conversion_rate',
                type: 'number',
                required: true,
                content: ['Currency conversion rate used for costing.']
            },
            {
                name: 'note',
                type: 'string',
                required: false,
                content: ['Purchase or cooperation item description.']
            },
            {
                name: 'doc_no',
                type: 'string',
                required: false,
                content: ['Document, purchase order, invoice or delivery reference number.']
            },
            {
                name: 'is_planned',
                type: 'boolean',
                required: true,
                content: ['Defines whether row represents planned cost or actual execution cost.']
            }
        ],

        rules: [
            {
                name: 'purchase_under_issue',
                content: [
                    'Every direct purchase must belong to a Jira issue context.'
                ]
            },
            {
                name: 'optional_task_cost_assignment',
                content: [
                    'Direct purchase may be assigned to ProductionTask when cost is task-specific.'
                ]
            },
            {
                name: 'planned_vs_actual_cost',
                content: [
                    'Planned values use qty_plan and price_net_plan, actual values use qty and price_net.'
                ]
            },
            {
                name: 'actual_cost_verification',
                content: [
                    'Actual purchase cost should be verified before being treated as final production cost.'
                ]
            },
            {
                name: 'direct_purchase_resource',
                content: [
                    'Selected resource should allow direct purchase or represent service/cooperation cost.'
                ]
            },
            {
                name: 'cost_value',
                content: [
                    'Net cost is calculated from quantity, net unit price and conversion rate.'
                ]
            }
        ]
    },
    jiraIssueProductionTasks: {
        key: 'jira_issue_production_tasks',
        name: 'JiraIssueProductionTasks',
        label: 'Taski produkcyjne',
        dimension: 'Transaction',

        content: [
            'Executable production task created under Jira issue context as part of marchrute.',
            'Task usually represents process to be done, but may also represent semi-product, required tool, outsourced step or preparation needed for another task.',
            'Use this entity as the main unit of planning, sequencing, execution, progress, quantity flow and worklog aggregation.'
        ],

        relations: {
            issue: {
                entity: 'jira_issue',
                type: 'manyToOne',
                field: 'issue_id',
                required: true,
                content: [
                    'Order or project context under which this production task exists.'
                ]
            },

            process: {
                entity: 'processes',
                type: 'manyToOne',
                field: 'process_id',
                required: true,
                content: [
                    'Process definition instantiated by this task.'
                ]
            },

            successorTask: {
                entity: 'jira_issue_production_tasks',
                type: 'manyToOne',
                field: 'successor_task_id',
                required: false,
                content: [
                    'Task that is blocked by completion or release of this task.'
                ]
            },

            employee: {
                entity: 'employees',
                type: 'manyToOne',
                field: 'employee_id',
                required: false,
                content: [
                    'Employee responsible for this task.'
                ]
            },

            structure: {
                entity: 'structures',
                type: 'manyToOne',
                field: 'structure_id',
                required: false,
                content: [
                    'Department responsible for this task.'
                ]
            },

            period: {
                entity: 'periods',
                type: 'manyToOne',
                field: 'period_id',
                required: false,
                content: [
                    'Reporting or settlement period.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary production task identifier.']
            },
            {
                name: 'task',
                type: 'string',
                required: false,
                content: ['Snapshot of Jira issue key or task key.']
            },
            {
                name: 'issue_id',
                type: 'fk',
                required: true,
                content: ['Related Jira issue context identifier.']
            },
            {
                name: 'process_id',
                type: 'fk',
                required: true,
                content: ['Process instantiated by this task.']
            },
            {
                name: 'name',
                type: 'string',
                required: true,
                content: ['Production task or marchrute step name.']
            },
            {
                name: 'description',
                type: 'text',
                required: false,
                content: ['Production task or marchrute step description.']
            },
            {
                name: 'sequence_no',
                type: 'number',
                required: true,
                content: ['Task order inside marchrute for given Jira issue.']
            },
            {
                name: 'successor_task_id',
                type: 'fk',
                required: false,
                content: ['Task blocked by this task or next task in dependency chain.']
            },
            {
                name: 'category',
                type: 'string',
                required: false,
                content: ['Task grouping category, for example product family, package type or production stage.']
            },
            {
                name: 'code',
                type: 'string',
                required: false,
                content: ['Technological code or generic job number.']
            },
            {
                name: 'target_qty',
                type: 'number',
                required: false,
                content: ['Quantity planned to be produced or processed by this task.']
            },
            {
                name: 'current_qty',
                type: 'number',
                required: false,
                content: ['Current progress quantity of this task.']
            },
            {
                name: 'available_qty',
                type: 'number',
                required: false,
                content: ['Quantity available as input for this task.']
            },
            {
                name: 'good_qty',
                type: 'number',
                required: false,
                content: ['Good quantity produced after this task.']
            },
            {
                name: 'scrap_qty',
                type: 'number',
                required: false,
                content: ['Scrap or rejected quantity after this task.']
            },
            {
                name: 'released_qty',
                type: 'number',
                required: false,
                content: ['Quantity released to next task or production stage.']
            },
            {
                name: 'unit',
                type: 'string',
                required: false,
                content: ['Task quantity unit, for example pcs, set, sheet or m2.']
            },
            {
                name: 'norm_time_fixed',
                type: 'number',
                required: false,
                content: ['Manual fixed normative time for this task.']
            },
            {
                name: 'norm_performance',
                type: 'number',
                required: false,
                content: ['Normative performance, for example pcs per hour.']
            },
            {
                name: 'norm_time_processed',
                type: 'number',
                required: false,
                content: ['Calculated normative time based on quantity and performance.']
            },
            {
                name: 'current_time',
                type: 'number',
                required: false,
                content: ['Actual work time aggregated for this task.']
            },
            {
                name: 'correction_time',
                type: 'number',
                required: false,
                content: ['Work time spent in correction mode.']
            },
            {
                name: 'status',
                type: 'string',
                required: true,
                content: ['Manual task status: draft, planned, in_progress, done or canceled.']
            },
            {
                name: 'is_done',
                type: 'boolean',
                required: true,
                content: ['Defines whether task is completed.']
            },
            {
                name: 'planned_start_at',
                type: 'datetime',
                required: false,
                content: ['Planned task start datetime.']
            },
            {
                name: 'planned_end_at',
                type: 'datetime',
                required: false,
                content: ['Planned task end datetime.']
            },
            {
                name: 'deadline_at',
                type: 'datetime',
                required: false,
                content: ['Task deadline.']
            },
            {
                name: 'started_at',
                type: 'datetime',
                required: false,
                content: ['Actual task start datetime.']
            },
            {
                name: 'completed_at',
                type: 'datetime',
                required: false,
                content: ['Actual task completion datetime.']
            },
            {
                name: 'is_outsource',
                type: 'boolean',
                required: true,
                content: ['Defines whether this task is executed externally.']
            },
            {
                name: 'is_manual_progress',
                type: 'boolean',
                required: true,
                content: ['Defines whether task progress is controlled manually instead of worklogs.']
            },
            {
                name: 'is_correction',
                type: 'boolean',
                required: true,
                content: ['Defines whether task is currently in correction mode.']
            },
            {
                name: 'is_critical',
                type: 'boolean',
                required: true,
                content: ['Defines whether task is critical for production planning or execution.']
            },
            {
                name: 'is_semi_product',
                type: 'boolean',
                required: true,
                content: ['Defines whether task output is semi-product for further stages.']
            },
            {
                name: 'semi_product_code',
                type: 'string',
                required: false,
                content: ['Code of semi-product created by this task.']
            },
            {
                name: 'remarks',
                type: 'text',
                required: false,
                content: ['Operational remarks about task execution or semi-product state.']
            },
            {
                name: 'attrs',
                type: 'json',
                required: false,
                content: ['Additional production task attributes.']
            }
        ],

        rules: [
            {
                name: 'task_under_issue',
                content: [
                    'Every production task should belong to a Jira issue context.'
                ]
            },
            {
                name: 'task_from_process',
                content: [
                    'Production task should instantiate an active process marked as task-capable.'
                ]
            },
            {
                name: 'marchrute_sequence',
                content: [
                    'Tasks inside one Jira issue should be ordered by sequence_no.'
                ]
            },
            {
                name: 'task_dependency',
                content: [
                    'Successor task should not be started before required quantity is released by predecessor task.'
                ]
            },
            {
                name: 'quantity_flow',
                content: [
                    'Released quantity should be based on good quantity and should not exceed available or completed quantity unless explicitly allowed.'
                ]
            },
            {
                name: 'semi_product_flow',
                content: [
                    'If task creates semi-product, its released quantity can become available quantity for dependent successor tasks.'
                ]
            },
            {
                name: 'scrap_tracking',
                content: [
                    'Scrap quantity should reduce good or releasable quantity.'
                ]
            },
            {
                name: 'manual_progress',
                content: [
                    'When is_manual_progress is enabled, current_qty may be updated manually instead of being calculated from worklogs.'
                ]
            },
            {
                name: 'done_status_consistency',
                content: [
                    'When task is done, status should be done and completed_at should be set.'
                ]
            },
            {
                name: 'planning_dates',
                content: [
                    'Planned end should be greater than or equal to planned start.'
                ]
            },
            {
                name: 'outsourced_task_costs',
                content: [
                    'Outsourced tasks may be connected with direct purchases or contractor cooperation costs.'
                ]
            }
        ]
    },
    jiraIssueOperationLog: {
        key: 'jira_issue_operation_log',
        name: 'JiraIssueOperationLog',
        label: 'Rejestr operacji',
        dimension: 'Report',

        content: [
            'Worklog and operation report anchored to Jira issue, ProductionTask and process.',
            'This entity records employee work time, quantity, remarks and correction work.',
            'Use this entity to aggregate actual task time, actual process effort, employee workload and production reporting.'
        ],

        relations: {
            issue: {
                entity: 'jira_issue',
                type: 'manyToOne',
                field: 'issue_id',
                required: false,
                content: [
                    'Optional Jira issue used as order, project or reporting context.'
                ]
            },

            productionTask: {
                entity: 'jira_issue_production_tasks',
                type: 'manyToOne',
                field: 'production_task_id',
                required: false,
                content: [
                    'Optional ProductionTask that this operation log belongs to.'
                ]
            },

            process: {
                entity: 'processes',
                type: 'manyToOne',
                field: 'process_id',
                required: true,
                content: [
                    'Process performed in this operation log.'
                ]
            },

            employee: {
                entity: 'employees',
                type: 'manyToOne',
                field: 'employee_id',
                required: true,
                content: [
                    'Employee who performed reported work.'
                ]
            },

            structure: {
                entity: 'structures',
                type: 'manyToOne',
                field: 'structure_id',
                required: true,
                content: [
                    'Reporting department responsible for this work.'
                ]
            },

            period: {
                entity: 'periods',
                type: 'manyToOne',
                field: 'period_id',
                required: true,
                content: [
                    'Reporting or settlement period.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary operation log identifier.']
            },
            {
                name: 'task',
                type: 'string',
                required: false,
                content: ['Snapshot of Jira issue key or task key.']
            },
            {
                name: 'issue_id',
                type: 'fk',
                required: false,
                content: ['Related Jira issue context identifier.']
            },
            {
                name: 'production_task_id',
                type: 'fk',
                required: false,
                content: ['Related ProductionTask identifier.']
            },
            {
                name: 'process_id',
                type: 'fk',
                required: true,
                content: ['Reported process identifier.']
            },
            {
                name: 'remarks',
                type: 'text',
                required: false,
                content: ['Remarks for reported operation.']
            },
            {
                name: 'is_repair',
                type: 'boolean',
                required: true,
                content: ['Defines whether reported work is repair, correction or repeated execution.']
            },
            {
                name: 'qty',
                type: 'number',
                required: true,
                content: ['Quantity of operation units reported in this entry.']
            },
            {
                name: 'work_date',
                type: 'date',
                required: false,
                content: ['Work date of reported operation.']
            },
            {
                name: 'start_time',
                type: 'datetime',
                required: false,
                content: ['Operation start datetime.']
            },
            {
                name: 'end_time',
                type: 'datetime',
                required: false,
                content: ['Operation end datetime.']
            },
            {
                name: 'duration_decimal',
                type: 'number',
                required: true,
                content: ['Operation duration in decimal hours.']
            },
            {
                name: 'period_id',
                type: 'fk',
                required: true,
                content: ['Reporting period identifier.']
            },
            {
                name: 'employee_id',
                type: 'fk',
                required: true,
                content: ['Employee identifier.']
            },
            {
                name: 'structure_id',
                type: 'fk',
                required: true,
                content: ['Reporting structure or department identifier.']
            }
        ],

        rules: [
            {
                name: 'operation_requires_process_employee_period',
                content: [
                    'Every operation log must have process, employee, structure and period.'
                ]
            },
            {
                name: 'optional_issue_general_work',
                content: [
                    'Operation log may have no issue when reporting general or administrative work.'
                ]
            },
            {
                name: 'task_log_updates_task_time',
                content: [
                    'Logs assigned to ProductionTask should aggregate into task current_time.'
                ]
            },
            {
                name: 'repair_log_updates_correction_time',
                content: [
                    'Logs marked as repair should aggregate into task correction_time when assigned to ProductionTask.'
                ]
            },
            {
                name: 'duration_from_time_range',
                content: [
                    'When start_time and end_time are provided, duration_decimal should match their difference.'
                ]
            },
            {
                name: 'positive_duration',
                content: [
                    'Duration must be greater than or equal to zero.'
                ]
            },
            {
                name: 'quantity_required_by_process',
                content: [
                    'Quantity should be required when related process requires quantity reporting.'
                ]
            },
            {
                name: 'remarks_required_by_process',
                content: [
                    'Remarks should be required when related process requires remarks reporting.'
                ]
            }
        ]
    },
    jiraIssueMachineUsageLog: {
        key: 'jira_issue_machine_usage_log',
        name: 'JiraIssueMachineUsageLog',
        label: 'Rejestr użycia maszyn',
        dimension: 'Report',

        content: [
            'Machine usage report anchored to Jira issue, ProductionTask, machine and process.',
            'This entity records machine time, usage quantity, usage kind, setup, repair and machine cost.',
            'Use this entity to aggregate actual machine load, machine cost, setup time, repair usage and task-machine execution history.'
        ],

        relations: {
            issue: {
                entity: 'jira_issue',
                type: 'manyToOne',
                field: 'issue_id',
                required: false,
                content: [
                    'Optional Jira issue used as order, project or reporting context.'
                ]
            },

            productionTask: {
                entity: 'jira_issue_production_tasks',
                type: 'manyToOne',
                field: 'production_task_id',
                required: false,
                content: [
                    'Optional ProductionTask that this machine usage belongs to.'
                ]
            },

            machine: {
                entity: 'machines',
                type: 'manyToOne',
                field: 'machine_id',
                required: true,
                content: [
                    'Machine used in this report entry.'
                ]
            },

            process: {
                entity: 'processes',
                type: 'manyToOne',
                field: 'process_id',
                required: false,
                content: [
                    'Process related to this machine usage.'
                ]
            },

            employee: {
                entity: 'employees',
                type: 'manyToOne',
                field: 'employee_id',
                required: true,
                content: [
                    'Operator or employee reporting machine usage.'
                ]
            },

            structure: {
                entity: 'structures',
                type: 'manyToOne',
                field: 'structure_id',
                required: true,
                content: [
                    'Reporting department responsible for machine usage.'
                ]
            },

            period: {
                entity: 'periods',
                type: 'manyToOne',
                field: 'period_id',
                required: true,
                content: [
                    'Reporting or settlement period.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary machine usage log identifier.']
            },
            {
                name: 'task',
                type: 'string',
                required: false,
                content: ['Snapshot of Jira issue key or task key.']
            },
            {
                name: 'issue_id',
                type: 'fk',
                required: false,
                content: ['Related Jira issue context identifier.']
            },
            {
                name: 'production_task_id',
                type: 'fk',
                required: false,
                content: ['Related ProductionTask identifier.']
            },
            {
                name: 'machine_id',
                type: 'fk',
                required: true,
                content: ['Used machine identifier.']
            },
            {
                name: 'process_id',
                type: 'fk',
                required: false,
                content: ['Related process identifier.']
            },
            {
                name: 'usage_kind',
                type: 'string',
                required: false,
                content: ['Machine usage kind, for example production, setup, test, cleaning, service or downtime.']
            },
            {
                name: 'is_setup',
                type: 'boolean',
                required: true,
                content: ['Defines whether usage concerns setup or changeover.']
            },
            {
                name: 'is_repair',
                type: 'boolean',
                required: true,
                content: ['Defines whether usage concerns repair or repeated execution.']
            },
            {
                name: 'remarks',
                type: 'text',
                required: false,
                content: ['Remarks about machine usage.']
            },
            {
                name: 'work_date',
                type: 'date',
                required: false,
                content: ['Work date of machine usage.']
            },
            {
                name: 'start_time',
                type: 'datetime',
                required: false,
                content: ['Machine usage start datetime.']
            },
            {
                name: 'end_time',
                type: 'datetime',
                required: false,
                content: ['Machine usage end datetime.']
            },
            {
                name: 'duration_decimal',
                type: 'number',
                required: true,
                content: ['Machine usage duration in decimal hours.']
            },
            {
                name: 'usage_qty',
                type: 'number',
                required: true,
                content: ['Machine usage quantity, for example cycles, sheets or passes.']
            },
            {
                name: 'usage_unit',
                type: 'string',
                required: false,
                content: ['Machine usage unit, for example h, pcs, cycle or sheet.']
            },
            {
                name: 'unit_usage_cost',
                type: 'number',
                required: false,
                content: ['Machine unit usage cost snapshot at report time.']
            },
            {
                name: 'usage_cost_amount',
                type: 'number',
                required: false,
                content: ['Total machine usage cost for this entry.']
            },
            {
                name: 'period_id',
                type: 'fk',
                required: true,
                content: ['Reporting period identifier.']
            },
            {
                name: 'employee_id',
                type: 'fk',
                required: true,
                content: ['Operator or reporting employee identifier.']
            },
            {
                name: 'structure_id',
                type: 'fk',
                required: true,
                content: ['Reporting structure or department identifier.']
            }
        ],

        rules: [
            {
                name: 'machine_usage_requires_machine_employee_period',
                content: [
                    'Every machine usage log must have machine, employee, structure and period.'
                ]
            },
            {
                name: 'optional_issue_general_usage',
                content: [
                    'Machine usage log may have no issue when reporting general machine work, maintenance or downtime.'
                ]
            },
            {
                name: 'task_machine_compatibility',
                content: [
                    'When assigned to ProductionTask, reported machine should be allowed for task process.'
                ]
            },
            {
                name: 'duration_from_time_range',
                content: [
                    'When start_time and end_time are provided, duration_decimal should match their difference.'
                ]
            },
            {
                name: 'positive_duration_and_usage',
                content: [
                    'Duration and usage quantity must be greater than or equal to zero.'
                ]
            },
            {
                name: 'machine_cost_calculation',
                content: [
                    'Usage cost should be calculated from usage quantity or duration and unit usage cost.'
                ]
            },
            {
                name: 'setup_usage_tracking',
                content: [
                    'Setup usage should be tracked separately from production usage when is_setup is enabled.'
                ]
            },
            {
                name: 'repair_usage_tracking',
                content: [
                    'Repair usage should contribute to correction or repair reporting when is_repair is enabled.'
                ]
            }
        ]
    },
    jiraIssueProductionOutputLog: {
        key: 'jira_issue_production_output_log',
        name: 'JiraIssueProductionOutputLog',
        label: 'Rejestr outputu produkcji',
        dimension: 'Report',

        content: [
            'Production output report anchored to Jira issue, ProductionTask and process.',
            'This entity records transformation history: produced quantity, good quantity, defects and repair output.',
            'Use this entity as quantity source of truth that updates ProductionTask state fields such as current_qty, good_qty, scrap_qty, released_qty and completion progress.'
        ],

        relations: {
            issue: {
                entity: 'jira_issue',
                type: 'manyToOne',
                field: 'issue_id',
                required: false,
                content: [
                    'Optional Jira issue used as order, project or reporting context.'
                ]
            },

            productionTask: {
                entity: 'jira_issue_production_tasks',
                type: 'manyToOne',
                field: 'production_task_id',
                required: false,
                content: [
                    'Optional ProductionTask affected by this output transformation log.'
                ]
            },

            process: {
                entity: 'processes',
                type: 'manyToOne',
                field: 'process_id',
                required: false,
                content: [
                    'Process snapshot related to this output.'
                ]
            },

            employee: {
                entity: 'employees',
                type: 'manyToOne',
                field: 'employee_id',
                required: false,
                content: [
                    'Employee who reported production output.'
                ]
            },

            structure: {
                entity: 'structures',
                type: 'manyToOne',
                field: 'structure_id',
                required: false,
                content: [
                    'Reporting department responsible for output.'
                ]
            },

            period: {
                entity: 'periods',
                type: 'manyToOne',
                field: 'period_id',
                required: false,
                content: [
                    'Reporting or settlement period.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary production output log identifier.']
            },
            {
                name: 'task',
                type: 'string',
                required: false,
                content: ['Snapshot of Jira issue key or task key.']
            },
            {
                name: 'issue_id',
                type: 'fk',
                required: false,
                content: ['Related Jira issue context identifier.']
            },
            {
                name: 'production_task_id',
                type: 'fk',
                required: false,
                content: ['Related ProductionTask identifier.']
            },
            {
                name: 'process_id',
                type: 'fk',
                required: false,
                content: ['Related process identifier.']
            },
            {
                name: 'is_repair',
                type: 'boolean',
                required: true,
                content: ['Defines whether output entry concerns repair or repeated execution.']
            },
            {
                name: 'source',
                type: 'string',
                required: false,
                content: ['Output entry source, for example manual, import, calc or correction.']
            },
            {
                name: 'defect_category',
                type: 'string',
                required: false,
                content: ['Defect or nonconformity category.']
            },
            {
                name: 'output_qty',
                type: 'number',
                required: true,
                content: ['Total produced or processed quantity reported in this entry.']
            },
            {
                name: 'defect_qty',
                type: 'number',
                required: true,
                content: ['Defect, scrap or rejected quantity reported in this entry.']
            },
            {
                name: 'good_qty',
                type: 'number',
                required: true,
                content: ['Good or accepted quantity reported in this entry.']
            },
            {
                name: 'work_date',
                type: 'date',
                required: false,
                content: ['Work date of output report.']
            },
            {
                name: 'employee_id',
                type: 'fk',
                required: false,
                content: ['Reporting employee identifier.']
            },
            {
                name: 'structure_id',
                type: 'fk',
                required: false,
                content: ['Reporting structure or department identifier.']
            },
            {
                name: 'period_id',
                type: 'fk',
                required: false,
                content: ['Reporting period identifier.']
            },
            {
                name: 'remarks',
                type: 'text',
                required: false,
                content: ['Remarks about production output, defects or transformation.']
            },
            {
                name: 'attrs',
                type: 'json',
                required: false,
                content: ['Additional production output attributes.']
            }
        ],

        rules: [
            {
                name: 'output_log_as_transformation_history',
                content: [
                    'Each output log is immutable business history of production transformation and should not be replaced by task state fields.'
                ]
            },
            {
                name: 'task_quantity_state_update',
                content: [
                    'Output logs assigned to ProductionTask should aggregate into task current_qty, good_qty and scrap_qty.'
                ]
            },
            {
                name: 'good_defect_output_consistency',
                content: [
                    'Good quantity plus defect quantity should not exceed output quantity unless explicit reclassification logic allows it.'
                ]
            },
            {
                name: 'released_quantity_source',
                content: [
                    'Released quantity for successor tasks should be derived from accepted good quantity or explicit release logic.'
                ]
            },
            {
                name: 'repair_output_tracking',
                content: [
                    'Output logs marked as repair should contribute to correction history and may update task correction state.'
                ]
            },
            {
                name: 'defect_category_required',
                content: [
                    'Defect category should be provided when defect quantity is greater than zero.'
                ]
            },
            {
                name: 'positive_quantities',
                content: [
                    'Output, good and defect quantities must be greater than or equal to zero.'
                ]
            }
        ]
    },
    jiraIssueResourceUsageLog: {
        key: 'jira_issue_resource_usage_log',
        name: 'JiraIssueResourceUsageLog',
        label: 'Rejestr zużycia zasobów',
        dimension: 'Report',

        content: [
            'Resource usage report anchored to Jira issue, ProductionTask, process and resource.',
            'This entity records both planned demand and actual resource consumption.',
            'Use this entity for material planning, BOM explosion output, actual consumption, waste tracking, task costing and stock-related reporting.'
        ],

        relations: {
            issue: {
                entity: 'jira_issue',
                type: 'manyToOne',
                field: 'issue_id',
                required: false,
                content: [
                    'Optional Jira issue used as order, project or reporting context.'
                ]
            },

            productionTask: {
                entity: 'jira_issue_production_tasks',
                type: 'manyToOne',
                field: 'production_task_id',
                required: false,
                content: [
                    'Optional ProductionTask that this resource plan or usage belongs to.'
                ]
            },

            process: {
                entity: 'processes',
                type: 'manyToOne',
                field: 'process_id',
                required: false,
                content: [
                    'Process related to planned or consumed resource.'
                ]
            },

            resource: {
                entity: 'resources',
                type: 'manyToOne',
                field: 'resource_id',
                required: false,
                content: [
                    'Planned or consumed resource. May be empty for unresolved or not-yet-dictionarized material.'
                ]
            },

            structure: {
                entity: 'structures',
                type: 'manyToOne',
                field: 'structure_id',
                required: false,
                content: [
                    'Reporting department responsible for resource usage.'
                ]
            },

            period: {
                entity: 'periods',
                type: 'manyToOne',
                field: 'period_id',
                required: false,
                content: [
                    'Reporting or settlement period.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary resource usage log identifier.']
            },
            {
                name: 'task',
                type: 'string',
                required: false,
                content: ['Snapshot of Jira issue key or task key.']
            },
            {
                name: 'issue_id',
                type: 'fk',
                required: false,
                content: ['Related Jira issue context identifier.']
            },
            {
                name: 'production_task_id',
                type: 'fk',
                required: false,
                content: ['Related ProductionTask identifier.']
            },
            {
                name: 'process_id',
                type: 'fk',
                required: false,
                content: ['Related process identifier.']
            },
            {
                name: 'is_repair',
                type: 'boolean',
                required: true,
                content: ['Defines whether resource usage concerns repair or repeated execution.']
            },
            {
                name: 'is_plan',
                type: 'boolean',
                required: true,
                content: ['Defines whether entry is planned demand or actual resource usage.']
            },
            {
                name: 'is_active',
                type: 'boolean',
                required: true,
                content: ['Defines whether this plan or usage entry is active.']
            },
            {
                name: 'resource_id',
                type: 'fk',
                required: false,
                content: ['Resource identifier, optional for unresolved material entries.']
            },
            {
                name: 'is_waste',
                type: 'boolean',
                required: true,
                content: ['Defines whether entry represents waste or material loss.']
            },
            {
                name: 'qty',
                type: 'number',
                required: true,
                content: ['Planned or actually consumed resource quantity.']
            },
            {
                name: 'unit_cost',
                type: 'number',
                required: false,
                content: ['Resource unit cost snapshot at report time.']
            },
            {
                name: 'cost_amount',
                type: 'number',
                required: false,
                content: ['Total resource cost for this entry.']
            },
            {
                name: 'work_date',
                type: 'date',
                required: false,
                content: ['Work date of resource plan or usage entry.']
            },
            {
                name: 'structure_id',
                type: 'fk',
                required: false,
                content: ['Reporting structure or department identifier.']
            },
            {
                name: 'period_id',
                type: 'fk',
                required: false,
                content: ['Reporting period identifier.']
            },
            {
                name: 'remarks',
                type: 'text',
                required: false,
                content: ['Remarks about material planning, consumption, waste or document reference.']
            },
            {
                name: 'doc_nr',
                type: 'string',
                required: false,
                content: ['Document number, for example RW or MM.']
            },
            {
                name: 'attrs',
                type: 'json',
                required: false,
                content: ['Additional resource usage attributes.']
            }
        ],

        rules: [
            {
                name: 'resource_usage_plan_vs_actual',
                content: [
                    'Planned demand is represented by is_plan=true, actual consumption by is_plan=false.'
                ]
            },
            {
                name: 'resource_usage_under_context',
                content: [
                    'Resource usage should be anchored to Jira issue, ProductionTask or process whenever possible.'
                ]
            },
            {
                name: 'bom_plan_generation',
                content: [
                    'Planned resource usage may be generated from process-resource relations and expanded complex resource BOM.'
                ]
            },
            {
                name: 'actual_consumption_costing',
                content: [
                    'Actual resource usage should contribute to task, issue and production cost calculations.'
                ]
            },
            {
                name: 'waste_tracking',
                content: [
                    'Waste entries should be marked with is_waste and included separately in material loss reporting.'
                ]
            },
            {
                name: 'repair_consumption_tracking',
                content: [
                    'Repair entries should be marked with is_repair and separated from normal production consumption.'
                ]
            },
            {
                name: 'cost_amount_calculation',
                content: [
                    'Cost amount should be calculated from quantity and unit cost unless explicitly provided.'
                ]
            },
            {
                name: 'positive_quantity',
                content: [
                    'Quantity must be greater than or equal to zero.'
                ]
            },
            {
                name: 'active_plan_usage',
                content: [
                    'Only active plan entries should be used as current material demand.'
                ]
            }
        ]
    },
    iraIssueTaskEventLog: {
        key: 'jira_issue_task_event_log',
        name: 'JiraIssueTaskEventLog',
        label: 'Historia zdarzeń taska',
        dimension: 'FutureFeature',

        content: [
            'Future event log for ProductionTask lifecycle changes.',
            'Not required for lean core MVP.',
            'Will be used later for exact status history, pause/resume tracking, blocking reasons, automation triggers and lead time analytics.'
        ],

        relations: {
            productionTask: {
                entity: 'jira_issue_production_tasks',
                type: 'manyToOne',
                field: 'production_task_id',
                required: true,
                content: [
                    'ProductionTask affected by this lifecycle event.'
                ]
            },

            issue: {
                entity: 'jira_issue',
                type: 'manyToOne',
                field: 'issue_id',
                required: false,
                content: [
                    'Jira issue context of the event.'
                ]
            },

            employee: {
                entity: 'employees',
                type: 'manyToOne',
                field: 'employee_id',
                required: false,
                content: [
                    'Employee or user who triggered the event.'
                ]
            }
        },

        fields: [
            {
                name: 'id',
                type: 'id',
                required: true,
                content: ['Primary task event identifier.']
            },
            {
                name: 'production_task_id',
                type: 'fk',
                required: true,
                content: ['Related ProductionTask identifier.']
            },
            {
                name: 'issue_id',
                type: 'fk',
                required: false,
                content: ['Related Jira issue context identifier.']
            },
            {
                name: 'event_type',
                type: 'string',
                required: true,
                content: ['Task event type, for example created, planned, started, paused, resumed, blocked, unblocked, done, canceled or correction_started.']
            },
            {
                name: 'from_status',
                type: 'string',
                required: false,
                content: ['Previous task status before event.']
            },
            {
                name: 'to_status',
                type: 'string',
                required: false,
                content: ['New task status after event.']
            },
            {
                name: 'event_at',
                type: 'datetime',
                required: true,
                content: ['Datetime when event happened.']
            },
            {
                name: 'reason',
                type: 'text',
                required: false,
                content: ['Optional reason or note for event.']
            }
        ],

        rules: [
            {
                name: 'future_feature',
                content: [
                    'Do not implement in MVP core; keep as planned extension.'
                ]
            },
            {
                name: 'append_only_history',
                content: [
                    'Events should be append-only and should not replace current task state fields.'
                ]
            }
        ]
    }
}