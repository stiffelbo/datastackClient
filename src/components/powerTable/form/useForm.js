// useForm.js
import { useEffect, useState, useMemo, useCallback } from "react";

import validatorDefault from "./validator";

import {
  bulkFormState,
  createInitialStateFromSchema,
  createInitialBulkStateFromSchema,
  applyCompute,
  prepareFormData,
} from "./utils";

const stableJson = (value) => {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return String(value);
  }
};

const buildInitialFormState = ({ mode, data, schema }) => {
  const init =
    mode === "bulk"
      ? createInitialBulkStateFromSchema(schema)
      : createInitialStateFromSchema(data, schema);

  return applyCompute(init, schema);
};

export const useForm = ({
  data = {},
  schema = [],
  mode = "add",
  validator = null,
  onChange = null,
  onSubmit = null,
  sendFormData = true,
  addons = {},
} = {}) => {
  const validateFn = validator || validatorDefault;

  const [formState, setFormState] = useState(() =>
    buildInitialFormState({ mode, data, schema })
  );

  const [errors, setErrors] = useState({});
  const [isChanged, setIsChanged] = useState(false);

  const isValid = Object.keys(errors || {}).length === 0;

  const schemaKey = stableJson(schema);
  const dataKey = stableJson(data);

  const schemaMap = useMemo(() => {
    const map = {};
    (Array.isArray(schema) ? schema : []).forEach((f) => {
      if (f?.name) map[f.name] = f;
    });
    return map;
  }, [schema]);

  useEffect(() => {
    setFormState(buildInitialFormState({ mode, data, schema }));
    setErrors({});
    setIsChanged(false);
  }, [mode, dataKey, schemaKey]);

  const runValidation = (state) => {
    try {
      const validationErrors = validateFn(schema, state) || {};
      setErrors(validationErrors);
      return validationErrors;
    } catch (e) {
      console.error("validator error", e);
      setErrors({});
      return {};
    }
  };

  const setField = (key, value, opts = { runValidate: true, raw: false }) => {
    setFormState((prev) => {
      const candidate = { ...prev, [key]: value };
      const next = opts.raw ? candidate : applyCompute(candidate, schema);

      if (opts.runValidate) {
        runValidation(next);
      }

      if (typeof onChange === "function") {
        try {
          onChange(next);
        } catch (err) {
          console.error("onChange callback error", err);
        }
      }

      setIsChanged(true);
      return next;
    });
  };

  const reset = () => {
    setFormState(buildInitialFormState({ mode, data, schema }));
    setErrors({});
    setIsChanged(false);
  };

  const getFinalData = () => {
    return mode === "bulk"
      ? bulkFormState(formState, schema)
      : formState;
  };

  const submit = () => {
    if (!onSubmit || typeof onSubmit !== "function") {
      console.warn("Brak funkcji submit");
      return false;
    }

    const finalData = getFinalData();
    const validationErrors = runValidation(finalData);

    if (Object.keys(validationErrors).length > 0) {
      return false;
    }

    if (mode === "bulk") {
      const keys = Object.keys(finalData || {});

      if (keys.length === 0) {
        window.alert("Brak zmian do wysłania.");
        return false;
      }

      const count = Array.isArray(addons?.selectedIds)
        ? addons.selectedIds.length
        : addons?.selectedIds ?? 0;

      const msg = `Na pewno chcesz wprowadzić zmiany do ${count} rekordów?`;

      if (!window.confirm(msg)) {
        return false;
      }
    }

    onSubmit(sendFormData ? prepareFormData(finalData) : finalData);
    setIsChanged(false);

    return true;
  };

  const getField = useCallback(
    (name) => {
      return schemaMap[name] || null;
    },
    [schemaMap]
  );

  const getErrorText = useCallback(
    (name) => {
      const error = errors?.[name];
      if (!error) return null;

      return Array.isArray(error)
        ? error.join(" ")
        : String(error);
    },
    [errors]
  );

  const getValue = useCallback(
    (name, fallback = "") => {
      const v = formState?.[name];
      if (v === undefined || v === null) return fallback;
      return v;
    },
    [formState]
  );

  const getFieldState = useCallback(
    (name) => {
      const field = schemaMap[name] || null;
      const value = formState?.[name];
      const error = errors?.[name];

      return {
        field,
        value: value ?? "",
        error,
        errorText: error
          ? Array.isArray(error)
            ? error.join(" ")
            : String(error)
          : null,
      };
    },
    [schemaMap, formState, errors]
  );

  return {
    formState,
    setFormState,

    getField,
    getErrorText,
    getValue,
    getFieldState,

    errors,
    setErrors,

    isChanged,
    setIsChanged,

    isValid,

    setField,
    reset,
    runValidation,
    getFinalData,
    submit,
  };
};