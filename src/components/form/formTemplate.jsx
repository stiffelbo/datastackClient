import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// MUI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  IconButton,
  Button,
  Alert,
  LinearProgress,
  TextField,
  Switch,
  Tooltip
} from '@mui/material';

// MUI Icons
import ClearIcon from '@mui/icons-material/Clear';

// Validation Utility
import validator from './validator.js'; // Ensure this path is correct or adjust accordingly


// Function to create an initial state object based on the schema
const createInitialStateFromSchema = (data, schema) => {
  const initialState = {};
  schema.forEach((field) => {
    if (field.type !== 'custom' && field.name)
      initialState[field.name] = data && data.hasOwnProperty(field.name) ? data[field.name] : field.type === 'select-multiple' ? [] : '';
  });
  return initialState;
};

const FormTemplate = ({ data = {}, schema = [], onSubmit, onCancel, onChange, loading, success, error, submitButtonText = 'Zapisz', cancelButtonText = 'Anuluj', cardSX = {}, formLabel = '', action = null, sendFormData = true}) => {
  const [formState, setFormState] = useState(createInitialStateFromSchema(data, schema));
  const [errors, setErrors] = useState({ initial: 'error' });
  const [isChanged, setIsChanged] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setFormState(createInitialStateFromSchema(data, schema));
    setIsChanged(false);
  }, [JSON.stringify(data)]);

  useEffect(() => {
    setIsChanged(false);
  }, [loading]);

  useEffect(() => {
    if (JSON.stringify(formState) !== JSON.stringify(createInitialStateFromSchema(data, schema))) {
      if (isChanged === false) {
        setIsChanged(true);
      }
    }
  }, [formState]);

  useEffect(() => {
    const keys = Object.keys(errors);
    if (keys.length > 0) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [errors])

  const handleChange = (key, val) => {
    const state = { ...formState };
    state[key] = val;
    setFormState(state);
    schema.forEach(field => {
      if (typeof field.compute === 'function') {
        const computedValue = field.compute(state);
        if (state[field.name] !== computedValue) {
          state[field.name] = computedValue;
        }
      }
    });
    if (onChange) {
      onChange(state)
    }
    const err = validator(schema, state);
    setErrors(err);
  }

  const prepareFormData = (formState) => {
    const formData = new FormData();

    Object.keys(formState).forEach(key => {
      const value = formState[key];

      // Handle different types of data
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // For arrays, append each value separately
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (value instanceof Date) {
        // Format the date as ISO string or as needed
        formData.append(key, value.toISOString());
      } else if (typeof value === 'boolean') {
        // Convert boolean to string for FormData
        formData.append(key, value ? '1' : '0');
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects if needed (flat structure)
        Object.keys(value).forEach(subKey => {
          formData.append(`${key}[${subKey}]`, value[subKey]);
        });
      } else {
        // Default handling for strings and numbers
        formData.append(key, value != null ? value : ''); // Handle null/undefined as empty string
      }
    });
    return formData;
  }

  const handleSubmit = () => {
    if (!onSubmit) {
      console.warn('Brak funckji submit');
      return;
    }
    if (sendFormData) {
      onSubmit(prepareFormData(formState))
    } else {
      onSubmit(formState);
    }
  }

  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      setFormState(createInitialStateFromSchema(data, schema));
      setIsChanged(false);
    }
  }

  const handleNestedFormChange = (key, nestedFormState) => {
    const updatedState = {
      ...formState,
      [key]: JSON.stringify(nestedFormState) // Convert nested form state to JSON string
    };
    setFormState(updatedState);
    const err = validator(schema, updatedState);
    setErrors(err);
  };

  const withTooltip = (field, element) => {
    if (!field.description) return element;
    return (
      <Tooltip title={field.description} arrow placement="top-start">
        <span style={{ display: 'block' }}>{element}</span> {/* important! */}
      </Tooltip>
    );
  };

  const renderLoading = () => {
    if (loading) {
      return <Grid item xs={12}><LinearProgress /></Grid>
    }
  }

  const renderError = () => {
    if (!loading && error) {
      return <Grid item xs={12}><Alert severity="error">Zapisywanie danych się nie powiodło!</Alert></Grid>
    }
  }

  const renderSuccess = () => {
    if (!loading && success) {
      return <Grid item xs={12}><Alert severity="success">Zapisano!</Alert></Grid>
    }
  }

  const renderSubmit = () => {
    if (!onSubmit) return;
    if (isValid && isChanged && !loading && !error && !success) {
      return <Button color="primary" onClick={e => handleSubmit()} fullWidth>{submitButtonText}</Button>
    }
    if (!isValid) {
      return <Alert severity="warning" sx={{ margin: '0 auto' }}>Uzupełnij dane formularza.</Alert>
    }
  }

  const renderCancel = () => {
    return <IconButton onClick={e => handleCancel()} size='small' title={cancelButtonText || 'Anuluj / Wyczyść formularz'} color="error"><ClearIcon /></IconButton>
  }

  const buildForm = () => {
    if (schema.length) {
      return schema.map((field, index) => {
        const value = formState[field.name] !== undefined ? formState[field.name] : '';
        const errorsText = errors[field.name] && errors[field.name].length ? errors[field.name].join(' ') : null;

        // Set up Grid item with default breakpoints
        const gridItemProps = {
          item: true,
          xs: 12, // Full width on extra-small screens
          md: field.md || 6, // Use field.md or default to 6 columns on medium screens
          xl: field.xl ? field.xl : field.md ? field.md : 4, // Use field.xl or default to 4 columns on extra-large screens
          key: field.name,
        };

        // Switch case for field types
        switch (field.type) {
          case 'hidden':
            return null;
          case 'custom':
            return <Grid {...gridItemProps}>
              {withTooltip(field, field.component())}
            </Grid>;
          case 'text':
            return (
              <Grid container spacing={1} alignItems="center" {...gridItemProps}>
                <Grid item xs={field.hints ? 10 : 12}>
                  {withTooltip(field, (
                    <TextField
                      fullWidth
                      id={field.name}
                      name={field.name}
                      label={field.label}
                      value={value}
                      onChange={e => handleChange(field.name, e.target.value)}
                      error={!!errorsText}
                      helperText={errorsText}
                      size={field.size || 'small'}
                      disabled={field.disabled}
                      required={field.required}
                      placeholder={field.placeholder}
                      variant={field.variant || 'outlined'}
                      InputLabelProps={{ shrink: true }}
                    />
                  ))}
                </Grid>
                {field.hints && (
                  <Grid item xs={2}>
                    <FormControl fullWidth>
                      <Select
                        value=""
                        displayEmpty
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        variant="outlined"
                        size="small"
                      >
                        {field.hints.map((hint) => (
                          <MenuItem key={hint} value={hint}>{hint}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>

            );
          case 'switch':
            return (
              <Grid {...gridItemProps}>
                {withTooltip(field, <FormControl error={!!errorsText} component="fieldset" disabled={field.disabled}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value === true || value === '1' || value === 1 || value === 'true'}
                        onChange={(e) => handleChange(field.name, e.target.checked ? '1' : '0')}
                        name={field.name}
                        color={field.color || 'primary'}
                        size={field.size || 'small'}
                        inputProps={{
                          'aria-label': field.label,
                          placeholder: field.placeholder || '',
                          title: field.title || '',
                          ...field.inputProps,
                        }}
                      />
                    }
                    label={field.label}
                    labelPlacement={field.labelPlacement || 'end'}
                  />
                  {errorsText && <FormHelperText>{errorsText}</FormHelperText>}
                  {field.helperText && !errorsText && <FormHelperText>{field.helperText}</FormHelperText>}
                </FormControl>)}
              </Grid>
            );
          case 'select':
            return (
              <Grid {...gridItemProps}>
                {withTooltip(field, <FormControl fullWidth error={!!errorsText}>
                  <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                  <Select
                    labelId={`${field.name}-label`}
                    name={field.name}
                    label={field.label}
                    value={value || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    disabled={field.disabled}
                    required={field.required}
                    inputProps={field.inputProps}
                    size={field.size || 'small'}
                  >
                    {field.selectOptions?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>)}
              </Grid>
            );
          case 'select-object':
            return (
              <Grid {...gridItemProps}>
                {withTooltip(field, <FormControl fullWidth error={!!errorsText}>
                  <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                  <Select
                    labelId={`${field.name}-label`}
                    name={field.name}
                    value={value || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    size={field.size || 'small'}
                    disabled={field.disabled}
                    required={field.required}
                    inputProps={{ ...field.inputProps }}
                  >
                    <MenuItem key="empty" value="">
                      {`--${field.label}--`}
                    </MenuItem>
                    {field.selectOptions?.map((option) => (
                      <MenuItem
                        key={option.id}
                        value={option.id}
                        disabled={option.disabled}
                        title={option.title || ''}
                      >
                        {option.val || option.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>)}
              </Grid>
            );
          case "select-boolean":
            return (
              <Grid {...gridItemProps}>
                {withTooltip(field, <FormControl fullWidth error={!!errorsText}>
                  <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                  <Select
                    labelId={`${field.name}-label`}
                    name={field.name}
                    value={
                      value === true
                        ? "true"
                        : value === false
                          ? "false"
                          : "null" // Handle null distinctly
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === "true"
                          ? true
                          : e.target.value === "false"
                            ? false
                            : null; // Convert back to appropriate boolean/null
                      handleChange(field.name, val);
                    }}
                    size={field.size || 'small'}
                    required={field.required}
                    disabled={field.disabled}
                  >
                    <MenuItem value="true">Tak</MenuItem>
                    <MenuItem value="false">Nie</MenuItem>
                    <MenuItem value="null">Brak Danych</MenuItem>
                  </Select>
                  {errorsText && <FormHelperText>{errorsText}</FormHelperText>}
                </FormControl>)}
              </Grid>
            );

          case 'number':
            return (
              <Grid {...gridItemProps}>
                {withTooltip(field, <TextField
                  name={field.name}
                  label={field.label}
                  type="number"
                  value={value || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  error={!!errorsText}
                  helperText={errorsText}
                  size={field.size || 'small'}
                  disabled={field.disabled}
                  required={field.required}
                  placeholder={field.placeholder || ''}
                  variant={field.variant || 'outlined'}
                  inputProps={{
                    step: field.step || 1,
                    min: field.min,
                    max: field.max,
                    title: field.title || '',
                    ...field.inputProps,
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />)}
              </Grid>
            );
          case 'date':
            return (
              <Grid {...gridItemProps}>
                {withTooltip(field, <TextField
                  type="date"
                  label={field.label}
                  value={value || ''}
                  name={field.name}
                  error={!!errorsText}
                  helperText={errorsText}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size={field.size || 'small'}
                  disabled={field.disabled}
                  required={field.required}
                  placeholder={field.placeholder || ''}
                  title={field.title || ''}
                  variant={field.variant || 'outlined'}
                  fullWidth
                  inputProps={{
                    min: field.min,
                    max: field.max,
                    ...field.inputProps,
                  }}
                />)}
              </Grid>
            );

          case 'textarea':
            return (
              <Grid {...gridItemProps}>
                {withTooltip(field, <TextField
                  id={field.name}
                  name={field.name}
                  label={field.label}
                  value={value}
                  onChange={e => handleChange(field.name, e.target.value)}
                  error={!!errorsText}
                  helperText={errorsText}
                  inputProps={{ ...field.inputProps, multiline: true, rows: 4 }}
                  InputLabelProps={{ shrink: true }}
                  size={field.size || 'small'}
                  disabled={field.disabled}
                  required={field.required}
                  placeholder={field.placeholder}
                  title={field.title || ''}
                  variant={field.variant || 'outlined'}
                  fullWidth
                  multiline={true}
                />)}
              </Grid>
            );
          case 'password':
            return (
              <Grid {...gridItemProps}>
                {withTooltip(field, <TextField
                  type="password"
                  label={field.label}
                  value={value || ''}
                  name={field.name}
                  error={!!errorsText}
                  helperText={errorsText}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size={field.size || 'small'}
                  disabled={field.disabled}
                  required={field.required}
                  title={field.title || ''}
                  variant={field.variant || 'outlined'}
                  fullWidth
                />)}
              </Grid>
            );

          case 'file':
            return (
              <Grid {...gridItemProps}>
                {withTooltip(field, <TextField
                  type="file"
                  id={field.name}
                  name={field.name}
                  label={field.label}
                  onChange={e => handleChange(field.name, e.target.files[0])} // Only single file handling here
                  error={!!errorsText}
                  helperText={errorsText}
                  inputProps={field.inputProps}
                  InputLabelProps={{ shrink: true }}
                  size={field.size || 'small'}
                  disabled={field.disabled}
                  required={field.required}
                  title={field.title || ''}
                  fullWidth
                />)}
              </Grid>
            );
          // Add more case blocks for other field types...
          default:
            return null; // Return nothing for unrecognized field types
        }
      });
    }
  };

  const renderActions = () => {
    return <Grid container>
      {action ? <Grid item>{action()}</Grid> : ''}
      <Grid item>
        {renderCancel()}
      </Grid>
    </Grid>
  }

  return (
    <Card sx={{ ...cardSX }}>
      <CardHeader
        title={formLabel}
        action={renderActions()}
      />
      <CardContent>
        <Grid container spacing={3}>
          {buildForm()}
        </Grid>
        <Grid container spacing={3} mt={1}>
          {renderLoading()}
          {renderError()}
          {renderSuccess()}
        </Grid>
      </CardContent>
      <CardActions sx={{ padding: '1em' }}>
        {renderSubmit()}
      </CardActions>
    </Card>
  )
}

export default FormTemplate

FormTemplate.propTypes = {
  data: PropTypes.object,
  schema: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string,
      descritpion: PropTypes.string,
      md: PropTypes.number,
      xl: PropTypes.number,
      size: PropTypes.string,
      disabled: PropTypes.bool,
      required: PropTypes.bool,
      placeholder: PropTypes.string,
      title: PropTypes.string,
      defaultValue: PropTypes.any,
      hints: PropTypes.array,
      compute: PropTypes.func,
      inputProps: PropTypes.object,
      selectOptions: PropTypes.array,
      validation: PropTypes.object,
      component: PropTypes.elementType,
      componentProps: PropTypes.object,
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
  formLabel: PropTypes.string,
  action: PropTypes.func,
  sendFormData: PropTypes.bool,
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
};

