const validator = (schema, formState) => {
  const errors = {};
  
  schema.forEach((field) => {
      const value = formState[field.name];
      const fieldErrors = [];
      const validation = field.validation;

      if (!validation) return;

      // Validate required field
      if (validation.required && (value === null || value === '' || value === '{}' || value === undefined)) {
          fieldErrors.push('To pole jest wymagane');
      }

      // Validate minimum value (for number type fields)
      if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
          fieldErrors.push(`Wartość nie może być mniejsza niż ${validation.min}`);
      }

      // Validate maximum value (for number type fields)
      if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
          fieldErrors.push(`Wartość nie może być większa niż ${validation.max}`);
      }

      // Validate minimum length (for text fields)
      if (validation.minLength !== undefined && typeof value === 'string' && value.length < validation.minLength) {
          fieldErrors.push(`Pole powinno zawierać co najmniej ${validation.minLength} znaków`);
      }

      // Validate maximum length (for text fields)
      if (validation.maxLength !== undefined && typeof value === 'string' && value.length > validation.maxLength) {
          fieldErrors.push(`Pole powinno zawierać maksymalnie ${validation.maxLength} znaków`);
      }

      // Custom validation: Minimum required characters (existing rule)
      if (validation.requiredChars && typeof value === 'string' && value.length < validation.requiredChars) {
          fieldErrors.push(`To pole powinno zawierać min ${validation.requiredChars} znaków`);
      }

      // Add field errors to the errors object if there are any
      if (fieldErrors.length > 0) {
          errors[field.name] = fieldErrors;
      }
  });
  
  return errors;
};

export default validator;
