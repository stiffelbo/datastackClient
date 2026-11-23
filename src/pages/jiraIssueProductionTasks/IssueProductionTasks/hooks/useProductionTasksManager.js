import { useState } from "react";
import { tasksDto } from "../dto/tasksDto";
import useLocalStorage from "../../../../hooks/useLocalStorage";
import createTasksActions from './tasksActions';

const useProductionTasksManager = ({ entity }) => {
    const [uiState, setUiState] = useState({
        view: 'route',
        selectedTaskId: null, //wybranie dla np dodania taska pomiędzy
        selectedTaskIds: [], //zaznaczenie dla bulk operacji przeliczeń itd.
        extendedTaskId : null, // włączenie okna zadania z danymi relacyjnymi, zaimportujemy sobie tu strone Taska i tutaj bedą narzedzia, raporty, pliki, itd..
        panel: null,

        sections: {
            norms: false, //pokazuje w liście komponent z normami
            kpi: false, //pokazuje w liście komponent z kpi
            editable: false, //ustawia w tryb edycji pola edytowalne by nie trzeba sie było wklikiwać itd.
        },
    });

    // Dane encji
    const tasks = tasksDto({ data: entity.rows }) ?? [];
    const getSelectedTask = () => (uiState.selectedTaskId ? tasks.find(i => i.id === uiState.selectedTaskId) : null);

    const schema = entity.schema ?? {};
    const columns = schema.columns ?? [];

    // Kontekst i historia z getEntitySchema.php
    const context = schema.context ?? null;
    const history = schema.history ?? null;

    // Opcje procesów i sugerowane marszruty
    const processes = schema.options?.process_id ?? [];
    const routeSuggestions = history?.marchrutes ?? [];

    // UI
    const ui = {
        ...uiState,

        setView: (view) => setUiState(prev => ({
            ...prev,
            view,
        })),

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

    const tasksActions = createTasksActions({entity: entity, uiState: uiState});
    // Operacje na zadaniach
    const actions = {
        addStart: async (data) => {
            tasksActions.addStart({data : data, tasks : tasks, selectedTaskId : uiState.selectedTaskId});
        },

        addAfter: async (data) => {
            tasksActions.addAfter({data : data, tasks : tasks, selectedTaskId : uiState.selectedTaskId});
        },
        addEnd: async (data) => {
            tasksActions.addEnd({data : data, tasks : tasks, selectedTaskId : uiState.selectedTaskId});
        },
        addFree: async (data) => {
            tasksActions.addFree({data : data, tasks : tasks, selectedTaskId : uiState.selectedTaskId});
        },

        remove : id => {

        },

        importRoute: async (route, { position = 'end' } = {}) => {
            // TODO: endpoint importu marszruty.
            // Import powinien odbyć się w jednej transakcji po stronie PHP.
            // Zadania zostaną dopisane za ostatnim sequence_no.
            // Zachowujemy kolejność tasków historycznych.
            // Nowe zadania dostają własne ID i kontekst aktualnego zlecenia.
            // Nie kopiujemy historycznych raportów ani statusów wykonania.

            throw new Error('Import marszruty nie jest jeszcze zaimplementowany');
        },

        handleReorder: ({ sourceId, targetId }) => {
            if (String(sourceId) === String(targetId)) return;

            console.log({ sourceId, targetId });
        },

        update: async ({field, value, id}) => {
            await entity.updateField({field, value, id});
            await entity.refresh();
        },
        remove: entity.remove,

        estimate: async (id) => {
            throw new Error('Estymacja zadania nie jest jeszcze zaimplementowana');
        },
    };

    // Operacje zbiorcze
    const bulk = {
        estimate: async () => {
            throw new Error('Estymacja zbiorcza nie jest jeszcze zaimplementowana');
        },

        copyCalculatedToFixed: async () => {
            throw new Error('Kopiowanie norm nie jest jeszcze zaimplementowane');
        },
    };

    const fields = {
        getColumn: (field) =>
            columns.find(column => column.field === field) ?? null,

        visibleColumn: (field) => {
            const column = columns.find(column => column.field === field);
            return column && column.hidden !== true ? column : null;
        },

        editableColumn: (field) => {
            const column = columns.find(column => column.field === field);
            return column && column.hidden !== true && column.editable === true
                ? column
                : null;
        },

        getOption: (column, value) =>
            (column?.options ?? []).find(option => String(option.value) === String(value)) ?? null,

        numberLabel: (value, digits = 2) => {
            if (value === null || value === undefined || value === '') return '—';
            const number = Number(value);
            return Number.isFinite(number)
                ? number.toLocaleString('pl-PL', { maximumFractionDigits: digits })
                : '—';
        },

        boolValue: (value) => value === true || value === 1 || value === '1',
    };

    const refresh = () => entity.refresh();

    return {
        context,
        history,
        tasks,
        selectedTask : getSelectedTask(),
        processes,
        routeSuggestions,
        schema,
        fields,
        entity,

        loading: entity.loading,
        error: entity.error,

        actions,
        bulk,
        ui,
        refresh,
    };
};

export default useProductionTasksManager;