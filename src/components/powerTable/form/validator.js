// form/validator.js
const defaultMessages = {
  required: 'To pole jest wymagane',
  min: (min) => `Wartość nie może być mniejsza niż ${min}`,
  max: (max) => `Wartość nie może być większa niż ${max}`,
  minLength: (n) => `Pole powinno zawierać co najmniej ${n} znaków`,
  maxLength: (n) => `Pole powinno zawierać maksymalnie ${n} znaków`,
  email: 'Niepoprawny adres email',
  fileInvalid: 'Niepoprawny plik',
  fileTooLarge: (name, max) => `Plik "${name}" przekracza maksymalny rozmiar ${max} MB`,
  fileTypeNotAllowed: (name) => `Plik "${name}" ma niedozwolony typ`,
  fileExtensionNotAllowed: (name, allowed) =>
    `Plik "${name}" ma niedozwolone rozszerzenie. Dozwolone: ${allowed.join(', ')}`,
  fileMinCount: (min) => `Musisz dodać co najmniej ${min} plik(i)`,
  fileMaxCount: (max) => `Możesz dodać maksymalnie ${max} plik(i)`,
};

const isEmptyValue = (val) => {
  return (
    val === null ||
    val === '' ||
    typeof val === 'undefined' ||
    (typeof val === 'object' &&
      !Array.isArray(val) &&
      !(val instanceof File) &&
      val !== null &&
      Object.keys(val).length === 0)
  );
};

const isFileLike = (item) => {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.name === 'string' &&
    typeof item.size === 'number'
  );
};

const normalizeFiles = (val) => {
  if (!val) return [];

  if (Array.isArray(val)) return val.filter(Boolean);

  if (typeof FileList !== 'undefined' && val instanceof FileList) {
    return Array.from(val);
  }

  if (isFileLike(val)) return [val];

  return [];
};

const matchesAcceptRule = (file, acceptList = []) => {
  if (!acceptList.length) return true;

  const fileType = String(file.type || '').toLowerCase();
  const fileName = String(file.name || '').toLowerCase();

  return acceptList.some((rule) => {
    const normalizedRule = String(rule).toLowerCase().trim();

    if (normalizedRule.endsWith('/*')) {
      const prefix = normalizedRule.replace('/*', '/');
      return fileType.startsWith(prefix);
    }

    if (normalizedRule.startsWith('.')) {
      return fileName.endsWith(normalizedRule);
    }

    return fileType === normalizedRule;
  });
};

const matchesExtensionRule = (file, extensions = []) => {
  if (!extensions.length) return true;

  const fileName = String(file.name || '');
  const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';

  return extensions.map((e) => String(e).toLowerCase()).includes(ext);
};

const isValidEmail = (value) => {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

const validator = (schema = [], formState = {}) => {
  const errors = {};

  schema.forEach((field) => {
    if (!field?.name) return;

    const val = formState[field.name];
    const rules = field.validation || {};
    const fieldErrors = [];

    // required
    if (rules.required) {
      if (field.type === 'file' || rules.file) {
        const files = normalizeFiles(val);
        if (files.length === 0) {
          fieldErrors.push(defaultMessages.required);
        }
      } else if (isEmptyValue(val)) {
        fieldErrors.push(defaultMessages.required);
      }
    }

    // email
    if (
      (field.type === 'email' || field.input === 'email' || rules.type === 'email') &&
      val !== null &&
      val !== '' &&
      typeof val !== 'undefined'
    ) {
      if (!isValidEmail(val)) {
        fieldErrors.push(defaultMessages.email);
      }
    }

    // number
    if (rules.min !== undefined && val !== '' && !Number.isNaN(Number(val)) && Number(val) < rules.min) {
      fieldErrors.push(defaultMessages.min(rules.min));
    }

    if (rules.max !== undefined && val !== '' && !Number.isNaN(Number(val)) && Number(val) > rules.max) {
      fieldErrors.push(defaultMessages.max(rules.max));
    }

    // string
    if (rules.minLength !== undefined && typeof val === 'string' && val.length < rules.minLength) {
      fieldErrors.push(defaultMessages.minLength(rules.minLength));
    }

    if (rules.maxLength !== undefined && typeof val === 'string' && val.length > rules.maxLength) {
      fieldErrors.push(defaultMessages.maxLength(rules.maxLength));
    }

    if (rules.requiredChars && typeof val === 'string' && val.length < rules.requiredChars) {
      fieldErrors.push(`To pole powinno zawierać min ${rules.requiredChars} znaków`);
    }

    // file
    if (rules.file) {
      const fileRules = rules.file;
      const files = normalizeFiles(val);

      if (files.length > 0) {
        if (fileRules.minCount !== undefined && files.length < fileRules.minCount) {
          fieldErrors.push(defaultMessages.fileMinCount(fileRules.minCount));
        }

        if (fileRules.maxCount !== undefined && files.length > fileRules.maxCount) {
          fieldErrors.push(defaultMessages.fileMaxCount(fileRules.maxCount));
        }

        files.forEach((file) => {
          if (!isFileLike(file)) {
            fieldErrors.push(defaultMessages.fileInvalid);
            return;
          }

          if (fileRules.maxSizeMB !== undefined) {
            const maxBytes = Number(fileRules.maxSizeMB) * 1024 * 1024;
            if (file.size > maxBytes) {
              fieldErrors.push(defaultMessages.fileTooLarge(file.name, fileRules.maxSizeMB));
            }
          }

          if (fileRules.accept && !matchesAcceptRule(file, fileRules.accept)) {
            fieldErrors.push(defaultMessages.fileTypeNotAllowed(file.name));
          }

          if (fileRules.extensions && !matchesExtensionRule(file, fileRules.extensions)) {
            fieldErrors.push(
              defaultMessages.fileExtensionNotAllowed(file.name, fileRules.extensions)
            );
          }
        });
      }
    }

    // custom
    if (rules.custom && typeof rules.custom === 'function') {
      const custom = rules.custom(val, formState);
      if (custom) fieldErrors.push(custom);
    }

    if (fieldErrors.length) {
      errors[field.name] = [...new Set(fieldErrors)];
    }
  });

  return errors;
};

export default validator;