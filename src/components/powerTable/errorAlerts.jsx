import React from 'react';
import PropTypes from 'prop-types';
import { Box, Alert, IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * ErrorAlerts
 *
 * Props:
 *  - error: any (string | object | array | axios error)
 *  - onClose: function to call when user closes the alert
 *  - severity: 'error'|'warning'|'info'|'success' (default: 'error')
 *  - sx: style object for outer Box
 *  - maxChars: number - limit for JSON.stringify fallback (default 500)
 */
export default function ErrorAlerts({ error, onClose, severity = 'error', sx = {}, maxChars = 500 }) {
  if (!error) return null;

  const parts = [];

  // string
  if (typeof error === 'string' && error.trim() !== '') {
    parts.push(error.trim());
  } else if (Array.isArray(error)) {
    // array of messages or objects
    error.forEach(it => {
      if (!it) return;
      if (typeof it === 'string') parts.push(it);
      else if (it.message) parts.push(String(it.message));
      else parts.push(String(it));
    });
  } else if (error && typeof error === 'object') {
    // axios-like: response.statusText
    if (error?.response?.statusText) parts.push(String(error.response.statusText));

    // axios-like: response.data.error
    if (error?.response?.data?.error) {
      const de = error.response.data.error;
      if (Array.isArray(de)) parts.push(...de.map(d => String(d)));
      else parts.push(String(de));
    }

    // axios-like: response.data.errors (array or object)
    const dataErrors = error?.response?.data?.errors;
    if (Array.isArray(dataErrors)) {
      dataErrors.forEach(it => {
        if (!it) return;
        if (typeof it === 'string') parts.push(it);
        else if (it.message) parts.push(String(it.message));
        else parts.push(String(it));
      });
    } else if (dataErrors && typeof dataErrors === 'object') {
      Object.values(dataErrors).forEach(val => {
        if (!val) return;
        if (Array.isArray(val)) val.forEach(vv => vv && parts.push(String(vv)));
        else parts.push(String(val));
      });
    }

    // direct message
    if (error.message) parts.push(String(error.message));

    // fallback response.data as string
    const respData = error?.response?.data;
    if (typeof respData === 'string' && respData.trim() !== '') parts.push(respData.trim());

    // if nothing found, stringify object (limited)
    if (parts.length === 0) {
      try {
        const s = JSON.stringify(error);
        parts.push(s.length > maxChars ? s.slice(0, maxChars) + '...' : s);
      } catch (e) {
        parts.push(String(error));
      }
    }
  } else {
    // other types (number, boolean, etc.)
    parts.push(String(error));
  }

  // normalize: trim, remove falsy, dedupe, limit to reasonable number
  const cleaned = Array.from(new Set(parts.map(p => p && String(p).trim()).filter(Boolean))).slice(0, 20);
  if (cleaned.length === 0) return null;

  return (
    <Box sx={{ mt: 2, px: 2, ...sx }}>
      <Collapse in={cleaned.length > 0}>
        <Alert
          severity={severity}
          action={
            typeof onClose === 'function' ? (
              <IconButton aria-label="close" color="inherit" size="small" onClick={onClose}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            ) : null
          }
          sx={{ mb: 1 }}
        >
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            {cleaned.map((msg, i) => (
              <li key={i} style={{ marginBottom: i === cleaned.length - 1 ? 0 : 6 }}>
                {msg}
              </li>
            ))}
          </ul>
        </Alert>
      </Collapse>
    </Box>
  );
}

ErrorAlerts.propTypes = {
  error: PropTypes.any,
  onClose: PropTypes.func,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  sx: PropTypes.object,
  maxChars: PropTypes.number,
};
