import React, { useMemo, useState } from 'react';
import {
  Modal,
  Box,
  Stack,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Badge,
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import UndoIcon from '@mui/icons-material/Undo';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { normalizeOverrides, equalOverrides, importPresetFromFile, exportPresetToFile } from './hooks/presetUtils';

import PresetsList from './presetsUI/presetsList';
import PresetGroups from './presetsUI/presetGroups';
import TableSettings from './presetsUI/tableSettings';
import FieldsList from './presetsUI/fieldsList';
import PresetFile from './presetsUI/presetFile';
import DirtyToolbar from './presetsUI/dirtyToolbar';

const TABS = {
  PRESETS: 'presets',
  TABLE: 'table',
  FIELDS: 'fields',
  GROUPS: 'groups',
  IMPORT_EXPORT: 'importExport',
};

const SettingsModal = ({ open, onClose, presets, columns }) => {
  const [tab, setTab] = useState(TABS.PRESETS);

  const {
    dirty,
    save,
    discard,
    stage,
    persistedActive,
  } = presets || {};

  const localDirty = useMemo(() => {
    const current = normalizeOverrides(columns?.columns || []);
    const persisted = normalizeOverrides(persistedActive?.columns || []);
    return !equalOverrides(current, persisted);
  }, [columns, persistedActive]);

  const canSave = dirty || localDirty;

  const handleSave = () => {
    const current = normalizeOverrides(columns?.columns || []);
    stage(current);
    save(current);
  };

  const renderTab = () => {
    switch (tab) {
      case TABS.PRESETS:
        return (
          <PresetsList presets={presets} />
        );

      case TABS.TABLE:
        return (
          <TableSettings
            presets={presets}
            columns={columns}
          />
        );

      case TABS.FIELDS:
        return (
          <FieldsList
            columns={columns}
          />
        );

      case TABS.GROUPS:
        return (
          <PresetGroups
            columns={columns}
          />
        );

      case TABS.IMPORT_EXPORT:
        return (
          <PresetFile
            presets={presets}
            onClose={onClose}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        role="dialog"
        aria-modal="true"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(1200px, 94vw)',
          height: 'min(86vh, 860px)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ flex: '0 0 58.333%', minWidth: 0 }}>
            <Tabs
              value={tab}
              onChange={(_, next) => setTab(next)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 40 }}
            >
              <Tab sx={{ minHeight: 40 }} value={TABS.PRESETS} label="Presety" />
              <Tab sx={{ minHeight: 40 }} value={TABS.TABLE} label="Tabela" />
              <Tab sx={{ minHeight: 40 }} value={TABS.FIELDS} label="Pola" />
              <Tab sx={{ minHeight: 40 }} value={TABS.GROUPS} label="Grupy" />
              <Tab sx={{ minHeight: 40 }} value={TABS.IMPORT_EXPORT} label="Import / Export" />
            </Tabs>
          </Box>

          <Box
            sx={{
              flex: '0 0 41.667%',
              minWidth: 0,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <DirtyToolbar
              dirty={canSave}
              stagedDirty={dirty}
              onSave={handleSave}
              onDiscard={discard}
              onRefresh={() => presets?.reinitialize?.()}
              onClose={onClose}
            />
          </Box>
        </Stack>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: 2,
          }}
        >
          {renderTab()}
        </Box>
      </Box>
    </Modal>
  );
};


export default SettingsModal;