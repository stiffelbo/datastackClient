/**
 * @typedef {Object} FilterSchema
 * @property {string} name - Unique field name (matches `itemFields[0]`)
 * @property {string} label - Display name for the UI
 * @property {string} type - UI type of filter input (e.g., select, number, bool)
 * @property {Array<string>} itemFields - Fields that are used for filtering
 * @property {Array<string>} conditions - Filtering conditions (e.g., ['e', 'gte'])
 * @property {string} default - Default filter value
 * @property {boolean} show - Whether the filter should be initially visible
 * @property {number} width - Width of the filter input
 * @property {string} dataType - Data type extracted from dataset (e.g., string, number, boolean)
 * @property {boolean} isSchema - Indicates if the field is part of the hardcoded schema
 */

/**
 * @typedef {Object} ExtractedField
 * @property {string} name - Field name extracted from dataset
 * @property {string} type - Type derived from dataset (e.g., string, number, boolean, date)
 * @property {string} dataType - Same as `type`, kept for consistency
 * @property {boolean} isNumeric - Indicates if the field contains numeric values
 * @property {number} uniqueValues - Count of unique values in dataset
 * @property {Array<any>} sampleValues - Sample data for debugging and validation
 */


//use below to populate schema proeprties by field type
const defaultSchemaProps = {
    id : {
        width: 90,
        conditions: ['e'],
        type: 'number',
    },
    number : {
        width: 120,
        conditions: ['e'],
        type: 'number',
    },
    string : {
        width: 110,
        conditions: ['e'],
        type: 'select',
    },
    boolean : {
        width: 90,
        conditions: ['e'],
        type: 'bool',
    },
    date : {
        width: 90,
        conditions: ['gte'],
        type: 'date',
    },
}

const extractWidth = (val) => {
    if (typeof val === "number") return val; // Return as-is if already a number
    if (typeof val === "string") {
        const match = val.match(/\d+/); // Extract numeric part from string
        return match ? parseInt(match[0], 10) : null; // Convert to number
    }
    return null; // Return null for invalid inputs
};

export const mergeFiltersWithExtractedFields = (filtersSchema = [], extractedFields = []) => {
    // Preserve defined filters order first
    const schemaMap = new Map;

    filtersSchema.forEach(item => {
        let key = Array.isArray(item.itemFields) ? item.itemFields[0] : null; 
        
        if(item.type === 'slug'){
            key = 'slug'
        }
        
        if(key){
            schemaMap.set(key, {...item, width: extractWidth(item.width)});
        }
    });

    extractedFields.forEach(field => {
        // Skip non-primitive types (arrays, objects, JSON)
        if (['array', 'object', 'json'].includes(field.type)) {
            return;
        }

        // Use the default schema properties if available
        const defaultProps = defaultSchemaProps[field.type] || {
            width: 150,   // Default width
            conditions: [], 
            type: 'select' // Default to 'select' for unknown types
        };

        if (!schemaMap.has(field.name)) {
            schemaMap.set(field.name, {
                name: field.name,
                label: field.name, // Default label
                type: defaultProps.type, // Assign UI type by default lookup
                itemFields: [field.name], // Reference the field correctly
                conditions: defaultProps.conditions,
                default: '',
                show: false, // Initially hidden for new fields
                width: defaultProps.width,
                dataType: field.type, // Inject extracted field type
                isSchema: false // Mark as dynamically extracted field
            });
        } else {
            // Ensure existing filters get updated with data type if missing
            const existingFilter = schemaMap.get(field.name);
            existingFilter.dataType = field.type;
            schemaMap.set(field.name, existingFilter);
        }
    });

    return Array.from(schemaMap.values());
};

