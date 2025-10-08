import React from 'react';
import { TableCell, Typography } from '@mui/material';
import { valueFormatters } from './valueFormatters';

const PowerTableCell = ({ value, column, settings, title = null }) => {
  const {
    sx = {},
    densityPadding = '6px 10px',
    fontSize = '0.8rem',         // 👈 domyślnie mniejsza czcionka
    wrap = true,                 // 👈 zawijanie treści domyślnie ON
    ellipsis = false,            // 👈 zamiast zawijania można uciąć
    align = column.align || 'left',
  } = settings || {};

  const formatter = column.formatterKey
    ? valueFormatters[column.formatterKey]
    : null;

  let displayValue = value ?? '';
  if (typeof formatter === 'function') {
    try {
      displayValue = formatter(value, column.formatterOptions || {});
    } catch (err) {
      console.warn(`Formatter error for column ${column.field}`, err);
    }
  }

  return (
    <TableCell
      sx={{
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
        padding: densityPadding,
        fontSize,
        lineHeight: 1.3,
        verticalAlign: 'top',   // 👈 treść zaczyna się od góry
        textAlign: align,
        whiteSpace: wrap ? 'normal' : 'nowrap',
        overflow: ellipsis ? 'hidden' : 'visible',
        textOverflow: ellipsis ? 'ellipsis' : 'clip',
        ...sx,
      }}
      title={title ? title : ellipsis ? String(displayValue) : undefined} // tooltip tylko jeśli ellipsis
    >
      <Typography
        component="div"
        variant="body2"
        sx={{
          fontSize,
          whiteSpace: wrap ? 'normal' : 'nowrap',
          overflow: ellipsis ? 'hidden' : 'visible',
          textOverflow: ellipsis ? 'ellipsis' : 'clip',
        }}
      >
        {displayValue}
      </Typography>
    </TableCell>
  );
};

export default PowerTableCell;
