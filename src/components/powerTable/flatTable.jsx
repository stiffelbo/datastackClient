import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TableContainer, Table, Paper, Box } from '@mui/material';
import PowerTableHead from './powerTableHead';
import PowerTableBody from './powerTableBody';
import PowerTableFooter from './powerTableFooter';

const FlatTable = ({
  initialData,
  data,
  columnsSchema,
  rowRules,
  settings,
  footerConfig,
  isVirtualized = false,
  height = 600,
  editing,
  actionsApi,
}) => {
  const [heightMap, setHeightMap] = useState({ header: 0, footer: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const containerRef = useRef(null);

  const handleHeightChange = (section, value) => {
    setHeightMap(prev => {
      if (prev[section] === value) return prev;
      return { ...prev, [section]: value };
    });
  };

  // SCROLL: tylko scrollTop, żadnego clientHeight tutaj
  const handleScroll = useCallback((e) => {
    const nextTop = e.target.scrollTop;
    setScrollTop(prev => (prev === nextTop ? prev : nextTop));
  }, []);

  // VIEWPORT: tylko przez ResizeObserver (albo raz przy mount)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const h = el.clientHeight;
      setViewportHeight(prev => (prev === h ? prev : h));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const rowHeight = settings?.rowHeight || 45;

  // ta wysokość jest dalej przydatna np. do clampowania scrollTop
  const headerFooterHeight = heightMap.header + heightMap.footer;
  const fallbackBodyHeight = Math.max(height - headerFooterHeight, 0);

  const effectiveViewport = viewportHeight || fallbackBodyHeight || height;

  const settingsWithVirtual = {
    ...settings,
    isVirtualized,
    rowHeight,
    height,             // ogólny height tabeli
  };

  return (
    <Box sx={{ height, width: '100%' }}>
      <TableContainer
        component={Paper}
        ref={containerRef}
        sx={{
          maxHeight: height,
          width: '100%',
          maxWidth: '100%',
          overflowY: 'auto',
        }}
        onScroll={handleScroll}
      >
        <Table
          stickyHeader={!isVirtualized} // ← wyłączamy sticky przy virtualized
          size="small"
          sx={{ tableLayout: 'fixed', width: '100%' }}
        >
          <PowerTableHead
            columnsSchema={columnsSchema}
            settings={settingsWithVirtual}
            initialData={initialData}
            onHeightChange={(val) => handleHeightChange('header', val)}
            height={heightMap.header}
            actionsApi={actionsApi}
            data={data}
          />

          <PowerTableBody
            data={data}
            columnsSchema={columnsSchema}
            rowRules={rowRules}
            settings={settingsWithVirtual}
            height={fallbackBodyHeight}          // layoutowo
            scrollHeight={effectiveViewport}     // viewport do virtualizacji
            scrollTop={scrollTop}
            editing={editing}
            actionsApi={actionsApi}
          />

          <PowerTableFooter
            data={data}
            columnsSchema={columnsSchema}
            settings={settingsWithVirtual}
            onHeightChange={(val) => handleHeightChange('footer', val)}
            height={heightMap.footer}            // UPEWNIJ SIĘ, ŻE TU JEST footer
            actionsApi={actionsApi}
          />
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FlatTable;
