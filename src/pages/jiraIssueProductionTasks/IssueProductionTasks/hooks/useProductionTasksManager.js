import { useState, useMemo } from "react";
import { tasksDto } from "../dto/tasksDto";
import createTasksActions from './tasksActions';

const useProductionTasksManager = ({ entity, processedSchema }) => {
    const [uiState, setUiState] = useState({
        view: 'list',
        selectedTaskId: null,
        selectedTaskIds: [],
        extendedTaskId: null,
        panel: null,
        sections: {},
    });

    // ============================================================
    // ENTITY DATA
    // ============================================================

    const tasks = useMemo(
        () => tasksDto({ data: entity.rows }) ?? [],
        [entity.rows]
    );

    const schema = entity.schema ?? {};
    const columns = schema.columns ?? [];

    const selectedTask = uiState.selectedTaskId != null
        ? tasks.find(task => String(task.id) === String(uiState.selectedTaskId)) ?? null
        : null;

    // ============================================================
    // PROCESSED SCHEMA
    // ============================================================

    const {
        context = null,
        processes = [],
        processesMap = {},
        performancesMap = {},
        marchrutes = [],
        marchrutesMap = {},
    } = processedSchema ?? {};

    const history = schema.history
        ? {
            ...schema.history,
            marchrutes,
        }
        : null;

    // ============================================================
    // DATA ACCESSORS
    // ============================================================

    const getTask = (id) =>
        tasks.find(task => String(task.id) === String(id)) ?? null;

    const getProcess = (processId) =>
        processesMap[processId] ?? null;

    const getPerformance = (processId, mode = null) => {
        const performance = performancesMap[processId] ?? null;

        return mode === null
            ? performance
            : performance?.[mode] ?? null;
    };

    const getMarchrute = (signature) =>
        marchrutesMap[signature] ?? null;

    // ============================================================
    // UI STATE
    // ============================================================

    const ui = {
        ...uiState,

        setView: (view) => {
            if (!['list', 'dag'].includes(view)) return;

            setUiState(prev => {
                return {
                    ...prev,
                    view,
                };
            });
        },

        selectTask: (id) => setUiState(prev => ({
            ...prev,
            selectedTaskId: id,
        })),

        selectTasks: (ids) => setUiState(prev => ({
            ...prev,
            selectedTaskIds: ids,
        })),

        extendTask: (id) => setUiState(prev => ({
            ...prev,
            extendedTaskId: id,
        })),

        closeExtendedTask: () => setUiState(prev => ({
            ...prev,
            extendedTaskId: null,
        })),

        openPanel: (panel) => setUiState(prev => ({
            ...prev,
            panel,
        })),

        closePanel: () => setUiState(prev => ({
            ...prev,
            panel: null,
        })),

        setSections: (sections) => setUiState(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                ...sections,
            },
        })),

        toggleSection: (section) => setUiState(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [section]: !prev.sections[section],
            },
        })),
    };

    // ============================================================
    // TASK ACTIONS
    // ============================================================

    const tasksActions = createTasksActions({
        entity,
        uiState,
    });

    const actions = {
        addStart: (data) => tasksActions.addStart({
            data,
            tasks,
            selectedTaskId: uiState.selectedTaskId,
        }),

        addAfter: (data) => tasksActions.addAfter({
            data,
            tasks,
            selectedTaskId: uiState.selectedTaskId,
        }),

        addEnd: (data) => tasksActions.addEnd({
            data,
            tasks,
            selectedTaskId: uiState.selectedTaskId,
        }),

        addFree: (data) => tasksActions.addFree({
            data,
            tasks,
            selectedTaskId: uiState.selectedTaskId,
        }),

        importRoute: async (route, { position = 'end' } = {}) => {
            // TODO: atomowy import marszruty po stronie PHP.
            // Nowe ID, aktualny kontekst i przemapowanie zależności DAG.
            // Bez kopiowania historycznych raportów i statusów.

            throw new Error('Import marszruty nie jest jeszcze zaimplementowany');
        },

        handleReorder: ({ sourceId, targetId }) => {
            if (String(sourceId) === String(targetId)) return;

            console.log({ sourceId, targetId });
        },

        update: async ({ field, value, id }) => {
            await entity.updateField({ field, value, id });
            await entity.fetchRows();
        },

        remove: entity.remove,

        estimate: async (id) => {
            throw new Error('Estymacja zadania nie jest jeszcze zaimplementowana');
        },
    };

    // ============================================================
    // BULK ACTIONS
    // ============================================================

    const bulk = {
        estimate: async () => {
            throw new Error('Estymacja zbiorcza nie jest jeszcze zaimplementowana');
        },

        copyCalculatedToFixed: async () => {
            throw new Error('Kopiowanie norm nie jest jeszcze zaimplementowane');
        },
    };

    // ============================================================
    // FIELD HELPERS
    // ============================================================

    const fields = {
        getColumn: (field) =>
            columns.find(column => column.field === field) ?? null,

        visibleColumn: (field) => {
            const column = columns.find(column => column.field === field);

            return column && column.hidden !== true
                ? column
                : null;
        },

        editableColumn: (field) => {
            const column = columns.find(column => column.field === field);

            return column && column.hidden !== true && column.editable === true
                ? column
                : null;
        },

        getOption: (column, value) =>
            (column?.options ?? []).find(
                option => String(option.value) === String(value)
            ) ?? null,

        numberLabel: (value, digits = 2) => {
            if (value === null || value === undefined || value === '') {
                return '—';
            }

            const number = Number(value);

            return Number.isFinite(number)
                ? number.toLocaleString('pl-PL', {
                    maximumFractionDigits: digits,
                })
                : '—';
        },

        boolValue: (value) =>
            value === true || value === 1 || value === '1',
    };

    // ============================================================
    // PUBLIC API
    // ============================================================

    return {
        // Context
        context,
        history,

        // Tasks
        tasks,
        selectedTask,
        getTask,

        // Processes
        processes,
        processesMap,
        performancesMap,
        getProcess,
        getPerformance,

        // Marchrutes
        marchrutes,
        marchrutesMap,
        routeSuggestions: marchrutes,
        getMarchrute,

        // Schema
        schema,
        processedSchema,
        columns,
        fields,

        // Entity
        entity,
        loading: entity.loading,
        error: entity.error,

        // Actions
        actions,
        bulk,
        ui,

        refresh: () => entity.refresh(),
        fetchRows: () => entity.fetchRows(),
    };
};

export default useProductionTasksManager;