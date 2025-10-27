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
import { bulkFormState, createInitialStateFromSchema, applyCompute, normalizeOptions } from './utils';
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

  const [formState, setFormState] = useState(() => createInitialStateFromSchema(data, schema));
  const [errors, setErrors] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const init = createInitialStateFromSchema(data, schema);
    const computed = applyCompute(init, schema);
    setFormState(computed);
    setErrors({});
    setIsChanged(false);
  }, [JSON.stringify(data), JSON.stringify(schema)]);

  useEffect(() => {
    setIsChanged(false);
  }, [loading]);

  useEffect(() => {
    setIsValid(Object.keys(errors || {}).length === 0);
  }, [errors]);

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
      if (v instanceof File || v instanceof Blob) formData.append(k, v);
      else if (Array.isArray(v)) v.forEach((it, i) => formData.append(`${k}[${i}]`, it));
      else if (v instanceof Date) formData.append(k, v.toISOString());
      else if (typeof v === 'boolean') formData.append(k, v ? '1' : '0');
      else if (typeof v === 'object' && v !== null) formData.append(k, JSON.stringify(v));
      else formData.append(k, v != null ? v : '');
    });
    return formData;
  };

  const handleSubmit = () => {
    if (!onSubmit || typeof onSubmit !== 'function') {
      console.warn('Brak funkcji submit');
      return;
    }
    const finalData = mode === 'bulk' ? bulkFormState(formState, schema) : formState;
    // bulk -> prosty confirm
    if (mode === 'bulk') {
      const keys = Object.keys(finalData || {});
      if (keys.length === 0) {
        // nic do wysłania
        window.alert('Brak zmian do wysłania.');
        return;
      }

      // zbuduj krótki podgląd jako tekst (max długość dla czytelności)
      const previewLines = keys.map(k => {
        // znajdź etykietę pola z schematu jeśli jest
        const f = (Array.isArray(schema) ? schema.find(s => s.name === k) : null) || { label: k };
        let v = finalData[k];
        if (v === null) v = '[WYCZYŚĆ]';
        else if (v === '') v = '[WYCZYŚĆ]';
        else if (Array.isArray(v)) v = v.join(', ');
        else v = String(v);
        // ogranicz długość wartości
        if (v.length > 80) v = v.slice(0, 77) + '...';
        return `• ${f.label || k}: ${v}`;
      });


      const count = addons?.selectedIds ? addons.selectedIds : 0;
      const msg = `Na pewno chcesz wprowadzić zmiany do ${count} rekordów?\n\nPola do zmiany:\n${previewLines.join('\n')}\n\nKontynuować?`;

      if (!window.confirm(msg)) {
        return;
      }

      // potwierdzono → wyślij
      if (sendFormData) {
        onSubmit(prepareFormData(finalData));
      } else {
        onSubmit(finalData);
      }
      return;
    }

    // single / normal mode — od razu wysyłamy
    if (sendFormData) {
      onSubmit(prepareFormData(finalData));
    } else {
      onSubmit(finalData);
    }
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
      const value = typeof stateValue !== 'undefined' ? stateValue : (field.type === 'select-multiple' ? [] : '');
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
                onChange={(e) => setField(field.name, e.target.value)} // zapisujemy surowo (string) - jeśli chcesz parsować -> onCommit
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
          return (
            <Col key={field.name} {...colProps}>
              <FormControl fullWidth error={!!errorsText} disabled={field.disabled}>
                <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                <Select
                  labelId={`${field.name}-label`}
                  name={field.name}
                  label={field.label}
                  value={typeof value === 'undefined' || value === null ? (isMultiple ? [] : '') : value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setField(field.name, val);
                  }}
                  multiple={isMultiple}
                  size={field.size || 'small'}
                  {...(field.selectProps || {})}
                >
                  {!isMultiple && <MenuItem value="">{`-- ${field.label || 'Wybierz'} --`}</MenuItem>}
                  {opts.map((opt) => (
                    <MenuItem key={String(opt.value)} value={opt.value} disabled={opt.disabled} title={opt.title || ''}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                {errorsText ? <FormHelperText>{errorsText}</FormHelperText> : null}
              </FormControl>
            </Col>
          );
        }

        case 'file':
          return (
            <Col key={field.name} {...colProps}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  id={`file-${field.name}`}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setField(field.name, f);
                  }}
                  {...(field.inputProps || {})}
                />
                <label htmlFor={`file-${field.name}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Button variant="outlined" component="span" startIcon={<UploadFileIcon />} size={field.size === 'small' ? 'small' : 'medium'}>
                    {field.label || 'Wybierz plik'}
                  </Button>
                </label>
                {value ? <span style={{ fontSize: 13 }}>{value.name ?? String(value)}</span> : <span style={{ color: '#666', fontSize: 13 }}>{field.placeholder || ''}</span>}
                {(value) && (
                  <IconButton size="small" onClick={() => setField(field.name, null)} aria-label="clear file">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
              {errorsText && <div style={{ color: '#c00', marginTop: 6 }}>{errorsText}</div>}
            </Col>
          );

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
  // dane wejściowe (edytowany/ładowany obiekt)
  data: PropTypes.object,

  // schema: tablica definicji pól formularza.
  // Każdy element opisuje pojedyncze pole i może zawierać tylko poniższe właściwości.
  schema: PropTypes.arrayOf(
    PropTypes.shape({
      // identyfikator pola (wymagany)
      name: PropTypes.string.isRequired,

      // etykieta / tekst pomocniczy / placeholder
      label: PropTypes.string,
      helperText: PropTypes.string,
      placeholder: PropTypes.string,

      // typ pola (steruje wyborem kontrolki w FormTemplate)
      type: PropTypes.oneOf([
        'hidden', 'text', 'email', 'number', 'date', 'textarea',
        'password', 'switch', 'boolean', 'select',
        'select-object', 'select-multiple', 'file'
      ]),

      // drobne wskazówki dotyczące wejścia (np. 'datetime', 'email') - passthrough
      input: PropTypes.string,

      // layout / rozmiary siatki
      md: PropTypes.number,
      xl: PropTypes.number,
      xs: PropTypes.number,

      // wygląd / rozmiar kontrolki
      size: PropTypes.oneOf(['small', 'medium']),
      variant: PropTypes.string,

      // zachowanie kontrolki
      disabled: PropTypes.bool,
      validation: PropTypes.array,
      multiple: PropTypes.bool, // dla select
      rows: PropTypes.number,   // dla textarea
      step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // dla number
      min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      labelPlacement: PropTypes.oneOf(['end', 'start']), // dla switch

      // passthrough props dla komponetów MUI
      textFieldProps: PropTypes.object,
      inputProps: PropTypes.object,
      selectProps: PropTypes.object,

      // selectOptions: tablica opcji dla Select
      selectOptions: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.any.isRequired,
          label: PropTypes.string.isRequired,
          title: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
          disabled: PropTypes.bool,
        })
      ),

      // opcjonalne: pole pomocnicze do obliczeń/wyliczania wartości w createInitialState/applyCompute
      // (FormTemplate używa applyCompute przed renderem — pozostaw jako opcjonalność)
      computed: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
    })
  ).isRequired,

  // handlers + UI state
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
  success: PropTypes.bool,
  error: PropTypes.bool,
  submitButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  cardSX: PropTypes.object,
  formLabel: PropTypes.string,
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
