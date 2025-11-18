import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

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
                case 'fk':
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


/**
 * Flattenuje drzewo grup do płaskiej listy elementów,
 * z uwzględnieniem collapseState.
 *
 * @param {Array} nodes - wynik groupDataHierarchical
 * @param {object} collapseState - { 'HR/Administrator': true|false }
 * @param {Array} ancestor - aktualna ścieżka grup
 * @param {number} level - aktualny poziom zagnieżdżenia
 * @returns {Array} płaska lista elementów
 */
export const flattenGroupedData = (nodes = [], collapseState = {}, ancestor = [], level = 0) => {
  const result = [];

  for (const node of nodes) {
    if (node.type === 'group') {
      const path = [...ancestor, node.value].join('/');
      const isCollapsed = collapseState?.[path] === true;

      result.push({
        type: 'group',
        level,
        path,
        field: node.field,
        value: node.value,
        rows: node.rows,
        aggregates: node.aggregates,
      });

      // jeśli grupa otwarta — rekurencja dla dzieci
      if (!isCollapsed && Array.isArray(node.children)) {
        const children = flattenGroupedData(node.children, collapseState, [...ancestor, node.value], level + 1);
        result.push(...children);
      }
    } else if (node.type === 'row') {
      result.push({
        type: 'row',
        level,
        path: [...ancestor, node.value].join('/'),
        row: node.row,
      });
    }
  }

  return result;
};

//Export
/**
 * Eksportuje dane do Excela zgodnie ze schematem kolumn
 * @param {Array} data - dane (tablica obiektów)
 * @param {Array} columns - schema kolumn (field, headerName, order)
 * @param {string} filename - nazwa pliku
 * @param {string} sheetName - nazwa arkusza
 */
export const exportToXLSWithSchema = (
  data = [],
  columns = [],
  filename = 'export.xlsx',
  sheetName = 'Sheet1'
) => {
  if (!Array.isArray(data) || data.length === 0) {
    toast.warning('Brak danych do przetworzenia dla pliku: ' + sheetName);
    return;
  }

  // sortowanie kolumn po "order"
  const visibleColumns = columns
    .filter(col => col.type !== 'action')
    .filter(col => !col.hidden)
    .sort((a, b) => a.order - b.order);

  const headers = visibleColumns.map(col => col.headerName);
  const fields = visibleColumns.map(col => col.field);

  // przemodelowanie danych pod kolejność pól + konwersja liczb
  const mappedData = data.map(row =>
    fields.map(field => {
      let value = row[field] ?? '';

      // konwersja liczbowych stringów
      if (typeof value === 'string' && /^\d+([.,]\d+)?$/.test(value)) {
        value = parseFloat(value.replace(',', '.'));
      }

      return value;
    })
  );

  // budujemy arkusz
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...mappedData]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, filename);
};

export const computeViewSelection = ({ data = [], selectedIds = [] }) => {
  const viewIds = Array.isArray(data) ? data.map((r) => (r.row ? r.row.id : r.id)) : [];
  const selSet = new Set(selectedIds || []);
  const selectedInView = viewIds.filter((id) => selSet.has(id));
  const notSelectedInView = viewIds.filter((id) => !selSet.has(id));
  return { viewIds, selectedInView, notSelectedInView };
};

//TRee data
// utils.js

/**
 * Buduje drzewo po parentField.
 * Zwraca:
 *  - roots: tablica węzłów root
 *  - map:   id -> node
 *
 * node ma postać: { ...row, children: [] }
 */
export const buildTreeByParent = (
  data = [],
  {
    idField = 'id',
    parentField = 'parent_id',
    rootValue = null, // np. null albo 0
  } = {}
) => {
  const map = {};
  const roots = [];

  // Tworzymy węzły
  data.forEach((row) => {
    const id = row[idField];
    if (id == null) return;
    map[id] = { ...row, children: [] };
  });

  // Łączymy parent → children
  data.forEach((row) => {
    const id = row[idField];
    const parentId = row[parentField];
    const node = map[id];
    if (!node) return;

    const isRoot =
      parentId === rootValue ||
      parentId == null ||
      !map[parentId]; // brak rodzica w danych → też root

    if (isRoot) {
      roots.push(node);
    } else {
      map[parentId].children.push(node);
    }
  });

  // 🔹 policz wszystkich potomków dla każdego node'a
  const countDescendants = (node) => {
    let count = 0;
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children.forEach((child) => {
        count += 1; // samo dziecko
        count += countDescendants(child); // jego potomkowie
      });
    }
    node.__totalDescendants = count; // zapisujemy meta na node'cie
    return count;
  };

  roots.forEach((root) => {
    countDescendants(root);
  });

  return [roots, map];
};


/**
 * Spłaszcza drzewo do listy, z poziomem i path.
 * collapseState: { [path]: true } oznacza ZWINIĘTY węzeł.
 *
 * Zwraca tablicę "węzłów": {
 *   row:      obiekt danych z meta,
 *   level:    number,
 *   path:     string,
 *   hasChildren: boolean,
 * }
 */
export const flattenTree = (
  roots = [],
  collapseState = {},
  { idField = 'id' } = {}
) => {
  const result = [];

  const walk = (nodes, level = 0, ancestorPath = []) => {
    nodes.forEach((node) => {
      const id = node[idField];
      const pathArr = [...ancestorPath, id];
      const path = pathArr.join('/');
      const children = node.children || [];
      const hasChildren = children.length > 0;
      const collapsed = collapseState[path] === true;

      const totalDescendants = node.__totalDescendants ?? 0;

      // wzbogacamy row o meta (nie mutujemy oryginału z zewnątrz)
      const rowWithMeta = {
        ...node,
        __treeLevel: level,
        __treePath: path,
        __treeHasChildren: hasChildren,
        __childrenCount: totalDescendants,  // 🔹 liczba wszystkich potomków
        __treeCollapsed: collapsed,
      };

      result.push({
        type: 'node',
        row: rowWithMeta,
        level,
        path,
        hasChildren,
      });

      if (!collapsed && hasChildren) {
        walk(children, level + 1, pathArr);
      }
    });
  };

  walk(roots, 0, []);
  return result;
};

