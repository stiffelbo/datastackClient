// components/dashboard/BaseEntityPage.jsx
import React, { useMemo, useEffect } from 'react';
import { Box, Tabs, Tab, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';
import { useRwd } from '../../context/RwdContext';

const DEFAULT_TABS = [
  {
    key: 'details',
    label: 'Szczegóły',
    component: ({ row }) => (
      <pre style={{ fontSize: 11 }}>{JSON.stringify(row, null, 2)}</pre>
    ),
  },
];

/**
 * BaseEntityPage
 *
 * Props:
 * - entityName: string
 * - id: number|string
 * - row: object
 * - rows: array
 * - onChangeId: (nextId|null) => void
 * - tabs: [{ key, label, pageKey?, component, getProps? }]
 * - tab: string (aktualny klucz taba)
 * - setTab: (key) => void
 */
const BaseEntityPage = ({
  entityName,
  id,
  row,
  rows = [],
  onChangeId,
  tabs = [],
  tab,
  setTab,
  heightSpan
}) => {
  const rwd = useRwd();
  
  if (!tabs.length) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Brak dostępnych zakładek dla encji {entityName}.
        </Typography>
      </Box>
    );
  }

  const activeTab = tabs.find((t) => t.key === tab) || tabs[0];
  const activeNode = activeTab.component; // to jest ReactElement

  const handleTabChange = (e, value) => setTab?.(value);
  const handleClose = () => onChangeId?.(null);

  const currentIndex = rows.findIndex((r) => String(r.id) === String(id));
  const prevId = currentIndex > 0 ? rows[currentIndex - 1]?.id : null;
  const nextId =
    currentIndex >= 0 && currentIndex < rows.length - 1
      ? rows[currentIndex + 1]?.id
      : null;

  const goPrev = () => prevId && onChangeId?.(prevId);
  const goNext = () => nextId && onChangeId?.(nextId);

  const height = rwd.height - heightSpan;

  return (
    <Box sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          px: 1,
          py: 0.5,
          gap: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ flex: 1 }} noWrap>
          {entityName} #{id}
        </Typography>

        {onChangeId && (
          <>
            <IconButton size="small" disabled={!prevId} onClick={goPrev}>
              ‹
            </IconButton>
            <IconButton size="small" disabled={!nextId} onClick={goNext}>
              ›
            </IconButton>
          </>
        )}

        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* TABS */}
      <Box sx={{ borderBottom: '1px solid #eee' }}>
        <Tabs
          value={activeTab.key}
          onChange={handleTabChange}
          variant="scrollable"
        >
          {tabs.map((t) => (
            <Tab key={t.key} value={t.key} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {/* CONTENT */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
        {activeNode ?? (
          <Typography variant="body2" color="text.secondary">
            Brak komponentu dla zakładki {activeTab.key}
          </Typography>
        )}
      </Box>
    </Box>
  );
};


export default BaseEntityPage;
