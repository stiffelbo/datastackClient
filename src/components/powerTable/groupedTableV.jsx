import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table, Box, TableContainer, Paper
} from '@mui/material';
import { groupDataHierarchical, flattenGroupedData } from './utils';
import PowerTableHead from './powerTableHead';
import VirtualizedGroupedBody from './virtualizedGroupedBody';

/**
 * Aktualizuje stan collapseState dla konkretnego path lub całego poziomu.
 */
const updateCollapseState = (prev, path, expanded, level = null) => {
  const newState = { ...prev };

  if (path && level === null) {
    newState[path] = expanded;
    return newState;
  }

  Object.keys(prev).forEach((p) => {
    const segments = p.split('/');
    if (level !== null && segments.length >= level + 1) {
      newState[p] = expanded;
    }
  });

  return newState;
};

/**
 * Zbiera wszystkie możliwe ścieżki grupowe do inicjalizacji collapseState.
 */
const collectGroupPaths = (nodes, ancestor = []) => {
  let result = {};
  for (const node of nodes) {
    if (node.type === 'group') {
      const path = [...ancestor, node.value].join('/');
      result[path] = false; // false = rozwinięte
      result = { ...result, ...collectGroupPaths(node.children, [...ancestor, node.value]) };
    }
  }
  return result;
};

/**
 * Główna tabela zgrupowana z pełną wirtualizacją (GroupedTableV)
 */
const GroupedTableV = ({ initialData, data, columnsSchema, actionsApi, settings, rowRules }) => {
  const groupedTree = useMemo(
    () => groupDataHierarchical(data, columnsSchema.columns),
    [data, columnsSchema.columns]
  );

  const groupPaths = useMemo(() => collectGroupPaths(groupedTree), [groupedTree]);

  const [groupCollapseState, setGroupCollapseState] = useState(groupPaths);
  const [scrollTop, setScrollTop] = useState(0);
  const [heightMap, setHeightMap] = useState({ header: 0, footer: 0 });

  useEffect(() => {
    if (Object.keys(groupCollapseState).length === 0 && groupedTree.length > 0) {
      const initialState = collectGroupPaths(groupedTree);
      setGroupCollapseState(initialState);
    }
  }, [data]);

  // Toggle collapse for a specific group path
  const toggleCollapse = useCallback((path) => {
    setGroupCollapseState((prev) =>
      updateCollapseState(prev, path, !(prev?.[path] === true))
    );
  }, []);

  // Toggle collapse for an entire level
  const toggleCollapseLevel = useCallback((level) => {
    setGroupCollapseState((prev) => {
      const entries = Object.entries(prev);
      const levelEntries = entries.filter(([path]) => path.split('/').length === level + 1);
      const collapsedCount = levelEntries.reduce(
        (acc, [, val]) => acc + (val === true ? 1 : 0),
        0
      );
      const total = levelEntries.length;
      const shouldCollapse = collapsedCount < total / 2; // większość rozwinięta → zwinąć
      const updated = { ...prev };
      levelEntries.forEach(([path]) => {
        updated[path] = shouldCollapse;
      });
      return updated;
    });
  }, []);

  // Flatten grouped tree to a flat list for virtual rendering
  const flatData = useMemo(
    () => flattenGroupedData(groupedTree, groupCollapseState),
    [groupedTree, groupCollapseState]
  );

  const handleScroll = (e) => setScrollTop(e.target.scrollTop);
  const handleHeightChange = (section, value) =>
    setHeightMap((prev) => ({ ...prev, [section]: value }));

  const bodyHeight = (settings?.height || 600) - (heightMap.header + heightMap.footer);
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TableContainer
        component={Paper}
        sx={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'auto',
        }}
        onScroll={handleScroll}
      >
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <PowerTableHead
            initialData={initialData}
            columnsSchema={columnsSchema}
            settings={settings}
            groupCollapseState={groupCollapseState}
            onToggleCollapse={toggleCollapseLevel}
            onHeightChange={(h) => handleHeightChange('header', h)}
            actionsApi={actionsApi}
          />
          <VirtualizedGroupedBody
            flatData={flatData}
            columnsSchema={columnsSchema}
            rowRules={rowRules}
            settings={settings}
            groupCollapseState={groupCollapseState}
            toggleCollapse={toggleCollapse}
            height={bodyHeight}
            scrollTop={scrollTop}
            actionsApi={actionsApi}
          />
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GroupedTableV;
