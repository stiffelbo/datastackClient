import React, { useMemo } from 'react';
import { Box, Tabs, Tab, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DEFAULT_TABS = [
  { key: 'details', label: 'Szczegóły', type: 'default' },
];

const BaseEntityPage = ({
  entityName,
  id,
  row,
  rows = [],
  schema,
  tabsConfig,
  tab,
  setTab,
  onChangeId,
}) => {
  const tabs = useMemo(
    () => (tabsConfig && tabsConfig.length ? tabsConfig : DEFAULT_TABS),
    [tabsConfig]
  );
  const activeTab = tabs.find((t) => t.key === tab) || tabs[0];

  if (!row) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Brak danych rekordu #{id}
        </Typography>
      </Box>
    );
  }

  const handleTabChange = (e, value) => {
    setTab?.(value);
  };

  const handleClose = () => {
    onChangeId?.(null);
  };

  const currentIndex = rows.findIndex((r) => +r.id === +id);
  const prevId = currentIndex > 0 ? rows[currentIndex - 1]?.id : null;
  const nextId =
    currentIndex >= 0 && currentIndex < rows.length - 1
      ? rows[currentIndex + 1]?.id
      : null;

  const goPrev = () => prevId && onChangeId?.(prevId);
  const goNext = () => nextId && onChangeId?.(nextId);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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

      {/* CONTENT – generyczny fallback */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          (Generyczna strona encji {entityName} – podmień na custom renderPage)
        </Typography>
        <pre style={{ fontSize: 11, marginTop: 8 }}>
          {JSON.stringify(row, null, 2)}
        </pre>
      </Box>
    </Box>
  );
};

export default BaseEntityPage;
