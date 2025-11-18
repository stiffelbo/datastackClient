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

// helper – ustawia stan dla gałęzi: węzeł + wszyscy potomkowie (po slashu)
const setBranchState = (state, basePath, value) => {
  const next = { ...state };
  Object.keys(state).forEach((p) => {
    if (p === basePath || p.startsWith(basePath + '/')) {
      next[p] = value; // true = collapsed, false = expanded
    }
  });
  return next;
};


/**
 * Główna tabela zgrupowana z pełną wirtualizacją (GroupedTableV)
 */
const GroupedTableV = ({ initialData, data, columnsSchema, actionsApi, settings, rowRules, editing }) => {
  const groupedTree = useMemo(
    () => groupDataHierarchical(data, columnsSchema.columns),
    [data, columnsSchema.columns]
  );

  const groupPaths = useMemo(() => collectGroupPaths(groupedTree), [groupedTree]);


  const [groupCollapseState, setGroupCollapseState] = useState(groupPaths);
  const [scrollTop, setScrollTop] = useState(0);
  const [heightMap, setHeightMap] = useState({ header: 0, footer: 0 });

  // helper: rodzic ścieżki "79/12/84" -> "79/12"
  const getParentPath = (key) => {
    const i = key.lastIndexOf('/');
    return i === -1 ? null : key.slice(0, i);
  };

  // helper: czy któryś przodek jest collapsed (true) w danej mapie
  const inheritsCollapsedFromAncestor = (key, prev) => {
    let parent = getParentPath(key);
    while (parent) {
      if (prev[parent] === true) return true;
      parent = getParentPath(parent);
    }
    return false;
  };

  // UWAGA: korzysta z Twojego collectGroupPaths(nodes) z kluczami "a/b/c"
  useEffect(() => {
    // zbuduj zestaw kluczy ze świeżego drzewa
    const freshMap = collectGroupPaths(groupedTree); // { "79": false, "79/12": false, ... }
    setGroupCollapseState((prev) => {
      const next = {};

      // dodaj/aktualizuj tylko istniejące węzły
      for (const key of Object.keys(freshMap)) {
        if (Object.prototype.hasOwnProperty.call(prev, key)) {
          // zachowaj dotychczasowy stan
          next[key] = prev[key];
        } else {
          // NOWY węzeł -> odziedzicz collapse po przodku, w przeciwnym razie domyślnie rozwinięty (false)
          next[key] = inheritsCollapsedFromAncestor(key, prev) ? true : false;
        }
      }

      // (opcjonalnie) jeżeli chcesz, aby znikające węzły pozostały w stanie (np. do animacji),
      // to tu byś je dopisał; domyślnie je wyrzucamy

      return next;
    });
  }, [groupedTree]);

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

  // ZBIORCZE zwijanie/rozwijanie poziomu – kaskadowo od tego poziomu w dół
  const toggleCollapseLevel = useCallback((level) => {
    setGroupCollapseState((prev) => {
      const entries = Object.entries(prev);

      // wszystkie grupy DOKŁADNIE na tym poziomie (0-based)
      const levelEntries = entries.filter(([path]) => path.split('/').length === level + 1);

      // brak węzłów na tym poziomie -> nic nie rób
      if (levelEntries.length === 0) return prev;

      // NOWA REGUŁA:
      // - jeśli chociaż jedna jest rozwinięta (val !== true) => zwinąć wszystkie (shouldCollapse = true)
      // - jeśli wszystkie są zwinięte (val === true)       => rozwinąć wszystkie (shouldCollapse = false)
      const anyExpanded = levelEntries.some(([, val]) => val !== true);
      const shouldCollapse = anyExpanded ? true : false;

      // ustaw stan dla KAŻDEGO węzła tego poziomu + całych jego potomków
      let updated = { ...prev };
      for (const [path] of levelEntries) {
        updated = setBranchState(updated, path, shouldCollapse);
      }
      return updated;
    });
  }, []);

  // Flatten grouped tree to a flat list for virtual rendering
  const flatData = useMemo(
    () => flattenGroupedData(groupedTree, groupCollapseState),
    [groupedTree, groupCollapseState]
  );

  const handleScroll = (e) => setScrollTop(e.target.scrollTop);
  const handleHeightChange = (section, value) => {setHeightMap((prev) => ({ ...prev, [section]: value }))};

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
            height={heightMap.header}
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
            editing={editing}
          />
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GroupedTableV;
