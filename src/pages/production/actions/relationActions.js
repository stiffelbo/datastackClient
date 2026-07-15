import {
    TABLES,
    getNextId,
    nowIso,
    readTable,
    writeTable,
} from "./localDb";

import {
    ProductionTaskRelationSchema,
} from "../domain/schemas";

export const getRelationsByIssue = issueId => {
    return readTable(TABLES.relations)
        .filter(
            relation =>
                relation.issue_id === issueId &&
                relation.is_active &&
                !relation.is_deleted
        )
        .map(relation =>
            ProductionTaskRelationSchema.parse(relation)
        );
};

const hasPath = ({
    relations,
    startTaskId,
    targetTaskId,
}) => {
    const adjacency = new Map();

    relations.forEach(relation => {
        if (!relation.is_active || relation.is_deleted) {
            return;
        }

        const outgoing =
            adjacency.get(relation.from_task_id) ?? [];

        outgoing.push(relation.to_task_id);
        adjacency.set(relation.from_task_id, outgoing);
    });

    const visited = new Set();
    const stack = [startTaskId];

    while (stack.length) {
        const current = stack.pop();

        if (current === targetTaskId) {
            return true;
        }

        if (visited.has(current)) {
            continue;
        }

        visited.add(current);

        const outgoing = adjacency.get(current) ?? [];
        stack.push(...outgoing);
    }

    return false;
};

export const createRelation = ({
    issueId,
    fromTaskId,
    toTaskId,
    relationType = "flow",
}) => {
    if (fromTaskId === toTaskId) {
        throw new Error(
            "Task nie może być połączony sam ze sobą."
        );
    }

    const rows = readTable(TABLES.relations);

    const activeRelations = rows.filter(
        relation =>
            relation.issue_id === issueId &&
            relation.is_active &&
            !relation.is_deleted
    );

    const duplicate = activeRelations.some(
        relation =>
            relation.from_task_id === fromTaskId &&
            relation.to_task_id === toTaskId &&
            relation.relation_type === relationType
    );

    if (duplicate) {
        throw new Error("Taka relacja już istnieje.");
    }

    /*
     * Dodanie from -> to utworzy cykl, jeżeli obecnie
     * istnieje już ścieżka to -> from.
     */
    const createsCycle = hasPath({
        relations: activeRelations,
        startTaskId: toTaskId,
        targetTaskId: fromTaskId,
    });

    if (createsCycle) {
        throw new Error(
            "Nie można utworzyć relacji — powstałby cykl."
        );
    }

    const now = nowIso();

    const relation = ProductionTaskRelationSchema.parse({
        id: getNextId(rows),
        issue_id: issueId,

        from_task_id: fromTaskId,
        to_task_id: toTaskId,

        relation_type: relationType,
        is_required: true,
        is_active: true,

        created_at: now,
        updated_at: now,

        is_deleted: false,
    });

    writeTable(TABLES.relations, [...rows, relation]);

    return relation;
};

export const deleteRelation = relationId => {
    const rows = readTable(TABLES.relations);
    const now = nowIso();

    const updatedRows = rows.map(relation => {
        if (relation.id !== relationId) {
            return relation;
        }

        return {
            ...relation,
            is_active: false,
            is_deleted: true,
            updated_at: now,
        };
    });

    writeTable(TABLES.relations, updatedRows);
};