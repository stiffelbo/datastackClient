/**
 * Extracts field types from a dataset by analyzing a sample of rows.
 * @param {Array} data - The dataset
 * @param {number} sampleSize - Number of rows to process (default: 5)
 * @returns {Array} Processed field metadata
 */
export const extractFieldTypes = (data, sampleSize = 25) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const sliceEnd = data.length < sampleSize ? data.length : sampleSize; 
    // Take first `sampleSize` rows for analysis
    const sampleData = data.slice(0, sliceEnd);

    // Collect field names
    const fieldNames = Object.keys(sampleData[0] || {});

    return fieldNames.map((field) => {
        const values = sampleData
            .map((row) => row[field])
            .filter((v) => v !== undefined && v !== null);

        let detectedType = "string"; // Default type

        // 1️⃣ **Check for ID Fields (Strict Naming)**
        const isIdField = /^id(_|\b)/i.test(field); // Must start with "id" or "id_"
        const isNumeric = values.every((v) => !isNaN(parseFloat(v)) && isFinite(v));
        const isZeroOne = values.every((v) => !isNaN(parseFloat(v)) && +v <= 1 && +v >= 0);

        if (isIdField && isNumeric) {
            detectedType = "id";
        }

          // 4️⃣ **Check for Dates (By Value & Field Name)**
        else if (isDateField(field, values)) {
            detectedType = "date";
        }

        // 3️⃣ **Check for Boolean-like Fields**
        else if (values.every((v) => isLikelyBoolean(field)) && isZeroOne) {
            detectedType = "boolean";
        }
     
          // **Check for Pure Numbers (Handles "100" as well)**
          else if (isNumeric) {
            detectedType = "number";
        }

        // 5️⃣ **Check for JSON Strings**
        else if (values.every((v) => typeof v === "string" && isJsonString(v))) {
            detectedType = "json";
        }

        // 6️⃣ **Check for Nested Objects**
        else if (values.every((v) => typeof v === "object" && v !== null && !Array.isArray(v))) {
            detectedType = "object";
        }

        // 7️⃣ **Check for Arrays**
        else if (isJsonString && values.every((v) => Array.isArray(v))) {
            detectedType = "array";
        }

        return {
            name: field,
            type: detectedType,
            isNumeric: detectedType === "number" || detectedType === "id",
        };
    });
};

/**
 * Determines if a field name suggests it's likely a date.
 * @param {string} name - The field name.
 * @returns {boolean} - True if the field name indicates it's a date.
 */
const isLikelyDate = (name) => {
    const lowerName = name.toLowerCase();
    return (
        lowerName.includes("date") ||
        lowerName.includes("start") ||
        lowerName.includes("end") ||
        lowerName.includes("deadline") ||
        lowerName.includes("created") ||
        lowerName.includes("updated") ||
        lowerName.includes("timestamp") ||
        lowerName.startsWith("data") // Covers common naming patterns like "data_wysylki"
    );
};

/**
 * Determines if a value is a valid date or timestamp.
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is a date (string or timestamp).
 */
const isValidDateValue = (value) => {
    if (!value) return false;

    // If it's a number, check if it looks like a Unix timestamp (10 or 13 digits)
    if (typeof value === "number") {
        return value > 1000000000 && value < 9999999999999; // Unix timestamp range
    }

    // If it's a string, check if it can be parsed as a date
    if (typeof value === "string") {
        const parsedDate = new Date(value);
        return !isNaN(parsedDate.getTime());
    }

    return false;
};

/**
 * Determines if a field is a date by checking both name and values.
 * @param {string} name - The field name.
 * @param {Array} values - Sample values from the dataset.
 * @returns {boolean} - True if the field is likely a date.
 */
const isDateField = (name, values) => {
    return isLikelyDate(name) || values.some(isValidDateValue);
};


/**
 * Determines if a field name is likely to be a boolean.
 * @param {string} name - The field name.
 * @returns {boolean} - True if the field name suggests a boolean.
 */
const isLikelyBoolean = (name) => {
    return /^(is|czy|has|can|should|allow|enable|must|needs)(_|\b)|(_flag|_enabled|_allowed|_visible|_active|_success|_status|_available|_valid|_confirmed|_completed|_done|_checked|_verified|_ok)$/i.test(name);
};

/**
 * Determines if a string is a valid JSON format.
 * @param {string} str - The string to test.
 * @returns {boolean} - True if it's a valid JSON string.
 */
const isJsonString = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Filters fields based on accepted types.
 * @param {Array} fields - Processed field metadata
 * @param {Array} allowedTypes - Types allowed (e.g., ['number', 'string', 'object', 'array', 'json'])
 * @returns {Array} Filtered fields
 */
export const filterAvailableFields = (fields, allowedTypes = []) => {
    return fields.filter((field) => allowedTypes.includes(field.type));
};
