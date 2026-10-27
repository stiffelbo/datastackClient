import { useMemo } from 'react';
import { z } from 'zod';

// ======================================================
// BASE PAYLOAD
// ======================================================

const blankShiftPayload = {
    balance_side: null,
    movement_type_id: null,
    status_id: null,

    shipping_item_id: null,
    m_idx_id: null,
    qty: null,

    production_task_id: null,
    issue_id: null,
    product_order_id: null,

    from_location_id: null,
    to_location_id: null,

    assignee_id: null,
    planned_at: null,
    done_at: null,
    is_done: 0,
    is_active: 1,

    title: '',
    notes: null,
};

// ======================================================
// CASES
// ======================================================

export const cases = {
    product_order: {
        blank: {
            label: 'Puste Zamówienie',
            severity: 'warning',
            match: data =>
                Number(data.qty_ordered) === 0 &&
                Number(data.is_active) === 1,
        },

        upcoming: {
            label: 'Zapowiedź',
            severity: 'success',
            match: data =>
                Number(data.qty_ordered) > 0 &&
                Number(data.is_active) === 1,
        },

        closed: {
            label: 'Zamknięte',
            severity: 'error',
            match: data =>
                Number(data.is_active) === 0,
        },
    },

    shipping_item: {
        external_receipt: {
            label: 'Przyjęcie zewnętrzne',
            severity: 'info',
            match: data =>
                data.shipping_id != null &&
                Number(data.balance_side) === 1 &&
                data.source_item_id == null &&
                data.source_shift_id == null,
        },
    },
};

// ======================================================
// ACTIONS
// ======================================================

export const actions = {
    shipping_item: {
        external_receipt: [
            {
                value: 'issue_to_production_product_order',
                label: 'Wydanie do ProductOrder',
                fields: [
                    'movement_type_id',
                    'product_order_id',
                    'qty',
                    'assignee_id',
                    'planned_at',
                    'notes',
                ],
            },
            {
                value: 'issue_to_production_jira_issue',
                label: 'Wydanie do JiraIssue',
                fields: [
                    'movement_type_id',
                    'issue_id',
                    'qty',
                    'assignee_id',
                    'planned_at',
                    'notes',
                ],
            },
            {
                value: 'internal_transfer',
                label: 'Przesunięcie wewnętrzne',
                fields: [
                    'movement_type_id',
                    'qty',
                    'to_location_id',
                    'assignee_id',
                    'planned_at',
                    'notes',
                ],
            },
        ],
    },

    product_order: {
        blank: [],
        upcoming: [
            {
                value: 'return_to_wh',
                label: 'Wydanie z produkcji',
                fields: [
                    'movement_type_id',
                    'shipping_item_id',
                    'qty',
                    'status_id',
                    'assignee_id',
                    'planned_at',
                    'notes',
                ],
            },
            {
                value: 'issue_to_production',
                label: 'Wydanie na produkcje',
                fields: [
                    'movement_type_id',
                    'product_order_id',
                    'qty',
                    'status_id',
                    'assignee_id',
                    'planned_at',
                    'notes',
                ],
            },
        ],
        closed: [],
    },
};

// ======================================================
// VALIDATION
// ======================================================

const contextSchema = z.object({
    element: z.string().min(1),
    data: z.record(z.string(), z.unknown()),
});

const addError = (errors, code, message) => {
    errors.push({ code, message });
};

// ======================================================
// CASE RESOLUTION
// ======================================================

const resolveCase = ({ element, data, errors }) => {
    const definitions = cases[element];

    if (!definitions) {
        addError(
            errors,
            'UNSUPPORTED_ELEMENT',
            `Nieobsługiwany element: ${element}`
        );

        return null;
    }

    const matched = Object.entries(definitions)
        .filter(([, config]) => config.match(data));

    if (!matched.length) {
        addError(
            errors,
            'UNKNOWN_CASE',
            `Nie rozpoznano kontekstu dla: ${element}`
        );

        return null;
    }

    if (matched.length > 1) {
        addError(
            errors,
            'MULTIPLE_CASES',
            `Wiele dopasowań: ${matched.map(([name]) => name).join(', ')}`
        );
    }

    return matched[0][0];
};

