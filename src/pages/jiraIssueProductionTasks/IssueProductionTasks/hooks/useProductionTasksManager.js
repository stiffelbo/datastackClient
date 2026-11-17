import { useState, useMemo, useCallback } from "react";

const useProductionTasksManager = ({ entity, context }) => {
    const [uiState, setUiState] = useState({
        view: 'route',
        selectedTaskId: null,
        selectedTaskIds: [],
        panel: null,
    });

    const tasks = entity.rows ?? [];

    const ui = useMemo(() => ({
        ...uiState,

        setView: (view) => setUiState(prev => ({ ...prev, view })),

        selectTask: (id) => setUiState(prev => ({
            ...prev,
            selectedTaskId: id,
        })),

        selectTasks: (ids) => setUiState(prev => ({
            ...prev,
            selectedTaskIds: ids,
        })),

        openPanel: (panel) => setUiState(prev => ({
            ...prev,
            panel,
        })),

        closePanel: () => setUiState(prev => ({
            ...prev,
            panel: null,
        })),
    }), [uiState]);

    const actions = useMemo(() => ({
        add: async (data) => {
            throw new Error('Dodawanie tasków nie jest jeszcze zaimplementowane');
        },

        update: entity.updateField,

        remove: entity.remove,

        estimate: async (id) => {
            throw new Error('Estymacja taska nie jest jeszcze zaimplementowana');
        },
    }), [entity]);

    const bulk = useMemo(() => ({
        estimate: async () => {
            throw new Error('Estymacja zbiorcza nie jest jeszcze zaimplementowana');
        },

        copyCalculatedToFixed: async () => {
            throw new Error('Kopiowanie norm nie jest jeszcze zaimplementowane');
        },
    }), []);

    const refresh = useCallback(() => entity.refresh(), [entity.refresh]);

    return {
        context,
        tasks,
        processes: [],
        routeSuggestions: [],

        loading: entity.loading,
        error: entity.error,

        actions,
        bulk,
        ui,
        refresh,
    };
};

export default useProductionTasksManager;