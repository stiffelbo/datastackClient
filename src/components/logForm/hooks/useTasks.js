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

export default function useTasks({ onSubmit, initialValues = {}, requiresQuantity = true, requiresRemarks = false }) {
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

            return [
                ...prev,
                {
                    ...task,
                    report: {
                        quantity: task?.report?.quantity ?? null,
                        remarks: task?.report?.remarks ?? "",
                        requiresQuantity: requiresQuantity, 
                        requiresRemarks: requiresRemarks
                    },
                },
            ];
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

    function setTaskQuantity(taskOrId, quantity) {
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
                            quantity,
                        },
                    }
                    : task
            )
        );
    }

    function setTaskRemarks(taskOrId, remarks) {

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
                            remarks,
                        },
                    }
                    : task
            )
        );
    }

    function clearTasks() {
        setTasks([]);
    }

    function replaceTasks(nextTasks) {
        if (!Array.isArray(nextTasks)) {
            setTasks([]);
            return;
        }

        setTasks(
            nextTasks.map((task) => ({
                ...task,
                report: {
                    quantity: task?.report?.quantity ?? null,
                },
            }))
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

    return {
        state: {
            tasks,
        },

        actions: {
            addTask,
            removeTask,
            clearTasks,
            replaceTasks,
            setTaskQuantity,
            setTaskRemarks,
            submit,
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
            requiresQuantity,
            requiresRemarks,
        },
    };
}