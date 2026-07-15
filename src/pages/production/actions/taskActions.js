import {
    TABLES,
    getNextId,
    nowIso,
    readTable,
    writeTable,
} from "./localDb";

import { ProductionTaskSchema } from "../domain/schemas";

export const getTasksByIssue = issueId => {
    return readTable(TABLES.tasks)
        .filter(
            task =>
                task.issue_id === issueId &&
                !task.is_deleted
        )
        .map(task => ProductionTaskSchema.parse(task));
};

export const createTaskFromProcess = ({
    issueId,
    process,
}) => {
    const rows = readTable(TABLES.tasks);
    const issueTasks = rows.filter(
        task =>
            task.issue_id === issueId &&
            !task.is_deleted
    );

    const now = nowIso();

    const task = ProductionTaskSchema.parse({
        id: getNextId(rows),
        issue_id: issueId,

        process_id: process.id,
        name: process.name,

        task_type: process.process_class ?? "production",
        status: "draft",

        output_label: process.name,
        output_unit: null,

        target_qty: null,
        sequence_no: issueTasks.length + 1,

        created_at: now,
        updated_at: now,

        is_deleted: false,
    });

    writeTable(TABLES.tasks, [...rows, task]);

    return task;
};

export const deleteTaskFromProcess = ({ id }) => {
    const taskId = Number(id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
        throw new Error("Nieprawidłowe ID taska.");
    }

    const tasks = readTable(TABLES.tasks);
    const relations = readTable(TABLES.relations);
    const layouts = readTable(TABLES.layouts);

    const taskExists = tasks.some(
        task =>
            task.id === taskId &&
            !task.is_deleted
    );

    if (!taskExists) {
        throw new Error("Task nie istnieje albo został już usunięty.");
    }

    const now = nowIso();

    const updatedTasks = tasks.map(task =>
        task.id === taskId
            ? {
                  ...task,
                  is_deleted: true,
                  status: "canceled",
                  updated_at: now,
                  deleted_at: now,
              }
            : task
    );

    const updatedRelations = relations.map(relation => {
        const isConnected =
            relation.from_task_id === taskId ||
            relation.to_task_id === taskId;

        return isConnected
            ? {
                  ...relation,
                  is_active: false,
                  is_deleted: true,
                  updated_at: now,
                  deleted_at: now,
              }
            : relation;
    });

    const updatedLayouts = layouts.map(layout =>
        layout.task_id === taskId
            ? {
                  ...layout,
                  is_deleted: true,
                  updated_at: now,
                  deleted_at: now,
              }
            : layout
    );

    /*
     * localStorage nie obsługuje prawdziwych transakcji.
     * Najpierw przygotowujemy wszystkie zmiany w pamięci,
     * a następnie zapisujemy komplet tabel.
     */
    writeTable(TABLES.tasks, updatedTasks);
    writeTable(TABLES.relations, updatedRelations);
    writeTable(TABLES.layouts, updatedLayouts);

    return {
        taskId,
        deletedRelationsCount: relations.filter(
            relation =>
                !relation.is_deleted &&
                (
                    relation.from_task_id === taskId ||
                    relation.to_task_id === taskId
                )
        ).length,
        deletedLayoutsCount: layouts.filter(
            layout =>
                !layout.is_deleted &&
                layout.task_id === taskId
        ).length,
    };
};