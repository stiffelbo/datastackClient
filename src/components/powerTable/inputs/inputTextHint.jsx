import React, { useState, useEffect } from 'react';
import {
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Box,
  InputAdornment,
} from '@mui/material';

const InputTextHint = ({
  hints = [],
  onSubmit,
  placeholder = 'Podaj nazwę...',
  title = '',
  defaultValue = '',
  sx = {},
  icon = null,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    setValue(e.target.value);
    setOpen(true);
  };

  const handleSelect = (hint) => {
    setValue(hint);
    setOpen(false);
    onSubmit?.(hint);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.(value.trim());
      setOpen(false);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const filtered = hints.filter((g) =>
    g.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    if (defaultValue !== value) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  return (
    <Box sx={{ position: 'relative', width: '100%', ...sx }} title={title}>
      <TextField
        value={value}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size="small"
        variant="standard"
        fullWidth
        InputProps={{
          startAdornment: icon ? (
            <InputAdornment position="start" sx={{ color: 'grey.500' }}>
              {icon}
            </InputAdornment>
          ) : null,
        }}
      />

      {open && filtered.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 5,
            maxHeight: 200,
            overflow: 'auto',
          }}
          elevation={4}
        >
          <List dense>
            {filtered.map((g) => (
              <ListItemButton key={g} onMouseDown={() => handleSelect(g)}>
                <ListItemText primary={g} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default InputTextHint;
