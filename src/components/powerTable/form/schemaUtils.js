import {normalizeOptions} from './utils';

export const FIELD_TYPES = new Set([
  "hidden",
  "text",
  "email",
  "number",
  "date",
  "datetime",
  "datetime-local",
  "textarea",
  "password",
  "switch",
  "bool",
  "boolean",
  "select",
  "select-object",
  "select-multiple",
  "file",
  "custom",
  "object",
]);

export const normalizeFieldType = (type) => {
  const t = String(type || "text").trim().toLowerCase();

  if (t === "int" || t === "integer" || t === "decimal" || t === "float" || t === "double" || t === "numeric") {
    return "number";
  }

  if (t === "varchar" || t === "string") {
    return "text";
  }

  if (t === "bool") {
    return "boolean";
  }

  if (t === "datetime_local") {
    return "datetime-local";
  }

  return FIELD_TYPES.has(t) ? t : "text";
};

export const normalizeField = (field = {}) => {
  const name = String(field.name ?? field.field ?? "").trim();

  if (!name) return null;

  const type = normalizeFieldType(field.type ?? field.input);

  const normalized = {
    ...field,

    name,
    field: field.field ?? name,

    label: field.label ?? name,
    placeholder: field.placeholder ?? field.label ?? name,

    type,
    input: field.input ?? type,

    defaultValue:
      field.defaultValue !== undefined
        ? field.defaultValue
        : field.default ?? undefined,

    xl: Number.isFinite(Number(field.xl)) ? Number(field.xl) : 6,
    md: Number.isFinite(Number(field.md)) ? Number(field.md) : 6,
    xs: Number.isFinite(Number(field.xs)) ? Number(field.xs) : 12,

    disabled: Boolean(field.disabled),
    required: Boolean(field.required),

    selectOptions: normalizeOptions(field.selectOptions || field.options || []),

    validation: Array.isArray(field.validation) ? field.validation : [],

    textFieldProps: field.textFieldProps || {},
    inputProps: field.inputProps || {},
    selectProps: field.selectProps || {},

    helperText: field.helperText ?? "",
  };

  return normalized;
};

export const normalizeSchema = (schema = []) => {
  if (!Array.isArray(schema)) return [];

  return schema
    .map(normalizeField)
    .filter(Boolean);
};

export const emptyColor = "#f6f6f6ff";