const dagDto = ({ tasks = [] }) => {
    const nodes = [];
    const edges = [];

    const nodesMap = {};
    const predecessorsMap = {};
    const successorsMap = {};
    const levelsMap = {};

    const roots = [];
    const leaves = [];
    const levels = [];
    const orderedIds = [];
    const errors = [];

    // 1. Uporządkowanie zadań
    const sortedTasks = [...tasks].sort((a, b) => {
        return Number(a.sequence_no) - Number(b.sequence_no)
            || Number(a.id) - Number(b.id);
    });

    // 2. Rejestracja węzłów
    for (const task of sortedTasks) {
        const id = Number(task.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            errors.push(`Nieprawidłowe ID zadania: ${task.id}`);
            continue;
        }

        if (nodesMap[id]) {
            errors.push(`Zduplikowane zadanie #${id}`);
            continue;
        }

        const node = {
            id,
            task,
            level: null,
            isRoot: false,
            isLeaf: false,
        };

        nodes.push(node);

        nodesMap[id] = node;
        predecessorsMap[id] = [];
        successorsMap[id] = [];
    }

    // 3. Interpretacja code i budowanie relacji
    for (const node of nodes) {
        const { id, task } = node;

        let code;

        try {
            code = typeof task.code === 'string'
                ? JSON.parse(task.code)
                : task.code;
        } catch {
            errors.push(`Nieprawidłowy JSON zadania #${id}`);
            continue;
        }

        if (!code || !Array.isArray(code.prev)) {
            errors.push(`Brak poprawnej definicji DAG zadania #${id}`);
            continue;
        }

        const predecessors = new Set();

        for (const value of code.prev) {
            const predecessorId = Number(value);

            if (!Number.isSafeInteger(predecessorId) || predecessorId <= 0) {
                errors.push(`Nieprawidłowy poprzednik zadania #${id}`);
                continue;
            }

            if (predecessorId === id) {
                errors.push(`Zadanie #${id} wskazuje samo na siebie`);
                continue;
            }

            if (!nodesMap[predecessorId]) {
                errors.push(
                    `Zadanie #${id} wskazuje na nieistniejące zadanie #${predecessorId}`
                );
                continue;
            }

            if (predecessors.has(predecessorId)) {
                errors.push(
                    `Zduplikowana zależność #${predecessorId} → #${id}`
                );
                continue;
            }

            predecessors.add(predecessorId);

            predecessorsMap[id].push(predecessorId);
            successorsMap[predecessorId].push(id);

            edges.push({
                id: `${predecessorId}-${id}`,
                source: predecessorId,
                target: id,
            });
        }
    }

    // 4. Korzenie i liście
    for (const node of nodes) {
        const { id } = node;

        node.isRoot = predecessorsMap[id].length === 0;
        node.isLeaf = successorsMap[id].length === 0;

        if (node.isRoot) {
            roots.push(id);
        }

        if (node.isLeaf) {
            leaves.push(id);
        }
    }

    // 5. Przygotowanie sortowania topologicznego
    const inDegree = {};
    const queue = [...roots];

    for (const node of nodes) {
        inDegree[node.id] = predecessorsMap[node.id].length;
        levelsMap[node.id] = null;
    }

    for (const id of roots) {
        levelsMap[id] = 0;
    }

    // 6. Algorytm Kahna i wyznaczanie poziomów
    while (queue.length > 0) {
        const id = queue.shift();
        const level = levelsMap[id];

        orderedIds.push(id);

        nodesMap[id].level = level;

        levels[level] ??= [];
        levels[level].push(id);

        for (const successorId of successorsMap[id]) {
            levelsMap[successorId] = Math.max(
                levelsMap[successorId] ?? 0,
                level + 1
            );

            inDegree[successorId]--;

            if (inDegree[successorId] === 0) {
                queue.push(successorId);
            }
        }
    }

    // 7. Wykrywanie cykli
    const unresolvedIds = nodes
        .filter(node => {
            return inDegree[node.id] > 0;
        })
        .map(node => {
            return node.id;
        });

    if (unresolvedIds.length > 0) {
        errors.push(
            `Wykryto cykl w grafie. Nierozwiązane zadania: ${unresolvedIds.join(', ')}`
        );

        for (const id of unresolvedIds) {
            levelsMap[id] = null;
        }
    }

    // 8. Porządkowanie zadań wewnątrz poziomów
    for (const level of levels) {
        level.sort((a, b) => {
            return Number(nodesMap[a].task.sequence_no)
                - Number(nodesMap[b].task.sequence_no)
                || a - b;
        });
    }

    return {
        nodes,
        edges,

        nodesMap,
        predecessorsMap,
        successorsMap,
        levelsMap,

        roots,
        leaves,
        levels,
        orderedIds,
        unresolvedIds,

        nodesCount: nodes.length,
        edgesCount: edges.length,
        levelsCount: levels.length,

        isEmpty: nodes.length === 0,
        isValid: errors.length === 0,

        errors,
    };
};

export default dagDto;