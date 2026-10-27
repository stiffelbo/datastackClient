
const isEmpty = (value) => {
    if (value === null || value === undefined) return true;

    if (typeof value === 'string') {
        return value.trim() === '';
    }

    if (Array.isArray(value)) {
        return value.length === 0;
    }

    return false;
};

export const validator = ({ schema = [], formState = {} } = {}) => {
    const errors = {};

    schema.forEach((field) => {
        if (!field?.name) return;

        const { name, required } = field;
        const value = formState[name];

        if (required && isEmpty(value)) {
            errors[name] = 'Pole jest wymagane';
        }
    });

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};
