import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', // pod AppBar
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          maxWidth: 520,
          width: '100%',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Stack spacing={2.5} alignItems="center">
          <ErrorOutlineIcon
            sx={{
              fontSize: 56,
              color: 'text.secondary',
            }}
          />

          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Strona nie istnieje
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Podany adres nie odpowiada żadnej stronie w systemie.
          </Typography>

          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: 'action.hover',
              fontFamily: 'monospace',
              fontSize: 13,
              color: 'text.secondary',
              maxWidth: '100%',
              overflowWrap: 'anywhere',
            }}
          >
            {location.pathname}
          </Box>

          <Button
            component={RouterLink}
            to="//"
            variant="contained"
            size="medium"
            startIcon={<HomeIcon />}
            sx={{
              mt: 1,
              borderRadius: 999,
              px: 3,
            }}
          >
            Wróć do strony głównej
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NotFound;
