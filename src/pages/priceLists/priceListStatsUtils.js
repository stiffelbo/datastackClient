export const buildEnnoblingStats = (orders = [], ennoblings = []) => {
    const dictionary = new Map(
        ennoblings
            .filter(item => item.code)
            .map(item => [item.code.trim(), item])
    );

    const aggregation = new Map();
    const totalOrders = orders.length;

    for (const order of orders) {
        const codes = new Set(
            String(order.content_code ?? '')
                .split('_')
                .map(code => code.trim())
                .filter(Boolean)
        );

        const qtyOrdered = Number(order.qty_ordered) || 0;
        const qtyDone = Number(order.qty_done) || 0;

        for (const code of codes) {
            const ennobling = dictionary.get(code);

            // Pomijamy atomy spoza słownika uszlachetnień
            if (!ennobling) continue;

            if (!aggregation.has(code)) {
                aggregation.set(code, {
                    ...ennobling,
                    orders_count: 0,
                    qty_ordered: 0,
                    qty_done: 0,
                    order_ids: [],
                });
            }

            const item = aggregation.get(code);

            item.orders_count++;
            item.qty_ordered += qtyOrdered;
            item.qty_done += qtyDone;
            item.order_ids.push(order.id);
        }
    }

    return Array.from(aggregation.values())
        .map(item => ({
            ...item,

            usage_percent: totalOrders > 0
                ? Math.round(item.orders_count / totalOrders * 10000) / 100
                : 0,

            avg_qty_ordered: item.orders_count > 0
                ? Math.round(item.qty_ordered / item.orders_count)
                : 0,
        }))
        .sort((a, b) =>
            b.orders_count - a.orders_count
            || a.name.localeCompare(b.name, 'pl')
        );
};