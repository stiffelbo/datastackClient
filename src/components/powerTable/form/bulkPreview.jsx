// BulkPreview.jsx
import React from 'react';
import { Box, Alert, List, ListItem, ListItemText, Divider, Typography } from '@mui/material';

import { bulkFormState, formatFieldValue } from './utils';

const isEmptyValue = (val) => {
  if (val === null) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
};

const BulkPreview = ({ mode = 'single', selectedCount = 0, formState = {}, schema = [] }) => {
  if (mode !== 'bulk') return null;

  const stateToSubmit = bulkFormState(formState, schema);
  const entries = Object.entries(stateToSubmit);

  return (
    <Box mt={2} sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', margin: '0 auto' }}>
      <Alert severity="default" sx={{ mb: 1 }}>
        Zostanie zmienionych <strong>{selectedCount}</strong> rekordów. Poniżej podgląd pól które zostaną zaktualizowane.
      </Alert>
      <Alert severity="info" sx={{ mb: 1 }}>
        W razie wątpliwości ponownie uruchom formularz i ustaw wybrane wartości.
      </Alert>

      {entries.length === 0 ? (
        <Typography variant="body2" color="textSecondary">Brak zmian do wysłania.</Typography>
      ) : (
        <List dense disablePadding>
          {entries.map(([key, val]) => {
            const field = schema.find(f => f.name === key) || { name: key, label: key, type: typeof val };
            const label = field.label || field.name;
            const type = field.type || typeof val;
            const display = formatFieldValue(field, val);

            const empty = isEmptyValue(val);

            return (
              <React.Fragment key={key}>
                <ListItem
                  sx={{
                    py: 0.5,
                    // highlight empty values with a light warning background
                    backgroundColor: empty ? (theme => theme.palette.warning.light) : 'transparent',
                    borderRadius: 1,
                    mb: empty ? 1 : 0,
                  }}
                >
                  <ListItemText
                    primary={<span style={{ fontWeight: 600 }}>{label}</span>}
                    secondary={
                      <span style={{ color: empty ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.7)' }}>
                        {type} — {display}
                      </span>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default BulkPreview;
