const isEmpty = (val, type) => {
    if (val == null || val === '') return true;

    if (type === 'number') {
        const parsed = parseFloat(String(val).replace(',', '.'));
        return isNaN(parsed) || parsed === 0;
    }

    if (type === 'string') {
        return String(val).trim() === '';
    }

    if (type === 'date') {
        if (val === '0000-00-00') return true;
        const time = new Date(val).getTime();
        return isNaN(time);
    }

    return false;
};

const parseNumberSafe = (val) => {
    const parsed = parseFloat(String(val).replace(',', '.'));
    return isNaN(parsed) ? null : parsed;
};

export const formatNumberPL = (num, fractionDigits = 2) => {
  if (typeof num !== 'number' || isNaN(num)) return '';
  return num
    .toLocaleString('pl-PL', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
};


export const getAggregatedValues = (data, columns) => {
    const result = {};

    columns.forEach(col => {
        const { field, aggregationFn, type } = col;
        if (!aggregationFn) return;

        const rawValues = data.map(row => row[field]);
        const values = rawValues.filter(v => v != null);

        switch (aggregationFn) {
            case 'sum': {
                if (type === 'number') {
                    const nums = values.map(parseNumberSafe).filter(v => v !== null);
                    result[field] = nums.reduce((acc, v) => acc + v, 0);
                } else {
                    result[field] = '-';
                }
                break;
            }


            case 'avg': {
                if (type === 'number') {
                    const nums = values.map(parseNumberSafe).filter(v => v !== null);
                    result[field] = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : '-';
                } else {
                    result[field] = '-';
                }
                break;
            }


            case 'min':
                if (type === 'number') {
                    const nums = values.map(parseNumberSafe).filter(v => v !== null);
                    result[field] = nums.length ? Math.min(...nums) : '-';
                } else if (type === 'date') {
                    const dates = values.map(v => new Date(v)).filter(d => !isNaN(d));
                    result[field] = dates.length ? new Date(Math.min(...dates)).toISOString().split('T')[0] : '-';
                } else {
                    result[field] = '-';
                }
                break;

            case 'max': {
                if (type === 'number') {
                    const nums = values.map(parseNumberSafe).filter(v => v !== null);
                    result[field] = nums.length ? Math.max(...nums) : '-';
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
                if (type === 'number') {
                    const nums = values.map(parseNumberSafe).filter(v => v !== null).sort((a, b) => a - b);
                    const mid = Math.floor(nums.length / 2);
                    result[field] = nums.length === 0
                        ? '-'
                        : nums.length % 2 !== 0
                            ? nums[mid]
                            : (nums[mid - 1] + nums[mid]) / 2;
                } else {
                    result[field] = '-';
                }
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

export const generateCollapseKey = (field, groupIndex) => `collapse_${field}_${groupIndex}`;

const nullValString = 'BrakDanych';

const resolveGroupKey = (value) => {
  if (value === null || value === undefined || value === '') {
    return nullValString;
  }
  return String(value);
};

/**
 * Hierarchiczna struktura grupowania danych z możliwością rozbudowy do widoku tabeli i eksportu.
 * Każdy poziom zawiera węzeł `group` + `aggregates`, zagnieżdżone `children`.
 *
 * @param {Array<Object>} data - dane wejściowe
 * @param {string[]} groupModel - pola grupujące (np. ['client', 'status'])
 * @param {Array<Object>} columns - definicje kolumn (z aggregationFn)
 * @returns {Array<Object>} - struktura drzewiasta do wizualizacji i eksportu
 */
export const groupDataHierarchical = (data, columns) => {
    const groupModel = columns.filter(c => c.groupBy).sort((a, b) => {
      const aIndex = a.groupIndex ?? Infinity;
      const bIndex = b.groupIndex ?? Infinity;
      return aIndex - bIndex;
    }).map(c => c.field);
    if (!Array.isArray(groupModel) || groupModel.length === 0) return data.map(row => ({ type: 'row', row }));

    const buildGroups = (rows, level = 0) => {
        if (level >= groupModel.length) {
            return rows.map(row => ({ type: 'row', row }));
        }

        const field = groupModel[level];
        const grouped = {};

        rows.forEach(row => {
            const key = resolveGroupKey(row[field]);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(row);
        });

        return Object.entries(grouped).map(([key, groupRows]) => {
            const value = key === nullValString ? nullValString : key;
            const children = buildGroups(groupRows, level + 1);
            const aggregates = getAggregatedValues(groupRows, columns);

            return {
                type: 'group',
                level,
                field,
                value,
                aggregates,
                rows: groupRows,
                children,
            };
        });
    };

    return buildGroups(data);
};

export const sortData = (data = [], sortModel = [], columns = []) => {
    if (!Array.isArray(data) || data.length === 0 || sortModel.length === 0) {
        return data;
    }

    const getColumnType = (field) =>
        columns.find(col => col.field === field)?.type || 'string';

    return [...data].sort((a, b) => {
        for (let sort of sortModel) {
            const { field, direction } = sort;
            const type = getColumnType(field);

            let aValue = a[field];
            let bValue = b[field];

            // Null-safe fallback
            if (aValue === null || aValue === undefined) aValue = '';
            if (bValue === null || bValue === undefined) bValue = '';

            // Type-aware casting
            switch (type) {
                case 'number':
                    aValue = typeof aValue === 'number' ? aValue : parseFloat(String(aValue).replace(',', '.'));
                    bValue = typeof bValue === 'number' ? bValue : parseFloat(String(bValue).replace(',', '.'));
                    if (isNaN(aValue)) aValue = 0;
                    if (isNaN(bValue)) bValue = 0;
                    break;

                case 'date':
                    aValue = new Date(aValue).getTime() || 0;
                    bValue = new Date(bValue).getTime() || 0;
                    break;

                case 'boolean':
                    aValue = aValue ? 1 : 0;
                    bValue = bValue ? 1 : 0;
                    break;

                default:
                    aValue = String(aValue).toLowerCase();
                    bValue = String(bValue).toLowerCase();
            }

            if (aValue === bValue) continue;

            const result = aValue > bValue ? 1 : -1;
            return direction === 'asc' ? result : -result;
        }

        return 0;
    });
};

