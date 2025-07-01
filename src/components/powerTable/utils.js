const isEmpty = (val, type) => {
    if (val == null) return true;
    if (type === 'number') return val === 0;
    if (type === 'string') return val.trim() === '';
    if (type === 'date') return val === '0000-00-00' || isNaN(new Date(val).getTime());
    return false;
};


export const getAggregatedValues = (data, columns) => {
    const result = {};

    columns.forEach(col => {
        const { field, aggregationFn, type } = col;
        if (!aggregationFn) return;

        const rawValues = data.map(row => row[field]);
        const values = rawValues.filter(v => v != null);

        switch (aggregationFn) {
            case 'sum':
                result[field] = type === 'number'
                    ? values.reduce((acc, v) => acc + (parseFloat(v) || 0), 0)
                    : '-';
                break;

            case 'avg':
                result[field] = type === 'number' && values.length
                    ? values.reduce((acc, v) => acc + (parseFloat(v) || 0), 0) / values.length
                    : '-';
                break;

            case 'min': {
                if (type === 'number') {
                    result[field] = Math.min(...values.map(v => +v));
                } else if (type === 'date') {
                    const dates = values.map(v => new Date(v)).filter(d => !isNaN(d));
                    const minDate = new Date(Math.min(...dates));
                    result[field] = isNaN(minDate) ? '-' : minDate.toISOString().split('T')[0];
                } else {
                    result[field] = '-';
                }
                break;
            }

            case 'max': {
                if (type === 'number') {
                    result[field] = Math.max(...values.map(v => +v));
                } else if (type === 'date') {
                    const dates = values.map(v => new Date(v)).filter(d => !isNaN(d));
                    const maxDate = new Date(Math.max(...dates));
                    result[field] = isNaN(maxDate) ? '-' : maxDate.toISOString().split('T')[0];
                } else {
                    result[field] = '-';
                }
                break;
            }

            case 'median': {
                if (type !== 'number' || values.length === 0) {
                    result[field] = '-';
                    break;
                }
                const sorted = values.map(v => parseFloat(v)).sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                result[field] = sorted.length % 2 !== 0
                    ? sorted[mid]
                    : (sorted[mid - 1] + sorted[mid]) / 2;
                break;
            }

            case 'count':
                result[field] = values.length;
                break;

            case 'countDistinct': {
                const normalized = values.map(v => {
                    if (type === 'date') {
                        const date = new Date(v);
                        return isNaN(date) ? null : date.toISOString().split('T')[0];
                    }
                    return typeof v === 'string' ? v.trim() : v;
                }).filter(v => v !== null);
                result[field] = new Set(normalized).size;
                break;
            }

            case 'empty':
                result[field] = rawValues.filter(v => isEmpty(v, type)).length;
                break;

            case 'notEmpty':
                result[field] = rawValues.filter(v => !isEmpty(v, type)).length;
                break;

            default:
                if (typeof aggregationFn === 'function') {
                    result[field] = aggregationFn(values, data);
                } else {
                    result[field] = '-';
                }
        }
    });

    return result;
};
