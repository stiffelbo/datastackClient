const dagLayout = ({
    dag,
    nodeWidth = 240,
    nodeHeight = 100,
    columnGap = 80,
    rowGap = 30,
    padding = 30,
    direction = 'LR',
}) => {
    const nodes = [];
    const edges = [];
    const positionsMap = {};

    let width = 0;
    let height = 0;

    const isHorizontal = direction === 'LR';

    // 1. Pusty lub nieprawidłowy graf
    if (!dag.isValid || dag.isEmpty) {
        return {
            nodes,
            edges,
            positionsMap,
            width,
            height,
            nodeWidth,
            nodeHeight,
            direction,
        };
    }

    // 2. Parametry osi
    const primarySize = isHorizontal ? nodeWidth : nodeHeight;
    const secondarySize = isHorizontal ? nodeHeight : nodeWidth;

    const primaryGap = isHorizontal ? columnGap : rowGap;
    const secondaryGap = isHorizontal ? rowGap : columnGap;

    // 3. Maksymalna liczba zadań na jednym poziomie
    const maxLevelSize = Math.max(
        ...dag.levels.map(level => {
            return level.length;
        })
    );

    // 4. Wymiary całego grafu
    const primaryExtent =
        dag.levelsCount * primarySize
        + Math.max(0, dag.levelsCount - 1) * primaryGap;

    const secondaryExtent =
        maxLevelSize * secondarySize
        + Math.max(0, maxLevelSize - 1) * secondaryGap;

    width = (isHorizontal ? primaryExtent : secondaryExtent) + padding * 2;
    height = (isHorizontal ? secondaryExtent : primaryExtent) + padding * 2;

    // 5. Pozycjonowanie poziomów
    for (let levelIndex = 0; levelIndex < dag.levels.length; levelIndex++) {
        const level = dag.levels[levelIndex];

        const levelExtent =
            level.length * secondarySize
            + Math.max(0, level.length - 1) * secondaryGap;

        // Centrowanie poziomu względem całego grafu
        const secondaryOffset = (secondaryExtent - levelExtent) / 2;

        for (let index = 0; index < level.length; index++) {
            const id = level[index];
            const node = dag.nodesMap[id];

            const primary =
                padding + levelIndex * (primarySize + primaryGap);

            const secondary =
                padding + secondaryOffset
                + index * (secondarySize + secondaryGap);

            const position = {
                x: isHorizontal ? primary : secondary,
                y: isHorizontal ? secondary : primary,
            };

            positionsMap[id] = position;

            nodes.push({
                ...node,
                position,
                width: nodeWidth,
                height: nodeHeight,
            });
        }
    }

    // 6. Przeniesienie relacji
    for (const edge of dag.edges) {
        edges.push({
            ...edge,
        });
    }

    return {
        nodes,
        edges,
        positionsMap,

        width,
        height,

        nodeWidth,
        nodeHeight,
        direction,
    };
};

export default dagLayout;