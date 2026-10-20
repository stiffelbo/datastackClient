
export const getTree = (items, id, fieldName = "parent_id") => {
    const byId = new Map(
        items.map(item => [String(item.id), item])
    );

    const rootItem = byId.get(String(id));
    if (!rootItem) return [];

    // 1. Znajdź głównego przodka
    let root = rootItem;
    const ancestors = new Set();

    while (
        root[fieldName] != null &&
        byId.has(String(root[fieldName])) &&
        !ancestors.has(String(root.id))
    ) {
        ancestors.add(String(root.id));
        root = byId.get(String(root[fieldName]));
    }

    // 2. Zbuduj mapę rodzic -> dzieci
    const childrenMap = new Map();

    items.forEach(item => {
        if (item[fieldName] == null) return;

        const parentId = String(item[fieldName]);

        if (!childrenMap.has(parentId)) {
            childrenMap.set(parentId, []);
        }

        childrenMap.get(parentId).push(item);
    });

    // 3. Rekurencyjnie zbierz całe drzewo
    const visited = new Set();

    const collect = (itemId) => {
        const key = String(itemId);

        if (visited.has(key)) return;
        visited.add(key);

        (childrenMap.get(key) || []).forEach(child => {
            collect(child.id);
        });
    };

    collect(root.id);

    // 4. Zwróć płaską tablicę, unique po id
    return items.filter(item => visited.has(String(item.id)));
};
