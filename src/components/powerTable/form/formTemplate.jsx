// FormTemplate.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  FormHelperText,
  Switch,
  ListSubheader
} from '@mui/material';

// MUI imports needed for buildForm
import ClearIcon from '@mui/icons-material/Clear';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';

import validatorDefault from './validator'; // ./validator.js
import { Row, Col } from '../grid/flexGrid'; // Twój flex grid
import BulkPreview from './bulkPreview';

//Utils
import { bulkFormState, createInitialStateFromSchema, createInitialBulkStateFromSchema, applyCompute, normalizeOptions } from './utils';
const emptyColor = "#f6f6f6ff";

// --- component ---
const FormTemplate = ({
  data = {},
  schema = [],
  onSubmit = null,
  onCancel = null,
  onChange = null,
  loading = false,
  success = false,
  error = false,
  submitButtonText = 'Zapisz',
  cancelButtonText = 'Anuluj',
  cardSX = {},
  formLabel = '',
  action = null,
  sendFormData = true,
  validator = null,
  mode = 'add',
  addons = {}
}) => {

  const validateFn = validator || validatorDefault;

  const [formState, setFormState] = useState(() =>
    mode === 'bulk'
      ? createInitialBulkStateFromSchema(schema)
      : createInitialStateFromSchema(data, schema)
  );
  const [fileInputKeys, setFileInputKeys] = useState({});
  const [errors, setErrors] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const init = mode === 'bulk'
      ? createInitialBulkStateFromSchema(schema)
      : createInitialStateFromSchema(data, schema);

    const computed = applyCompute(init, schema);
    setFormState(computed);
    setErrors({});
    setIsChanged(false);
  }, [mode, JSON.stringify(data), JSON.stringify(schema)]);

  useEffect(() => {
    setIsChanged(false);
  }, [loading]);

  useEffect(() => {
    setIsValid(Object.keys(errors || {}).length === 0);
  }, [errors]);

  const bumpFileInputKey = (fieldName) => {
    setFileInputKeys((prev) => ({
      ...prev,
      [fieldName]: (prev[fieldName] || 0) + 1,
    }));
  };

  const runValidation = (state) => {
    try {
      const v = validateFn(schema, state) || {};
      setErrors(v);
      return v;
    } catch (e) {
      console.error('validator error', e);
      setErrors({});
      return {};
    }
  };

  // setField: opts = { runValidate: boolean, raw: boolean }
  const setField = (key, value, opts = { runValidate: true, raw: false }) => {
    setFormState((prev) => {
      const candidate = { ...prev, [key]: value };
      const next = opts.raw ? candidate : applyCompute(candidate, schema);

      if (opts.runValidate) runValidation(next);

      if (typeof onChange === 'function') {
        try {
          onChange(next);
        } catch (err) {
          console.error('onChange callback error', err);
        }
      }

      setIsChanged(true);
      return next;
    });
  };

  const reset = () => {
    const init = createInitialStateFromSchema(data, schema);
    const computed = applyCompute(init, schema);
    setFormState(computed);
    setErrors({});
    setIsChanged(false);
  };

  const prepareFormData = (state) => {
    const formData = new FormData();

    Object.keys(state).forEach((k) => {
      const v = state[k];

      if (v instanceof File || v instanceof Blob) {
        formData.append(k, v);
        return;
      }

      if (Array.isArray(v)) {
        v.forEach((it) => {
          if (it instanceof File || it instanceof Blob) {
            formData.append(`${k}[]`, it);
          } else if (it instanceof Date) {
            formData.append(`${k}[]`, it.toISOString());
          } else if (typeof it === 'object' && it !== null) {
            formData.append(`${k}[]`, JSON.stringify(it));
          } else {
            formData.append(`${k}[]`, it != null ? String(it) : '');
          }
        });
        return;
      }

      if (v instanceof Date) {
        formData.append(k, v.toISOString());
        return;
      }

      if (typeof v === 'boolean') {
        formData.append(k, v ? '1' : '0');
        return;
      }

      if (typeof v === 'object' && v !== null) {
        formData.append(k, JSON.stringify(v));
        return;
      }

      formData.append(k, v != null ? String(v) : '');
    });

    return formData;
  };

  const handleSubmit = () => {
    if (!onSubmit || typeof onSubmit !== 'function') {
      console.warn('Brak funkcji submit');
      return;
    }

    const finalData = mode === 'bulk' ? bulkFormState(formState, schema) : formState;
    const validationErrors = runValidation(finalData);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (mode === 'bulk') {
      const keys = Object.keys(finalData || {});
      if (keys.length === 0) {
        window.alert('Brak zmian do wysłania.');
        return;
      }

      const previewLines = keys.map(k => {
        const f = (Array.isArray(schema) ? schema.find(s => s.name === k) : null) || { label: k };
        let v = finalData[k];

        if (v === null || v === '') v = '[WYCZYŚĆ]';
        else if (Array.isArray(v)) {
          v = v.map(item => item?.name || String(item)).join(', ');
        }
        else if (v instanceof File) {
          v = v.name;
        }
        else v = String(v);

        if (v.length > 80) v = v.slice(0, 77) + '...';
        return `• ${f.label || k}: ${v}`;
      });

      const count = addons?.selectedIds ? addons.selectedIds : 0;
      const msg = `Na pewno chcesz wprowadzić zmiany do ${count} rekordów?\n\nPola do zmiany:\n${previewLines.join('\n')}\n\nKontynuować?`;

      if (!window.confirm(msg)) {
        return;
      }

      if (sendFormData) onSubmit(prepareFormData(finalData));
      else onSubmit(finalData);
      return;
    }


    if (sendFormData) onSubmit(prepareFormData(finalData));
    else onSubmit(finalData);
  };


  const handleCancel = () => {
    if (typeof onCancel === 'function') return onCancel();
    reset();
  };

  const buildForm = () => {
    if (!Array.isArray(schema)) return null;

    return schema.map((field) => {
      if (!field || !field.name) return null;

      const md = field.md || 6;
      const xl = field.xl ?? (field.md ? field.md : 4);
      const stateValue = formState[field.name];
      const value =
        stateValue === undefined || stateValue === null
          ? (field.type === 'select-multiple' ? [] : '')
          : stateValue;
      const errorsText = errors?.[field.name] && errors[field.name].length ? (Array.isArray(errors[field.name]) ? errors[field.name].join(' ') : errors[field.name]) : null;

      // wrapper Col (twój grid)
      const colProps = { xs: 12, md, xl, pad: true, style: { marginBottom: '1em' } };
      if (mode === "bulk" && (stateValue === undefined || (field.type === 'number' && stateValue === ''))) {
        colProps.style = { ...colProps.style, backgroundColor: emptyColor }
      }

      switch (field.type) {
        case 'hidden':
          return null;
        case 'text':
        case 'email':
          return (
            <Col key={field.name} {...colProps}>
              <TextField
                fullWidth
                name={field.name}
                label={field.label}
                value={value}
                onChange={(e) => setField(field.name, e.target.value)}
                error={!!errorsText}
                helperText={errorsText || field.helperText}
                size={field.size || 'small'}
                disabled={field.disabled}
                required={field.required}
                placeholder={field.placeholder}
                variant={field.variant || 'outlined'}
                InputLabelProps={{ shrink: true }}
                {...(field.textFieldProps || {})}
              />
            </Col>
          );

        case 'number':
          return (
            <Col key={field.name} {...colProps}>
              <TextField
                fullWidth
                name={field.name}
                label={field.label}
                type="number"
                value={value === null || typeof value === 'undefined' ? '' : value}
                onChange={(e) => {
                  const raw = e.target.value;
                  const normalized = typeof raw === 'string' ? raw.replace(',', '.') : raw;
                  setField(field.name, normalized === '' ? '' : Number(normalized), { runValidate: true, raw: true });
                }}
                error={!!errorsText}
                helperText={errorsText || field.helperText}
                size={field.size || 'small'}
                disabled={field.disabled}
                required={field.required}
                placeholder={field.placeholder || ''}
                variant={field.variant || 'outlined'}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  step: field.step ?? 1,
                  min: field.min,
                  max: field.max,
                  title: field.title || '',
                  ...(field.inputProps || {}),
                }}
                {...(field.textFieldProps || {})}
              />
            </Col>
          );

        case 'date':
          return (
            <Col key={field.name} {...colProps}>
              <TextField
                fullWidth
                name={field.name}
                label={field.label}
                type="date"
                value={value || ''}
                onChange={(e) => setField(field.name, e.target.value)}
                error={!!errorsText}
                helperText={errorsText || field.helperText}
                InputLabelProps={{ shrink: true }}
                size={field.size || 'small'}
                disabled={field.disabled}
                required={field.required}
                placeholder={field.placeholder || ''}
                {...(field.textFieldProps || {})}
                inputProps={{ ...(field.inputProps || {}) }}
              />
            </Col>
          );

        case 'textarea':
          return (
            <Col key={field.name} {...colProps}>
              <TextField
                fullWidth
                name={field.name}
                label={field.label}
                value={value}
                onChange={(e) => setField(field.name, e.target.value)}
                error={!!errorsText}
                helperText={errorsText || field.helperText}
                size={field.size || 'small'}
                disabled={field.disabled}
                required={field.required}
                placeholder={field.placeholder}
                variant={field.variant || 'outlined'}
                multiline
                rows={field.rows || 4}
                {...(field.textFieldProps || {})}
                inputProps={{ ...(field.inputProps || {}) }}
              />
            </Col>
          );

        case 'password':
          return (
            <Col key={field.name} {...colProps}>
              <TextField
                fullWidth
                type="password"
                name={field.name}
                label={field.label}
                value={value || ''}
                onChange={(e) => setField(field.name, e.target.value)}
                error={!!errorsText}
                helperText={errorsText || field.helperText}
                size={field.size || 'small'}
                disabled={field.disabled}
                required={field.required}
                {...(field.textFieldProps || {})}
              />
            </Col>
          );

        case 'switch':
          return (
            <Col key={field.name} {...colProps}>
              <FormControl error={!!errorsText} component="fieldset" disabled={field.disabled}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!value}
                      onChange={(e) => setField(field.name, e.target.checked)}
                      name={field.name}
                      color={field.color || 'primary'}
                      size={field.size || 'small'}
                      {...(field.inputProps || {})}
                    />
                  }
                  label={field.label}
                  labelPlacement={field.labelPlacement || 'end'}
                />
                {errorsText ? <FormHelperText>{errorsText}</FormHelperText> : field.helperText ? <FormHelperText>{field.helperText}</FormHelperText> : null}
              </FormControl>
            </Col>
          );

        case 'select':
        case 'select-object':
        case 'select-multiple': {
          const isMultiple = field.type === 'select-multiple' || !!field.multiple;
          const opts = normalizeOptions(field.selectOptions || []);

          const groupedOptions = opts.reduce((acc, opt) => {
            const groupName = opt.group || '';
            if (!acc[groupName]) acc[groupName] = [];
            acc[groupName].push(opt);
            return acc;
          }, {});

          return (
            <Col key={field.name} {...colProps}>
              <FormControl fullWidth error={!!errorsText} disabled={field.disabled}>
                <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>

                <Select
                  labelId={`${field.name}-label`}
                  name={field.name}
                  label={field.label}
                  value={
                    typeof value === 'undefined' || value === null
                      ? (isMultiple ? [] : '')
                      : value
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setField(field.name, val);
                  }}
                  multiple={isMultiple}
                  size={field.size || 'small'}
                  {...(field.selectProps || {})}
                >
                  {!isMultiple && (
                    <MenuItem value="">
                      {`-- ${field.label || 'Wybierz'} --`}
                    </MenuItem>
                  )}

                  {Object.entries(groupedOptions).flatMap(([groupName, groupItems]) => {
                    const items = [];

                    if (groupName) {
                      items.push(
                        <ListSubheader key={`group-${groupName}`} disableSticky>
                          {groupName}
                        </ListSubheader>
                      );
                    }

                    groupItems.forEach((opt) => {
                      items.push(
                        <MenuItem
                          key={`opt-${opt.value}`}
                          value={opt.value}
                          disabled={opt.disabled}
                          title={opt.title || ''}
                        >
                          {opt.label}
                        </MenuItem>
                      );
                    });

                    return items;
                  })}
                </Select>

                {errorsText ? <FormHelperText>{errorsText}</FormHelperText> : null}
              </FormControl>
            </Col>
          );
        }

        case 'file': {
          const isMultiple = !!field.multiple || !!field.inputProps?.multiple;
          const currentValue = formState[field.name];

          const files = Array.isArray(currentValue)
            ? currentValue
            : currentValue instanceof File
              ? [currentValue]
              : [];

          const inputId = `file-${field.name}`;
          const inputKey = `${field.name}-${fileInputKeys[field.name] || 0}`;

          return (
            <Col key={field.name} {...colProps}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  key={inputKey}
                  id={inputId}
                  name={field.name}
                  type="file"
                  style={{ display: 'none' }}
                  multiple={isMultiple}
                  accept={field.inputProps?.accept}
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);

                    const nextValue = isMultiple
                      ? selectedFiles
                      : (selectedFiles[0] ?? null);

                    setField(field.name, nextValue);
                  }}
                  {...(field.inputProps || {})}
                />

                <label htmlFor={inputId} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadFileIcon />}
                    size={field.size === 'small' ? 'small' : 'medium'}
                  >
                    {field.label || 'Wybierz plik'}
                  </Button>
                </label>

                {files.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {files.map((file, idx) => (
                      <span key={`${field.name}-${idx}`} style={{ fontSize: 13 }}>
                        {file?.name || String(file)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#666', fontSize: 13 }}>
                    {field.placeholder || 'Nie wybrano pliku'}
                  </span>
                )}

                {files.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setField(field.name, isMultiple ? [] : null);
                      bumpFileInputKey(field.name); // reset native input
                    }}
                    aria-label="clear file"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </div>

              {errorsText && (
                <div style={{ color: '#c00', marginTop: 6 }}>
                  {errorsText}
                </div>
              )}

              {!errorsText && field.helperText && (
                <div style={{ color: '#666', marginTop: 6, fontSize: 12 }}>
                  {field.helperText}
                </div>
              )}
            </Col>
          );
        }

        case 'bool':
        case 'boolean': {
          // Specjalny select z ikonami, null = brak, true = Prawda, false = Fałsz
          const normalizeIncoming = (v) => {
            if (v === null || v === undefined || v === '') return null;
            if (typeof v === 'boolean') return v;
            if (v === 'true' || v === '1' || v === 1) return true;
            if (v === 'false' || v === '0' || v === 0) return false;
            return null;
          };
          const toSelectValue = (v) => (v === null ? "" : v === true ? "true" : "false");

          const normalized = normalizeIncoming(value);

          const handleChange = (e) => {
            let v = e.target.value;
            if (v === "") v = null;
            else if (v === "true") v = true;
            else if (v === "false") v = false;
            setField(field.name, v);
          };

          const itemStyle = { display: 'flex', alignItems: 'center', gap: 1 };

          return (
            <Col key={field.name} {...colProps}>
              <FormControl fullWidth error={!!errorsText} disabled={field.disabled}>
                <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                <Select
                  value={toSelectValue(normalized)}
                  onChange={handleChange}
                  size="small"
                  variant="outlined"
                  fullWidth
                  error={!!errorsText}
                  title={errorsText || undefined}
                >
                  <MenuItem value="">
                    <Box sx={itemStyle}>
                      <RemoveIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>— Brak —</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="true">
                    <Box sx={itemStyle}>
                      <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
                      <Typography variant="body2">Tak</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="false">
                    <Box sx={itemStyle}>
                      <CloseIcon fontSize="small" sx={{ color: 'error.main' }} />
                      <Typography variant="body2">Nie</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              {errorsText && <div style={{ color: '#c00', marginTop: 6 }}>{errorsText}</div>}
            </Col>
          );
        }
        case 'custom':
          return (
            <Col key={field.name} {...colProps}>
              {typeof field.render === 'function'
                ? field.render({
                    value,
                    field,
                    formState,
                    setField,
                    errors,
                    row: data,
                    mode,
                  })
                : null}
            </Col>
          );

        default:
          // fallback: generic text input
          return (
            <Col key={field.name} {...colProps}>
              <TextField
                fullWidth
                name={field.name}
                label={field.label}
                value={value || ''}
                onChange={(e) => setField(field.name, e.target.value)}
                error={!!errorsText}
                helperText={errorsText || field.helperText}
                size={field.size || 'small'}
                disabled={field.disabled}
                required={field.required}
                {...(field.textFieldProps || {})}
              />
            </Col>
          );
      }
    });
  };

  const renderTopActions = () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {action ? action() : null}
      <IconButton onClick={handleCancel} size="small" title={cancelButtonText || 'Anuluj'} color="error">
        <ClearIcon />
      </IconButton>
    </div>
  );

  return (
    <Card sx={{ ...cardSX }}>
      <CardHeader title={formLabel} action={renderTopActions()} />
      <CardContent>
        <Row gap={2}>
          {buildForm()}
        </Row>

        <Row gap={2}>
          <BulkPreview mode={mode} selectedCount={addons?.selectedIds?.length ?? 0} formState={formState} schema={schema} />
        </Row>

        <Row gap={2} style={{ marginTop: 8 }}>
          <Col xs={12}>
            {loading && <LinearProgress />}
            {!loading && error && <Alert severity="error" sx={{ mt: 1 }}>Zapisywanie danych się nie powiodło!</Alert>}
            {!loading && success && <Alert severity="success" sx={{ mt: 1 }}>Zapisano!</Alert>}
          </Col>
        </Row>
      </CardContent>

      <CardActions sx={{ padding: '1em' }}>
        {onSubmit ? (
          <Button color="primary" onClick={handleSubmit} disabled={!isValid || !isChanged || loading} fullWidth>
            {submitButtonText}
          </Button>
        ) : null}
      </CardActions>
      {/* tutaj preview masowych zmian */}

    </Card>
  );
};

