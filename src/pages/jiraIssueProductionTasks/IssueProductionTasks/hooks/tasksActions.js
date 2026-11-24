const createTasksActions = ({
    entity,
    context,
    tasks,
    ui,
}) => {
    const { create, fetchRows, update } = entity;

    // ============================================================
    // CREATE
    // ============================================================

    const executeCreate = async (action, data) => {
        if (!context?.reference || !context?.referenceId) {
            throw new Error('Brak kontekstu produkcyjnego.');
        }

        if (typeof create !== 'function') {
            throw new Error('Endpoint tworzenia zadań jest niedostępny.');
        }

        const processId = Number(data?.value);
        const referenceId = Number(context.referenceId);

        if (!Number.isSafeInteger(processId) || processId <= 0) {
            throw new Error('Nieprawidłowe ID procesu.');
        }

        if (!Number.isSafeInteger(referenceId) || referenceId <= 0) {
            throw new Error('Nieprawidłowe ID kontekstu.');
        }

        const payload = {
            action,
            reference: context.reference,
            referenceId,
            processId,
        };

        // Operacja zależna od zaznaczonego zadania
        if (action === 'addAfter') {
            const selectedTaskId = Number(ui.selectedTaskId);

            const selectedTask = tasks.find(task => {
                return Number(task.id) === selectedTaskId;
            });

            if (!selectedTask) {
                throw new Error('Nie wskazano zadania poprzedzającego.');
            }

            payload.selectedTaskId = selectedTaskId;
        }

        // Backend wykonuje kompletną operację na marszrucie
        const response = await create(payload);

        if (response == null || response === false || response?.created === false) {
            throw new Error('Nie udało się utworzyć zadania.');
        }

        // Synchronizacja całej marszruty
        await fetchRows();

        return response;
    };

    // ============================================================
    // PUBLIC API
    // ============================================================

    const tasksActions = {
        addStart: async (data) => {
            return await executeCreate('addStart', data);
        },

        addEnd: async (data) => {
            return await executeCreate('addEnd', data);
        },

        addAfter: async (data) => {
            return await executeCreate('addAfter', data);
        },

        addFree: async (data) => {
            return await executeCreate('addFree', data);
        },

        connect: async ({ sourceId, targetId }) => {
            return await entity.update(targetId, {
                action: 'connect',
                sourceId,
            });
        },

        disconnect: async ({ sourceId, targetId }) => {
            return await entity.update(targetId, {
                action: 'disconnect',
                sourceId,
            });
        },
    };

    return tasksActions;
};

export default createTasksActions;