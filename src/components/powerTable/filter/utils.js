import { startOfDay, parseDate } from './dateUtils';

export const operatorsByType = {
    string: ['multiSelect', 'contains', 'isEmpty', 'notEmpty'],
    number: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between', 'isEmpty', 'notEmpty'],
    date: ['between', 'isEmpty', 'notEmpty', 'isPast', 'isFuture'],
    boolean: ['isTrue', 'isFalse', 'isEmpty', 'notEmpty'],
    fk: ['fk']
};

export const defaultFilterValue = (op, type) => {
    if (op === 'between') return { min: '', max: '' };
    if (op === 'fk' || op === 'FK') return { include: [], exclude: [] };
    if (op === 'multiSelect') return { include: [], exclude: [] };
    if (['isEmpty', 'notEmpty', 'isTrue', 'isFalse'].includes(op)) return null;
    return type === 'number' ? 0 : '';
};

export const createFilter = (field, type = 'string') => {
    const firstOp = operatorsByType[type] ? operatorsByType[type][0] : null;
    const newFilter = {
        id: Date.now(),                          // 👈 timestamp jako unikalne id
        field,
        type,
        op: firstOp,
        value: defaultFilterValue(firstOp, type),
    };
    return newFilter;
};

export const getUniqueOptions = (data, field) => {
    const set = new Set();
    data.forEach(row => {
        if (row[field] !== undefined && row[field] !== null) set.add(row[field]);
    });
    return Array.from(set).sort();
};

/* ============================================================
   FILTROWANIE
   ============================================================ */

/**
 * Zastosuj jeden filtr do wartości
 */
export const applyFilterToValue = (rawValue, filter, type) => {
    const { op, value } = filter;

    const isEmpty = rawValue === null || rawValue === undefined || rawValue === '';
    console.log(filter, value, rawValue);
    if (op === 'isEmpty') return isEmpty;
    if (op === 'notEmpty') return !isEmpty;

    //FK
    if(type === 'fk'){
        if (op === 'fk') {
            const { include = [], exclude = [] } = value || {};
            if (include.length && !include.includes(rawValue)) return false;
            if (exclude.length && exclude.includes(rawValue)) return false;
            return true;
        }
    }

    // STRING
    if (type === 'string') {
        const val = String(rawValue ?? '').toLowerCase();
        const fval = String(value ?? '').toLowerCase();
        
        if (op === 'equals') return val === fval;
        if (op === 'notEquals') return val !== fval;
        if (op === 'contains') return val.includes(fval);
        if (op === 'startsWith') return val.startsWith(fval);
        if (op === 'endsWith') return val.endsWith(fval);

        if (op === 'multiSelect') {
            const { include = [], exclude = [] } = value || {};
            console.log(include, exclude, value);
            if (include.length && !include.includes(rawValue)) return false;
            if (exclude.length && exclude.includes(rawValue)) return false;
            return true;
        }

        // 👇 jeśli żaden stringowy operator nie pasował
        return false;
    }

    // NUMBER
    if (type === 'number') {
        if (rawValue === '') return true;
        const num = +(String(rawValue).replace(',', '.'));
        if (isNaN(num)) return true;

        if (op === 'equals') return num === Number(value);
        if (op === 'notEquals') return num !== Number(value);
        if (op === 'gt') return num > Number(value);
        if (op === 'gte') return num >= Number(value);
        if (op === 'lt') return num < Number(value);
        if (op === 'lte') return num <= Number(value);
        if (op === 'between') {
            const { min, max } = value || {};
            if (min !== '' && num < Number(min)) return false;
            if (max !== '' && num > Number(max)) return false;
            return true;
        }

        return false;
    }

    // DATE
    if (type === 'date') {
        // puste wartości
        if (!rawValue) {
            if (op === 'isEmpty') return true;
            if (op === 'notEmpty') return false;
            return false;
        }
        const d = parseDate(rawValue);

        if (!d) return false;

        if (op === 'isEmpty') return false;
        if (op === 'notEmpty') return true;

        if (op === 'between') {
            const { min, max } = value || {};
            if (min) {
                const minDate = parseDate(min);
                if (minDate && d < minDate) return false;
            }
            if (max) {
                const maxDate = parseDate(max);
                if (maxDate && d > maxDate) return false;
            }
            return true; // mieści się w przedziale lub brak granicy
        }

        if (op === 'isPast') {
            return d < startOfDay(new Date()); // cokolwiek przed dzisiaj
        }

        if (op === 'isFuture') {
            return d > startOfDay(new Date()); // cokolwiek po dzisiaj
        }

        return false;
    }


    // BOOLEAN
    if (type === 'boolean') {
        if (op === 'isTrue') return rawValue === true;
        if (op === 'isFalse') return rawValue === false;
        return false;
    }

    return false; // 👈 default powinien być false, nie true!
};

/**
 * Filtruj cały dataset
 */

export const applyFilters = ({data = [], columnsSchema = {}, omit = [], selectedIds = []}) => {

    const fieldsNotToJoinForSlug = ['created_by', 'deleted_by', 'updated_by'];

    const columns = columnsSchema.columns || [];
    const globalSearch = columnsSchema.globalSearch;
    const showSelected = columnsSchema.showSelected;

    const optionsDict = {
        //field : {val : label, val : label, val : label...},
        //field : {val : label, val : label, val : label...},
    };

    columns.forEach(column => {
        if(column.optionsMap && Object.keys(column.optionsMap).length > 0){
            if(!fieldsNotToJoinForSlug.includes(column.field)){
                optionsDict[column.field] = column.optionsMap;
            }
        }
    });

    const fieldsToJoin = Object.keys(optionsDict) || [];

    return data.filter((row) => {
        if(showSelected){
            if(!selectedIds.length){
                columnsSchema.setShowSelected(false);
            }else{
                if(!selectedIds.includes(+row.id)){
                    return false;
                };
            }            
        }

        // --- GLOBAL SLUG SEARCH ---
        if (globalSearch && globalSearch.trim()) {
            const normalized = globalSearch.replace(/\s+/g, ';'); // spacje = OR
            const orGroups = normalized.split(';').map(g => g.trim()).filter(Boolean);
            let rowSlug = Object.values(row).join(' ').toLowerCase();
            fieldsToJoin.forEach(field => {
                rowSlug += ` ${optionsDict[field][row[field]]}`;
            });

            const matchGlobal = orGroups.some(group => {
                const terms = group.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
                return terms.every(term => rowSlug.includes(term));
            });

            if (!matchGlobal) return false;
        }

        // --- COLUMN FILTERS ---
        for (const col of columns) {
            const filters = (col.filters || []).filter(f => !omit.includes(f.id));
            if (!filters.length) continue;

            const rawValue = row[col.field];
            if (!filters.every(f => applyFilterToValue(rawValue, f, col.type || 'string'))) {
                return false;
            }
        }

        return true;
    });
};