// ======================================================
// PAYLOAD
// ======================================================

const createData = ({ element, data, action, errors }) => {
    const initial = { ...blankShiftPayload };

    if (!action) return initial;

    if (element === 'shipping_item') {
        Object.assign(initial, {
            shipping_item_id: data.id,
            m_idx_id: data.m_idx_id,
            from_location_id: data.location_id,
        });

        switch (action) {
            case 'issue_to_production_product_order':
                return {
                    ...initial,
                    balance_side: -1,
                    title: `Wydanie na produkcję: ${data.label}`,
                };

            case 'issue_to_production_jira_issue':
                return {
                    ...initial,
                    balance_side: -1,
                    title: `Wydanie do JiraIssue: ${data.label}`,
                };

            case 'internal_transfer':
                return {
                    ...initial,
                    balance_side: 0,
                    title: `Przesunięcie: ${data.label}`,
                };
        }
    }

    addError(
        errors,
        'UNSUPPORTED_ACTION',
        `Nieobsługiwana akcja: ${element}/${action}`
    );

    return initial;
};

// ======================================================
// FORM SCHEMA
// ======================================================

const adaptFormSchema = ({ schema, element, data, caseName, errors }) => {
    if (!Array.isArray(schema)) return schema;

    if (element !== 'shipping_item') return schema;

    if (caseName !== 'external_receipt') return schema;

    const available = Number(data.qty_available);

    if (!Number.isFinite(available) || available < 0) {
        addError(
            errors,
            'INVALID_AVAILABLE_QTY',
            'Nieprawidłowa dostępna ilość materiału'
        );

        return schema;
    }

    const lockedFields = [
        'shipping_item_id',
        'm_idx_id',
        'from_location_id',
    ];

    return schema.map(field => {
        if (lockedFields.includes(field.name)) {
            return {
                ...field,
                disabled: true,
            };
        }

        if (field.name === 'qty') {
            return {
                ...field,
                required: true,
                disabled: available <= 0,

                validation: {
                    ...field.validation,
                    required: true,
                    min: 0.0001,
                    max: available,
                },

                inputProps: {
                    ...field.inputProps,
                    min: 0.0001,
                    max: available,
                    step: 0.0001,
                },

                helperText: `Dostępna ilość: ${available} ${data.unit ?? ''}`,
            };
        }

        return field;
    });
};

// ======================================================
// HOOK
// ======================================================

export const useAddShift = ({
    element,
    data,
    action = null,
    schema,
}) => {

    const errors = [];

    const parsed = contextSchema.safeParse({
        element,
        data,
    });

    if (!parsed.success) {
        addError(
            errors,
            'INVALID_CONTEXT',
            'Nieprawidłowe dane kontekstu'
        );

        return {
            caseName: null,
            context: null,
            availableActions: [],
            actionConfig: null,
            initialData: { ...blankShiftPayload },
            formSchema: schema,
            errors,
        };
    }

    const caseName = resolveCase({
        element,
        data,
        errors,
    });

    const context = cases[element]?.[caseName] ?? null;

    const availableActions =
        actions[element]?.[caseName] ?? [];

    const actionConfig = availableActions.find(
        item => item.value === action
    ) ?? null;

    if (action && !actionConfig) {
        addError(
            errors,
            'ACTION_NOT_AVAILABLE',
            `Akcja ${action} nie jest dostępna dla ${element}/${caseName}`
        );
    }

    const initialData = actionConfig
        ? createData({ element, data, action, errors })
        : { ...blankShiftPayload };

    const formSchema = adaptFormSchema({
        schema,
        element,
        data,
        caseName,
        errors,
    });

    return {
        formSchema,
        formData: initialData,
        actions,
        errors,
        context,
        availableActions,
        actionConfig,
    };
};

export default useAddShift;