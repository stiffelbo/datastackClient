import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';

//Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'

//Mui
import {
    Box, Grid, FormControl, InputLabel, MenuItem, Select, TextField,
    Tabs, Tab, IconButton, Modal,Tooltip
} from '@mui/material';

import InputCheckbox from '../form/inputCheckbox';
import SlugInput from './slugInput';
import FiltersConfigurator from './filtersConfigurator';  //we will use this as control component.
import RangeDropdown from './rangeDropdown';

import { initialState } from './../../../filtersConfig';
import { useFilters } from '../../../hooks/useFilters';
import useLocalStorage from './../../../hooks/useLocalStorage';
import { extractFieldTypes } from '../../../utils/extractFieldTypes';
import { mergeFiltersWithExtractedFields } from './utils';

import {
    filterSlug,
    filterSelect,
    filterTransistorSelect,
    filterBool,
    filterNumber,
    filterDate,
    filterNonVal,
    filterRange,
    filterDateRange
} from "./filter";


//for now make state for filters
const getDefaultFilters = (schema) => {
    return schema.reduce((acc, filter) => {
        acc[filter.name] = filter.default ?? ''; // Ensure a safe fallback
        return acc;
    }, {});
};

const createFieldLookup = (extractedFields = []) => {
    const lookup = {};
    extractedFields.forEach(field => {
        lookup[field.name] = {
            type: field.type, // "number", "date", "boolean", etc.
            isNumeric: field.isNumeric ?? false, // Ensure isNumeric is a boolean
        };
    });
    return lookup;
};