FormTemplate.propTypes = {
  data: PropTypes.object,
  schema: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string,
      helperText: PropTypes.string,
      placeholder: PropTypes.string,
      type: PropTypes.oneOf([
        'hidden', 'text', 'email', 'number', 'date', 'textarea',
        'password', 'switch', 'boolean', 'select',
        'select-object', 'select-multiple', 'file'
      ]),
      input: PropTypes.string,
      md: PropTypes.number,
      xl: PropTypes.number,
      xs: PropTypes.number,
      size: PropTypes.oneOf(['small', 'medium']),
      variant: PropTypes.string,
      disabled: PropTypes.bool,
      validation: PropTypes.array,
      multiple: PropTypes.bool,
      rows: PropTypes.number,
      step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      labelPlacement: PropTypes.oneOf(['end', 'start']),
      textFieldProps: PropTypes.object,
      inputProps: PropTypes.object,
      selectProps: PropTypes.object,
      selectOptions: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.any.isRequired,
          label: PropTypes.string.isRequired,
          title: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
          disabled: PropTypes.bool,
        })
      ),
      computed: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
    })
  ).isRequired,

  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
  success: PropTypes.bool,
  error: PropTypes.bool,
  submitButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  cardSX: PropTypes.object,

  formLabel: PropTypes.node,

  action: PropTypes.func,
  sendFormData: PropTypes.bool,
  validator: PropTypes.func,
};


FormTemplate.defaultProps = {
  data: {},
  onCancel: null,
  loading: false,
  success: false,
  error: false,
  submitButtonText: 'Zapisz',
  cancelButtonText: 'Anuluj',
  cardSX: {},
  formLabel: '',
  action: null,
  sendFormData: true,
  validator: null,
};

export default FormTemplate;
