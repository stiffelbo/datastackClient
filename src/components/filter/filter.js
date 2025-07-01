// filter.js - Centralized Filtering Logic

export const filterSlug = ({ data = [], fields = [], val = '' }) => {
    if (!val) return data;
  
    // Normalize input:
    const normalized = val.replace(/\s+/g, ';'); // space = OR
    const orGroups = normalized.split(';').map(group => group.trim()).filter(Boolean);
  
    return data.filter(item => {
      const searchableFields = fields.length > 0 ? fields : Object.keys(item);
      const itemSlug = searchableFields.map(f => item[f] ?? '').join(' ').toLowerCase();
  
      // Each OR group can be a comma-separated AND clause
      return orGroups.some(group => {
        const terms = group.split(',').map(term => term.trim().toLowerCase()).filter(Boolean);
        return terms.every(term => itemSlug.includes(term));
      });
    });
  };
  

export const filterSelect = ({ data = [], fields = [], val = '' }) => {
    return data.filter(item => `${item[fields[0]]}` === `${val}`);
};

export const filterTransistorSelect = ({ data = [], fields = [], filters = {}, delimiter = null }) => {
    if (!filters.include && !filters.exclude) return data;

    return data.filter((item) => {
        const values = fields.map((field) => item[field]).filter(Boolean);
        let processedValues = delimiter
            ? values.flatMap((value) => value.split(delimiter).map((tag) => tag.trim().toLowerCase()))
            : [values.join(' ').toLowerCase()];

        const matchesInclude = filters.include.length
            ? filters.include.some((includedValue) =>
                processedValues.some((processed) => processed.includes(includedValue.toLowerCase()))
            )
            : true;

        const matchesExclude = filters.exclude.length
            ? !filters.exclude.some((excludedValue) =>
                processedValues.some((processed) => processed.includes(excludedValue.toLowerCase()))
            )
            : true;

        return matchesInclude && matchesExclude;
    });
};

export const filterBool = ({ data = [], field = '', val = '', conditions = [], defaultVal = '0' }) => {
    if (val === '') return data;

    const condition = conditions[0] || 'e';
    const valueToCompare = val !== '' ? val : defaultVal;

    return data.filter(item => {
        const fieldValue = item[field] !== null ? item[field].toString() : '0';
        const numericFieldValue = parseFloat(fieldValue);
        const numericVal = parseFloat(valueToCompare);

        switch (condition) {
            case 'gt': return numericFieldValue > numericVal;
            case 'gte': return numericFieldValue >= numericVal;
            case 'lt': return numericFieldValue < numericVal;
            case 'lte': return numericFieldValue <= numericVal;
            case 'e': return numericFieldValue === numericVal;
            default: return false;
        }
    });
};

export const filterNumber = ({ data = [], fields = [], conditions = [], val = '' }) => {
    return data.filter(item => {
        let itemVal = +item[fields[0]];
        const cond = conditions[0];
        switch (cond) {
            case 'gte': return +itemVal >= +val;
            case 'gt': return +itemVal > +val;
            case 'lte': return +itemVal <= +val;
            case 'lt': return +itemVal < +val;
            case 'e': return +itemVal === +val;
            default: return true;
        }
    });
};

export const filterDate = ({ data = [], field, condition, val }) => {
    const conditionMap = {
        lt: (a, b) => a.getTime() < b.getTime(),
        gt: (a, b) => a.getTime() > b.getTime(),
        lte: (a, b) => a.getTime() <= b.getTime(),
        gte: (a, b) => a.getTime() >= b.getTime(),
    };

    if (!val || val === '0000-00-00' || isNaN(new Date(val).getTime())) {
        return data;
    }

    let filterValue = new Date(val);

    if (condition === 'gte') filterValue.setHours(0, 0, 0, 0);
    else if (condition === 'lte') filterValue.setHours(23, 59, 59, 999);

    if (!conditionMap[condition]) return data;

    return data.filter((item) => {
        let fieldValue = item[field];
        if (!(fieldValue instanceof Date)) fieldValue = new Date(fieldValue);
        if (isNaN(fieldValue.getTime())) return false;

        return conditionMap[condition](fieldValue, filterValue);
    });
};

export const filterNonVal = (data = [], field) => {
    return data.filter(item => item[field] === '' || item[field] === null || item[field] === 0 || item[field] === '0');
};



export const filterRange = (data = [], field = '', val = {}) => {
    const { min, max } = val;
  
    return data.filter(item => {
      const value = parseFloat(item[field]);
  
      // Handle explicitly looking for empty/non-value
      if (min === 'noval' && max === 'noval') {
        return item[field] === null || item[field] === '' || item[field] === 0;
      }
  
      // Handle numeric min/max
      if (!isNaN(value)) {
        if (min !== null && min !== undefined && min !== 'noval' && value < parseFloat(min)) return false;
        if (max !== null && max !== undefined && max !== 'noval' && value > parseFloat(max)) return false;
        return true;
      }
  
      // If value is not a number and no valid `noval` match
      return false;
    });
  };
  
    

  export const filterDateRange = (data = [], field = '', val = {}) => {
    const { min, max } = val;
  
    const parseDate = (d) => {
      if (!d || d === '0000-00-00') return null;
      const date = new Date(d);
      return isNaN(date.getTime()) ? null : date;
    };
  
    const minDate = parseDate(min);
    const maxDate = parseDate(max);
  
    return data.filter(item => {
      const itemDate = parseDate(item[field]);
  
      // Handle explicit "no value"
      if (min === 'noval' && max === 'noval') {
        return !itemDate; // null/invalid date
      }
  
      if (itemDate) {
        if (minDate && itemDate < minDate) return false;
        if (maxDate && itemDate > maxDate) return false;
        return true;
      }
  
      // Invalid date and not matched as noval
      return false;
    });
  };
  
  
  
  