const FilterTemplate = ({
    data = [],
    schema = [],
    filters: controlledFilters,
    onChange,
    onClear,
    onFilter,
    entityName,
    bgColor = "inherit",
}) => {
    if (!data) return;

    /** ────────────────────────────
   * ✅ CONTROL LOGIC ON TOP
   * Determines whether to use Context (`useFilters`) or Controlled Props (`filters, onChange`)
   * ──────────────────────────── */

    /** ────────────────────────────
    * ✅ COMPONENT STATE
    * ──────────────────────────── */
    const storageKey = `${entityName}-filterSchema`;
    const extractedFields = extractFieldTypes(data);
    const extractedFieldsDictionary = createFieldLookup(extractedFields);

    const [options, setOptions] = useState({});
    const [filtered, setFiltered] = useState([]);
    const [active, setActive] = useState(false);
    const [mode, setMode] = useState('cascade'); //filter mode toggle Cascade / Additive
    const [showConfig, setShowConfig] = useState(false); //config display.

    //config modal control
    const handleCloseConfig = () => setShowConfig(false);

    const [storedSchema, setStoredSchema] = useLocalStorage(storageKey, []);
    const blendedSchema = useMemo(() => {

        return storedSchema.length ? mergeFiltersWithExtractedFields(storedSchema, extractedFields) : mergeFiltersWithExtractedFields(schema, extractedFields);
    }, [data, storedSchema, schema]);

    let filterMode;
    const contextFilters = useFilters(entityName);
    const filters = entityName ? contextFilters.filters : controlledFilters;
    const setFilters = entityName ? contextFilters.setFilters : onChange;
    const defaultFilters = entityName
        ? initialState[entityName] || getDefaultFilters(blendedSchema)
        : getDefaultFilters(blendedSchema);

    const [uiFilters, setUiFilters] = useState(filters);

    if (entityName) {
        filterMode = "Context";
    } else {
        filterMode = "Props";
    }

    useEffect(() => { }, [active]);

    useEffect(() => {
        mainFilter();
        if (JSON.stringify(filters) !== JSON.stringify(defaultFilters)) {
            setActive(true);
        } else {
            setActive(false);
        }
    }, [filters]);

    useEffect(() => {
        getOptions();
    }, [filtered]);

    useEffect(() => {
        setFiltered(data);
        mainFilter();
    }, [data, mode]);

    useEffect(() => {
        if (JSON.stringify(uiFilters) !== JSON.stringify(filters)) {
          setFilters(uiFilters);
        }
      }, [uiFilters]);

    function getOptions() {
        const options = {};
        const filteredSchema = blendedSchema.filter(i => i.show);
        filteredSchema.map(item => {
            if (item.type === 'select') {
                options[item.name] = [];
                filtered?.map(row => {
                    let val = '';
                    item.itemFields.map(itemField => {
                        if (val.length) {
                            val += ` ${row[itemField]}`;
                        } else {
                            val += `${row[itemField]}`;
                        }
                    })
                    if (!options[item.name].includes(val)) {
                        options[item.name].push(val);
                    }
                });
            }
        });

        //sort options
        const optionsKeys = Object.keys(options);
        optionsKeys.map(key => {
            options[key] = options[key].sort();
        });
        setOptions(options);
    }

    const getUniqueOptions = (fields = [], delimiter = null, name) => {
        const optionsSet = new Set();
        const filteredForOptions = mainFilter(name);
        filteredForOptions.forEach((item) => {
            const values = fields.map((field) => item[field]).filter(Boolean);
            if (delimiter) {
                // Split values by delimiter
                values.flatMap((value) => value.split(delimiter).map((tag) => tag.trim())).forEach((tag) => optionsSet.add(tag));
            } else {
                values.forEach((value) => optionsSet.add(value));
            }
        });

        return Array.from(optionsSet).sort();
    };

    const handleSaveSchema = (newSchema) => {
        setStoredSchema(newSchema); // Store in LS
        setFilters(getDefaultFilters(newSchema)); // Reset filters
    };

    function handleClear() {
        const defValues = Object.values(defaultFilters);
        if (defValues.length) {
            setUiFilters(defaultFilters);
            setFilters(defaultFilters);
            onClear && onClear();
        }
    }

    // Helper function to format slug input
    function formatSlugInput(input) {
        // Split the input by spaces, newlines, or tabs, then join with `;`
        return input
            .split(/\s+/) // Split by whitespace
            .filter(Boolean) // Remove empty strings
            .join(';'); // Join with `;`
    }

    function handleSlugChange(name, val) {
        // Format the input before applying it
        const formattedValue = formatSlugInput(val);

        setUiFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters, [name]: formattedValue };
            setFilters(updatedFilters); // Immediately apply filters on submit
            return updatedFilters;
        });
    }

    function handleChange(name, val) {
        setUiFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters, [name]: val };
            return updatedFilters;
        });
    }

    const handleTransistorChange = (name, value, action) => {
        setUiFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters };
            const tagFilters = updatedFilters[name] || { include: [], exclude: [] };

            if (action === 'include') {
                tagFilters.include = tagFilters.include.includes(value)
                    ? tagFilters.include.filter((tag) => tag !== value)
                    : [...tagFilters.include, value];
                tagFilters.exclude = tagFilters.exclude.filter((tag) => tag !== value);
            } else if (action === 'exclude') {
                tagFilters.exclude = tagFilters.exclude.includes(value)
                    ? tagFilters.exclude.filter((tag) => tag !== value)
                    : [...tagFilters.exclude, value];
                tagFilters.include = tagFilters.include.filter((tag) => tag !== value);
            }

            updatedFilters[name] = tagFilters;
            setFilters(updatedFilters); // Debounced update to the parent
            return updatedFilters;
        });
    };

    function filterCascade(omit = '') {
        let filtered = data;
        const keys = Object.keys(filters).filter(item => item !== omit);

        keys.forEach(key => {
            if (filters[key]) {
                const filterSchema = blendedSchema.find(item => item.name === key);
                if (!filterSchema) return;
                if (filterSchema.type === 'slug') {
                    filtered = filterSlug({ data: filtered, fields: filterSchema.itemFields, val: filters[key], fieldsDictionary : extractedFieldsDictionary })
                }
                if (filterSchema.type === 'select') {
                    filtered = filterSelect({ data: filtered, fields: filterSchema.itemFields, val: filters[key] })
                }
                if (filterSchema.type === 'select-transistor') {
                    filtered = filterTransistorSelect({
                        data: filtered,
                        fields: filterSchema.itemFields,
                        filters: filters[key]
                    });
                }
                if (filterSchema.type === 'number') {
                    filtered = filterNumber({ data: filtered, fields: filterSchema.itemFields, conditions: filterSchema.conditions, val: filters[key] })
                }
                if (filterSchema.type === 'date') {
                    filtered = filterDate({ data: filtered, field: filterSchema.itemFields[0], condition: filterSchema.conditions[0], val: filters[key] })
                }
                if (filterSchema.type === 'bool') {
                    filtered = filterBool({
                        data: filtered,
                        field: filterSchema.itemFields[0],
                        val: filters[key],
                        conditions: filterSchema.conditions,
                        defaultVal: filterSchema.default,
                    });
                }
                if (filterSchema.type === 'nonval') {
                    filtered = filterNonVal(filtered, filterSchema.itemFields[0]);
                }
                if (filterSchema.type === 'range') {
                    filtered = filterRange(filtered, filterSchema.itemFields[0], filters[key]);
                }
                if (filterSchema.type === 'dateRange') {
                    filtered = filterDateRange(filtered, filterSchema.itemFields[0], filters[key]);
                }
            }
        });
        if (omit) {
            return filtered;
        } else {
            setFiltered(filtered);
            onFilter(filtered);
        }
    }

    function filterAdd({ data = [], filters = {}, schema = [], extractedFieldsDictionary = {}, omit = '' }) {
        const idField = 'id'; // assumes every record has a unique ID
        const resultMap = new Map();
      
        Object.entries(filters).forEach(([key, filterVal]) => {
            if (!filterVal || key === omit) return;
            if (!filterVal) return;
        
            const filterSchema = schema.find(s => s.name === key);
            if (!filterSchema) return;
        
            const itemField = filterSchema.itemFields[0];
            let filteredSubset = [];
        
            switch (filterSchema.type) {
                case 'slug':
                filteredSubset = filterSlug({
                    data,
                    fields: filterSchema.itemFields,
                    val: filterVal,
                    fieldsDictionary: extractedFieldsDictionary,
                });
                break;
                case 'select':
                filteredSubset = filterSelect({
                    data,
                    fields: filterSchema.itemFields,
                    val: filterVal,
                });
                break;
                case 'select-transistor':
                filteredSubset = filterTransistorSelect({
                    data,
                    fields: filterSchema.itemFields,
                    filters: filterVal,
                });
                break;
                case 'number':
                filteredSubset = filterNumber({
                    data,
                    fields: filterSchema.itemFields,
                    conditions: filterSchema.conditions,
                    val: filterVal,
                });
                break;
                case 'date':
                filteredSubset = filterDate({
                    data,
                    field: itemField,
                    condition: filterSchema.conditions[0],
                    val: filterVal,
                });
                break;
                case 'bool':
                filteredSubset = filterBool({
                    data,
                    field: itemField,
                    val: filterVal,
                    conditions: filterSchema.conditions,
                    defaultVal: filterSchema.default,
                });
                break;
                case 'nonval':
                filteredSubset = filterNonVal(data, itemField);
                break;
                case 'range':
                filteredSubset = filterRange(data, itemField, filterVal);
                break;
                case 'dateRange':
                filteredSubset = filterDateRange(data, itemField, filterVal);
                break;
                default:
                break;
            }
      
          filteredSubset.forEach(item => resultMap.set(item[idField], item));
        });
      
        return Array.from(resultMap.values());
    };  

    function mainFilter(omit = '') {
        if (mode === 'cascade') {
            return filterCascade(omit);
        } else if (mode === 'additive') {
            const filtered = filterAdd({
                data,
                filters,
                schema: blendedSchema,
                extractedFieldsDictionary,
            });
            if (!omit) {
                setFiltered(filtered);
                onFilter(filtered);
            }
            return filtered;
        }
    }

    const renderInput = (item) => {
        // Determine if the filter is active (not empty)
        const filters = uiFilters;
        const isActive = filters[item.name] && (Array.isArray(filters[item.name]) ? filters[item.name].length > 0 : filters[item.name]);

        // Add the 'bg-warning' class if the filter is active
        const inputPropsWithClass = {
            ...item.inputProps,
            className: isActive ? 'bg-warning' : ''
        };

        const labelStyle = { fontSize: '0.8rem', paddingTop: '8px' };

        switch (item.type) {
            case "slug": {
                const value = filters[item.name] || "";
                const searchableFields = item.itemFields.length > 0
                    ? item.itemFields
                    : Object.keys(data[0] || {}); // Get field names dynamically if not provided

                return (
                    <SlugInput
                        name={item.name}
                        label={item.label}
                        value={value}
                        itemFields={searchableFields} // Pass array of searchable fields
                        onSubmit={(newValue) => handleSlugChange(item.name, newValue)}
                        width={+item.width || 200}
                    />
                );
            }


            case 'number': {
                const value = filters[item.name] || '';
                return (
                    <FormControl size="small" sx={{ width: item.width || '200px' }} title={item.label}>
                        <TextField
                            label={item.label}
                            value={value}
                            size="small"
                            type="number"
                            onChange={(e) => handleChange(item.name, e.target.value)}
                            inputProps={inputPropsWithClass}
                            fullWidth
                            variant="outlined"
                            sx={{ label: labelStyle }}
                        />
                    </FormControl>
                );
            }

            case 'select': {
                const opts = options[item.name] || [];
                const value = filters[item.name] || '';
                return (
                    <FormControl size="small" sx={{ width: item.width || '200px' }} title={item.label}>
                        <InputLabel id={`${item.name}-label`} sx={labelStyle}>
                            {item.label}
                        </InputLabel>
                        <Select
                            labelId={`${item.name}-label`}
                            value={value}
                            onChange={(e) => handleChange(item.name, e.target.value)}
                            inputProps={inputPropsWithClass}
                            fullWidth
                        >
                            <MenuItem key={'noval'} value={''}>
                                Wyczyść
                            </MenuItem>
                            {opts.map((opt, idx) => (
                                <MenuItem key={idx} value={opt}>
                                    {opt}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            }

            case 'select-transistor': {
                const opts = getUniqueOptions(item.itemFields, item.delimiter, item.name);
                const { include = [], exclude = [] } = filters[item.name] || {};
                const isActive = include.length > 0 || exclude.length > 0;

                return (
                    <FormControl
                        size="small"
                        sx={{ width: item.width || '280px', backgroundColor: 'white' }}
                        className={isActive ? 'bg-warning' : ''}
                        title={`${item.label} plus: dodaje do chcesz zobaczyć dany element, minus: dodaje elemnt do listy nie chce zobaczyć inne bez tego. `}
                    >
                        <InputLabel id={`${item.name}-label`}>{item.label}</InputLabel>
                        <Select
                            labelId={`${item.name}-label`}
                            id={`${item.name}-select`}
                            value=""
                            renderValue={() => isActive ? `Selected (${include.length})` : `Select ${item.label}`}
                            MenuProps={{
                                PaperProps: { style: { maxHeight: 600, width: 350 } },
                            }}
                            label={item.label}
                        >
                            <MenuItem
                                key="clear-filter"
                                value=""
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleChange(item.name, { include: [], exclude: [] });
                                }}
                            >
                                Wyczyść
                            </MenuItem>
                            {opts.map((option) => (
                                <MenuItem key={option} value={option}>
                                    <Box display="flex" alignItems="center" title={option}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTransistorChange(item.name, option, 'include');
                                            }}
                                            color={include.includes(option) ? 'primary' : 'default'}
                                        >
                                            <AddCircleOutlineIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTransistorChange(item.name, option, 'exclude');
                                            }}
                                            color={exclude.includes(option) ? 'secondary' : 'default'}
                                        >
                                            <RemoveCircleOutlineIcon />
                                        </IconButton>
                                        <Box ml={2}>{option}</Box>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            }

            case 'date': {
                const value = filters[item.name] || '';
                return (
                    <FormControl size="small" sx={{ width: item.width || '200px' }} title={item.label}>
                        <TextField
                            label={item.label}
                            value={value}
                            size="small"
                            type="date"
                            onChange={(e) => handleChange(item.name, e.target.value)}
                            inputProps={inputPropsWithClass}
                            fullWidth
                            variant="outlined"
                            sx={{ label: labelStyle }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormControl>
                );
            }

            case 'bool': {
                const value = filters[item.name] || '';
                const options = [
                    { label: 'Wyczyść', value: '' },
                    { label: 'TAK', value: '1' },
                    { label: 'NIE', value: '0' },
                ];

                return (
                    <FormControl size="small" sx={{ width: item.width || '200px' }} title={item.label}>
                        <InputLabel id={`${item.name}-label`} sx={{ fontSize: '0.7rem' }}>
                            {item.label}
                        </InputLabel>
                        <Select
                            labelId={`${item.name}-label`}
                            value={value}
                            size="small"
                            onChange={(e) => handleChange(item.name, e.target.value)}
                            inputProps={inputPropsWithClass}
                            fullWidth
                        >
                            {options.map((opt, idx) => (
                                <MenuItem key={idx} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            }

            case 'nonval': {
                const value = filters[item.name] ? filters[item.name] : '';
                return (
                    <InputCheckbox
                        name={item.name}
                        label={item.label}
                        value={value}
                        size="small"
                        inputProps={inputPropsWithClass}
                        onChange={(val) => handleChange(item.name, val)}
                    />
                );
            }

            case 'range': {
                const value = filters[item.name] || { min: '', max: '' };
                return (
                    <RangeDropdown
                        label={item.label}
                        value={value}
                        type="number"
                        onChange={(newVal) => handleChange(item.name, newVal)}
                        width={item.width || 200}
                    />
                );
            }
            
            case 'dateRange': {
                const value = filters[item.name] || { min: '', max: '' };
                return (
                    <RangeDropdown
                        label={item.label}
                        value={value}
                        type="date"
                        onChange={(newVal) => handleChange(item.name, newVal)}
                        width={item.width || 220}
                    />
                );
            }
            

            default:
                return null;
        }
    };

    const renderInputs = () => {
        const result = blendedSchema.filter(item => item.show);
        return result.map((item) => (
                <Tab
                    key={item.name}
                    title={item.name}
                    label={renderInput(item)}
                    component={"div"}
                    sx={{ minWidth: "auto", maxWidth: "none", padding: 0, margin: 0 }}
                    disableRipple
                />
            ));
    };

    const renderClear = () => {
        return <IconButton
            onClick={() => { handleClear() }}
            color={active ? 'error' : 'default'}
            disabled={active ? false : true}
            title="wyczyść filtry"
        >
            <ClearIcon />
        </IconButton>;
    }

    const renderConfig = () => (
        <Tooltip
            title={
                'Otwiera modal z konfiguratorem filtrów, modal zamyka się poprzez kliknięcie w szare poza konfiguratorem'
            }
            arrow
            componentsProps={{
                tooltip: {
                  sx: {
                    fontSize: '0.95rem', // 🔠 Increase font size
                    maxWidth: 220         // Optional: control width to wrap nicely
                  }
                }
            }}
        >
            <IconButton
                onClick={() => setShowConfig(true)}
                color="primary"
            >
                <SettingsIcon />
            </IconButton>
        </Tooltip>        
    );

    const renderMode = () => {
        const isCascade = mode === 'cascade';
      
        return (
          <Tooltip
            title={
              isCascade
                ? 'Tryb kaskadowy: każdy filtr ogranicza następne'
                : 'Tryb sumujący: każdy filtr dodaje pasujące rekordy'
            }
            arrow
            componentsProps={{
                tooltip: {
                  sx: {
                    fontSize: '0.95rem', // 🔠 Increase font size
                    maxWidth: 220         // Optional: control width to wrap nicely
                  }
                }
            }}
          >
            <IconButton
              onClick={() => setMode(isCascade ? 'additive' : 'cascade')}
              color={isCascade ? 'primary' : 'warning'}
            >
              {isCascade ? <FilterAltIcon /> : <FilterAltOffIcon />}
            </IconButton>
          </Tooltip>
        );
    };

    
    return (
        <Box sx={{ backgroundColor: bgColor, width: '100%', maxWidth: '100%' }} title={filterMode}>
            <Grid
                container
                alignItems="center"
                spacing={1}
                sx={{ display: 'flex', flexWrap: 'nowrap' }} // Ensure no wrapping
            >
                {/* Clear Button Grid */}
                <Grid item sx={{ flexShrink: 0 }} title={`Mode: ${filterMode} - ${entityName}`}> {/* Prevent button from shrinking */}
                    {renderClear()}
                </Grid>
                {/* Config Button */}
                <Grid item sx={{ flexShrink: 0 }} >
                    {renderConfig()}
                </Grid>
                <Grid item sx={{ flexShrink: 0 }} >
                    {renderMode()}
                </Grid>

                {/* Filters Tabs Grid (takes the rest of the width, no wrapping) */}
                <Grid item xs sx={{ flexGrow: 1, overflow: 'hidden' }}> {/* Prevent shrinking and allow full width */}
                    <Tabs
                        size="small"
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        aria-label="scrollable filter tabs"
                        value={false} // No tab selection, just using for scrolling
                        sx={{ padding: 0, overflow: 'hidden', whiteSpace: 'nowrap' }} // Prevent Tabs from wrapping
                    >
                        {renderInputs()}
                    </Tabs>
                </Grid>
            </Grid>

            <Modal
                open={showConfig}
                onClose={handleCloseConfig}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "white",
                        borderRadius: 2,
                        boxShadow: 24,
                        width: "80vw",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}
                >
                    <FiltersConfigurator
                        schema={blendedSchema}
                        entityName={entityName}
                        extractedFields={extractedFields}
                        onClose={() => setShowConfig(false)}
                        onSave={handleSaveSchema}
                    />
                </Box>
            </Modal>

        </Box>
    );
}

export default FilterTemplate;

FilterTemplate.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object), // Array of data to be filtered
    schema: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired, // Unique name of the filter
            type: PropTypes.string.isRequired, // Type of the filter ('slug', 'select', etc.)
            label: PropTypes.string, // Label for the filter
            itemFields: PropTypes.arrayOf(PropTypes.string), // Fields used for filtering
            width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Custom width for the filter input
            show: PropTypes.bool, // Whether to show the filter
            conditions: PropTypes.arrayOf(PropTypes.string), // Conditions for filtering (e.g., ['gte', 'lte'])
            default: PropTypes.string, // Default value for the filter
        })
    ), // Array of filter schemas
    filters: PropTypes.object, // Current active filters
    defaultFilters: PropTypes.object, // Default filter values
    onChange: PropTypes.func, // Callback for when filters change
    onClear: PropTypes.func, // Callback for when filters are cleared
    onSchemaChange: PropTypes.func, // Callback for schema changes
    onFilter: PropTypes.func.isRequired, // Callback for when filtered data is updated
    bgColor: PropTypes.string, // Background color for the filter container
    debouncems: PropTypes.number, // Debounce time for filter changes
};

FilterTemplate.defaultProps = {
    data: [], // Default to an empty array if no data is provided
    schema: [], // Default to an empty array if no schema is provided
    filters: {}, // Default to an empty object for filters
    defaultFilters: {}, // Default to an empty object for default filters
    onChange: null, // Default to null
    onClear: () => { }, // Default to a no-op function
    onSchemaChange: () => { }, // Default to a no-op function
    onFilter: () => { }, // Default to a no-op function
    bgColor: 'inherit', // Default background color
    debouncems: 1000, // Default debounce time
};