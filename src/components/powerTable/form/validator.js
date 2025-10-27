// form/validator.js
const defaultMessages = {
  required: 'To pole jest wymagane',
  min: (min) => `Wartość nie może być mniejsza niż ${min}`,
  max: (max) => `Wartość nie może być większa niż ${max}`,
  minLength: (n) => `Pole powinno zawierać co najmniej ${n} znaków`,
  maxLength: (n) => `Pole powinno zawierać maksymalnie ${n} znaków`,
};

const validator = (schema = [], formState = {}) => {
  const errors = {};
  schema.forEach((field) => {
    if (!field.name || !field.validation) return;
    const val = formState[field.name];
    const rules = field.validation;
    const fieldErrors = [];

    //Type based

    if(field.type === 'email' && rules.required){
      //validate for proper email
    }

    if (rules.required && (val === null || val === '' || typeof val === 'undefined' || (typeof val === 'object' && Object.keys(val).length === 0))) {
      fieldErrors.push(defaultMessages.required);
    }
    if (rules.min !== undefined && typeof val === 'number' && val < rules.min) {
      fieldErrors.push(defaultMessages.min(rules.min));
    }
    if (rules.max !== undefined && typeof val === 'number' && val > rules.max) {
      fieldErrors.push(defaultMessages.max(rules.max));
    }
    if (rules.minLength !== undefined && typeof val === 'string' && val.length < rules.minLength) {
      fieldErrors.push(defaultMessages.minLength(rules.minLength));
    }
    if (rules.maxLength !== undefined && typeof val === 'string' && val.length > rules.maxLength) {
      fieldErrors.push(defaultMessages.maxLength(rules.maxLength));
    }
    if (rules.requiredChars && typeof val === 'string' && val.length < rules.requiredChars) {
      fieldErrors.push(`To pole powinno zawierać min ${rules.requiredChars} znaków`);
    }
    if (rules.custom && typeof rules.custom === 'function') {
      const custom = rules.custom(val, formState);
      if (custom) fieldErrors.push(custom);
    }

    if (fieldErrors.length) errors[field.name] = fieldErrors;
  });
  return errors;
};

export default validator;
