/**
 * Drawer (wysuwany panel) do obsługi presetów widoku.
 * - Wyświetla listę zapisanych presetów.
 * - Pozwala zapisać nowy preset lub nadpisać aktualny.
 * - Opcja udostępniania presetów (na późniejszym etapie).
 */
import React from 'react';
import { Drawer, List, ListItem, Button } from '@mui/material';

const PresetsDrawer = ({ open, onClose, presets, onApply, onSave }) => {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <div style={{ width: 300, padding: 16 }}>
        <h3>Presety widoku</h3>
        <List>
          {presets.map(preset => (
            <ListItem key={preset.id} button onClick={() => onApply(preset)}>
              {preset.name}
            </ListItem>
          ))}
        </List>
        <Button fullWidth variant="contained" onClick={onSave}>
          Zapisz nowy preset
        </Button>
      </div>
    </Drawer>
  );
};

export default PresetsDrawer;
