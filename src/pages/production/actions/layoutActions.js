import {
    TABLES,
    getNextId,
    nowIso,
    readTable,
    writeTable,
} from "./localDb";

import {
    ProductionTaskLayoutSchema,
} from "../domain/schemas";

export const getLayoutsByIssue = issueId => {
    return readTable(TABLES.layouts)
        .filter(
            layout =>
                layout.issue_id === issueId &&
                !layout.is_deleted
        )
        .map(layout =>
            ProductionTaskLayoutSchema.parse(layout)
        );
};

export const upsertTaskLayout = ({
    issueId,
    taskId,
    position,
}) => {
    const rows = readTable(TABLES.layouts);

    const existing = rows.find(
        layout =>
            layout.issue_id === issueId &&
            layout.task_id === taskId &&
            !layout.is_deleted
    );

    const now = nowIso();

    if (existing) {
        const updated = ProductionTaskLayoutSchema.parse({
            ...existing,
            position_x: position.x,
            position_y: position.y,
            updated_at: now,
        });

        writeTable(
            TABLES.layouts,
            rows.map(layout =>
                layout.id === existing.id
                    ? updated
                    : layout
            )
        );

        return updated;
    }

    const layout = ProductionTaskLayoutSchema.parse({
        id: getNextId(rows),
        issue_id: issueId,
        task_id: taskId,

        position_x: position.x,
        position_y: position.y,

        node_type: "productionTask",
        is_hidden: false,
        is_locked: false,

        created_at: now,
        updated_at: now,

        is_deleted: false,
    });

    writeTable(TABLES.layouts, [...rows, layout]);

    return layout;
};