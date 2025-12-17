import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import commentHtmlSx from './commentHtmlSx';

export default function CommentQuote({ replyTo }) {
  if (!replyTo) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        px: 1,
        py: 0.75,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.25, fontSize: 12 }}>
        {replyTo.authorName}
      </Typography>

      <Box
        sx={{
          ...commentHtmlSx,
          fontSize: 12,
          color: 'text.secondary',
          maxHeight: 96,
          overflow: 'hidden',
          position: 'relative',
          borderLeft: '2px solid',
          borderColor: 'divider',
          pl: 1,
          '&:after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 24,
            // wersja zgodna z theme (bez rgba na sztywno):
            background: (theme) =>
              `linear-gradient(to bottom, transparent, ${theme.palette.grey[200]})`,
            pointerEvents: 'none',
          },
        }}
        dangerouslySetInnerHTML={{ __html: replyTo.snippet }}
      />
    </Paper>
  );
}
