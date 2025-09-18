// FormulaModal.jsx
import React, { useRef } from 'react';
import {
  Modal, Box, Stack, Typography, Divider, Paper, Button, IconButton, Tooltip, TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

// Components
import FieldsList from './fieldsList';

const insertAtCaret = (el, text) => {
  if (!el) return;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const next = el.value.slice(0, start) + text + el.value.slice(end);
  el.value = next;
  const caret = start + text.length;
  // zaktualizuj caret
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(caret, caret);
  });
};

const FormulaModal = ({ open, onClose, columns }) => {
  const editorRef = useRef(null);

  const handleSelectColumn = (insertText /* '$field' lub '${Field name}' */, item) => {
    insertAtCaret(editorRef.current, insertText);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        role="dialog"
        aria-modal="true"
        sx={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(1100px, 90vw)',
          height: 'min(80vh, 800px)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          overflow: 'hidden',   // ważne: kontener nie rośnie, dzieci zarządzają scrollami
        }}
      >
        {/* HEADER */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.5 }}>
          <Typography variant="h6">Edytor Pola Customowego</Typography>
          <Stack direction="row" gap={1}>
            <Button size="small" variant="contained" startIcon={<SaveIcon />}>Zapisz</Button>
            <Tooltip title="Zamknij">
              <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Divider />

        {/* BODY: 3 kolumny w flexie */}
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,          // KLUCZ do działających scrolli wewnątrz
            display: 'flex',
            gap: 1.5,
            overflow: 'hidden',
          }}
        >
          {/* LEFT: Funkcje (scroll wewnętrzny) */}
          <Paper
            variant="outlined"
            sx={{
              flex: '0 0 260px',   // stała szerokość, można parametryzować
              minWidth: 220,
              maxWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Typography variant="subtitle2" sx={{ px: 1.25, py: 1 }}>Lista Funkcji</Typography>
            <Divider />
            <Box sx={{ p: 1, overflow: 'auto', flex: 1, minHeight: 0 }}>
              {/* tu wrzuć swoje chipy / listę funkcji do wstawiania */}
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Wstawki: concat(), upper(), round(), year(), dev(), pct(), zscore()…
              </Typography>
            </Box>

            <Divider />
            <Typography variant="subtitle2" sx={{ px: 1.25, py: 1 }}>Agregacje</Typography>
            <Box sx={{ p: 1, overflow: 'auto', flex: '0 0 40%', minHeight: 120 }}>
              {/* gsum/gavg/gcount… */}
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                gsum($field), gavg($field), gcount($field)…
              </Typography>
            </Box>
          </Paper>

          {/* CENTER: Edytor (wypełnia, ma własny układ i przewijanie podglądu) */}
          <Paper
            variant="outlined"
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Typography variant="subtitle2" sx={{ px: 1.25, py: 1 }}>Formuła</Typography>
            <Divider />
            <Box sx={{ p: 1.25 }}>
              <TextField
                inputRef={editorRef}
                multiline
                fullWidth
                minRows={4}
                maxRows={8}
                placeholder="Używaj pól jako $price, ${'Nazwa pola'}. Np. $qty * $price"
                size="small"
              />
            </Box>
            <Divider />
            <Typography variant="subtitle2" sx={{ px: 1.25, py: 1 }}>Podgląd</Typography>
            <Box sx={{ p: 1.25, overflow: 'auto', flex: '1 1 auto', minHeight: 0 }}>
              {/* tutaj wstaw live preview wyników (lista kilku pozycji) */}
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Podłącz evaluator, aby zobaczyć wartości dla przykładowych wierszy.
              </Typography>
            </Box>
          </Paper>

          {/* RIGHT: Lista pól (100% wysokości, własny scroll) */}
          <Box sx={{ flex: '0 0 360px', minWidth: 280, maxWidth: 420, minHeight: 0, display: 'flex' }}>
            <FieldsList
              data={columns.columns}
              onClick={handleSelectColumn}
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default FormulaModal;
