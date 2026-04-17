import { useState } from 'react';

function getTaskIdentity(task) {
    if (!task || typeof task !== 'object') return null;

    return (
        task.jira_id ??
        task.id ??
        task.jira_key ??
        task.key ??
        task.task ??
        null
    );
}

function getTaskKey(task) {
    if (!task || typeof task !== 'object') return '';

    return (
        task.jira_key ??
        task.key ??
        task.task ??
        ''
    );
}

function normalizeTask(task) {
    return {
        ...task,
        report: {
            quantity: task?.report?.quantity ?? null,
            quantityGood: task?.report?.quantityGood ?? null,
            quantityScrap: task?.report?.quantityScrap ?? null,
            is_rework: task?.report?.is_rework ?? false,
            remarks: task?.report?.remarks ?? "",
            requiresQuantity: task?.report?.requiresQuantity ?? true,
            requiresRemarks: task?.report?.requiresRemarks ?? false,
        },
    };
}

function updateTaskReport(taskOrId, patch) {
    const identity =
        typeof taskOrId === "object"
            ? getTaskIdentity(taskOrId)
            : taskOrId;

    if (!identity) return;

    setTasks((prev) =>
        prev.map((task) =>
            getTaskIdentity(task) === identity
                ? {
                    ...task,
                    report: {
                        ...task.report,
                        ...patch,
                    },
                }
                : task
        )
    );
}

export default function useTasks({ onSubmit, initialValues = {}, requiresQuantity = true, requiresRemarks = false, requiresTasks = false }) {
    const [tasks, setTasks] = useState(
        Array.isArray(initialValues.tasks) ? initialValues.tasks : []
    );

    function hasTask(taskOrId) {
        const identity =
            typeof taskOrId === 'object'
                ? getTaskIdentity(taskOrId)
                : taskOrId;

        if (!identity) return false;

        return tasks.some((task) => getTaskIdentity(task) === identity);
    }

    function getTaskById(taskOrId) {
        const identity =
            typeof taskOrId === 'object'
                ? getTaskIdentity(taskOrId)
                : taskOrId;

        if (!identity) return null;

        return tasks.find((task) => getTaskIdentity(task) === identity) ?? null;
    }

    function addTask(task) {
        if (!task || typeof task !== "object") return;

        const identity = getTaskIdentity(task);
        if (!identity) return;

        setTasks((prev) => {
            const exists = prev.some(
                (item) => getTaskIdentity(item) === identity
            );

            if (exists) return prev;

            return [...prev, normalizeTask(task)];
        });
    }

    function removeTask(taskOrId) {
        const identity =
            typeof taskOrId === 'object'
                ? getTaskIdentity(taskOrId)
                : taskOrId;

        if (!identity) return;

        setTasks((prev) =>
            prev.filter((task) => getTaskIdentity(task) !== identity)
        );
    }

    function updateTaskReport(taskOrId, patch) {
        const identity =
            typeof taskOrId === "object"
                ? getTaskIdentity(taskOrId)
                : taskOrId;

        if (!identity) return;

        setTasks((prev) =>
            prev.map((task) =>
                getTaskIdentity(task) === identity
                    ? {
                        ...task,
                        report: {
                            ...task.report,
                            ...patch,
                        },
                    }
                    : task
            )
        );
    }

    function setTaskQuantity(taskOrId, quantity) {
        updateTaskReport(taskOrId, { quantity });
    }

    function setTaskQuantityGood(taskOrId, quantityGood) {
        updateTaskReport(taskOrId, { quantityGood });
    }

    function setTaskQuantityScrap(taskOrId, quantityScrap) {
        updateTaskReport(taskOrId, { quantityScrap });
    }

    function setTaskIsRework(taskOrId, is_rework) {
        updateTaskReport(taskOrId, { is_rework });
    }

    function setTaskRemarks(taskOrId, remarks) {
        updateTaskReport(taskOrId, { remarks });
    }

    function setTaskRequiresQuantity(taskOrId, requiresQuantity) {
        updateTaskReport(taskOrId, { requiresQuantity });
    }

    function setTaskRequiresRemarks(taskOrId, requiresRemarks) {
        updateTaskReport(taskOrId, { requiresRemarks });
    }

    function clearTasks() {
        setTasks([]);
    }

    function replaceTasks(nextTasks) {
        setTasks(
            Array.isArray(nextTasks)
                ? nextTasks.map(normalizeTask)
                : []
        );
    }

    function submit() {
        if (typeof onSubmit !== 'function') return;

        onSubmit({
            tasks,
        });
    }

    //Computed

    const taskKeys = tasks
        .map((task) => getTaskKey(task))
        .filter(Boolean);

    const taskIds = tasks
        .map((task) => task.jira_id ?? task.id ?? null)
        .filter(Boolean);

    const totalQuantity = tasks.reduce(
        (sum, task) => sum + Number(task?.report?.quantity || 0),
        0
    );

    const totalQuantityGood = tasks.reduce(
        (sum, task) => sum + Number(task?.report?.quantityGood || 0),
        0
    );

    const totalQuantityScrap = tasks.reduce(
        (sum, task) => sum + Number(task?.report?.quantityScrap || 0),
        0
    );

    return {
        state: {
            tasks,
        },

        actions: {
            addTask,
            removeTask,
            clearTasks,
            replaceTasks,
            submit,
            updateTaskReport,
            setTaskQuantity,
            setTaskQuantityGood,
            setTaskQuantityScrap,
            setTaskIsRework,
            setTaskRemarks,
            setTaskRequiresQuantity,
            setTaskRequiresRemarks,
        },

        getters: {
            hasTask,
            getTaskById,
        },

        computed: {
            hasTasks: tasks.length > 0,
            tasksCount: tasks.length,
            taskKeys,
            taskIds,
            totalQuantity,
            totalQuantityGood,
            totalQuantityScrap,
        },
    };
}