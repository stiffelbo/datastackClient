import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from 'react';

import {
  Table,
  TableContainer,
  Paper
} from '@mui/material';

import { useVirtualizer } from '@tanstack/react-virtual';

import {
  groupDataHierarchical,
  flattenGroupedData
} from './utils';

import PowerTableHead from './powerTableHead';
import VirtualizedGroupedBody from './virtualizedGroupedBody';


/**
 * Aktualizuje stan collapseState dla konkretnego path
 * lub całego poziomu.
 */
const updateCollapseState = (
  prev,
  path,
  expanded,
  level = null
) => {
  const newState = { ...prev };

  if (path && level === null) {
    newState[path] = expanded;
    return newState;
  }

  Object.keys(prev).forEach((p) => {
    const segments = p.split('/');

    if (
      level !== null &&
      segments.length >= level + 1
    ) {
      newState[p] = expanded;
    }
  });

  return newState;
};


/**
 * Zbiera wszystkie możliwe ścieżki grup.
 */
const collectGroupPaths = (
  nodes,
  ancestor = []
) => {
  let result = {};

  for (const node of nodes) {
    if (node.type === 'group') {
      const path = [
        ...ancestor,
        node.value
      ].join('/');

      result[path] = false;

      result = {
        ...result,
        ...collectGroupPaths(
          node.children,
          [...ancestor, node.value]
        )
      };
    }
  }

  return result;
};


/**
 * Ustawia collapse dla całej gałęzi.
 */
const setBranchState = (
  state,
  basePath,
  value
) => {
  const next = { ...state };

  Object.keys(state).forEach((p) => {
    if (
      p === basePath ||
      p.startsWith(basePath + '/')
    ) {
      next[p] = value;
    }
  });

  return next;
};


const GroupedTableV = ({
  initialData,
  data,
  columnsSchema,
  height,
  actionsApi,
  settings,
  rowRules,
  editing
}) => {

  /*
   * -----------------------------------------------------
   * DATA / GROUPING
   * -----------------------------------------------------
   */

  const groupedTree = useMemo(
    () =>
      groupDataHierarchical(
        data,
        columnsSchema.columns
      ),
    [data, columnsSchema.columns]
  );


  const groupPaths = useMemo(
    () => collectGroupPaths(groupedTree),
    [groupedTree]
  );


  const [
    groupCollapseState,
    setGroupCollapseState
  ] = useState(groupPaths);


  /*
   * -----------------------------------------------------
   * HEIGHTS
   * -----------------------------------------------------
   */

  const [heightMap, setHeightMap] = useState({
    header: 0,
    footer: 0
  });

  const rowHeight =
    Number(settings?.rowHeight) || 45;


  /*
   * -----------------------------------------------------
   * SCROLL CONTAINER
   * -----------------------------------------------------
   */

  const containerRef = useRef(null);


  /*
   * -----------------------------------------------------
   * COLLAPSE HELPERS
   * -----------------------------------------------------
   */

  const getParentPath = (key) => {
    const i = key.lastIndexOf('/');

    return i === -1
      ? null
      : key.slice(0, i);
  };


  const inheritsCollapsedFromAncestor = (
    key,
    prev
  ) => {
    let parent = getParentPath(key);

    while (parent) {
      if (prev[parent] === true) {
        return true;
      }

      parent = getParentPath(parent);
    }

    return false;
  };


  /*
   * -----------------------------------------------------
   * SYNCHRONIZACJA COLLAPSE STATE
   * -----------------------------------------------------
   */

  useEffect(() => {
    const freshMap =
      collectGroupPaths(groupedTree);

    setGroupCollapseState((prev) => {
      const next = {};

      for (
        const key of Object.keys(freshMap)
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            prev,
            key
          )
        ) {
          next[key] = prev[key];
        } else {
          next[key] =
            inheritsCollapsedFromAncestor(
              key,
              prev
            )
              ? true
              : false;
        }
      }

      return next;
    });
  }, [groupedTree]);


  useEffect(() => {
    if (
      Object.keys(groupCollapseState)
        .length === 0 &&
      groupedTree.length > 0
    ) {
      setGroupCollapseState(
        collectGroupPaths(groupedTree)
      );
    }
  }, [groupedTree, groupCollapseState]);


  /*
   * -----------------------------------------------------
   * FLAT DATA
   *
   * TO JEST ŹRÓDŁO DLA VIRTUALIZERA.
   * -----------------------------------------------------
   */

  const flatData = useMemo(
    () =>
      flattenGroupedData(
        groupedTree,
        groupCollapseState
      ),
    [
      groupedTree,
      groupCollapseState
    ]
  );


  /*
   * -----------------------------------------------------
   * TANSTACK VIRTUAL
   * -----------------------------------------------------
   */

  const rowVirtualizer = useVirtualizer({
    count: flatData.length,

    getScrollElement: () =>
      containerRef.current,

    /*
     * Fixed row height.
     *
     * Celowo NIE używamy measureElement,
     * ponieważ ustabilizowaliśmy wysokość
     * PowerTableRow / DisplayCell / EditCell /
     * ActionCell.
     */
    estimateSize: () => rowHeight,

    /*
     * U Ciebie overscan dawał problemy,
     * więc zaczynamy od 0.
     */
    overscan: 0,

    /*
     * Opcjonalne.
     *
     * W aktualnym TanStack Virtual można
     * wyłączyć flushSync przy scrollu.
     * Na początek zostawiłbym false.
     */
    useFlushSync: false,
  });


  /*
   * -----------------------------------------------------
   * COLLAPSE
   * -----------------------------------------------------
   */

  const toggleCollapse = useCallback(
    (path) => {
      setGroupCollapseState(
        (prev) =>
          updateCollapseState(
            prev,
            path,
            !(prev?.[path] === true)
          )
      );
    },
    []
  );


  const toggleCollapseLevel =
    useCallback((level) => {
      setGroupCollapseState(
        (prev) => {
          const entries =
            Object.entries(prev);

          const levelEntries =
            entries.filter(
              ([path]) =>
                path.split('/').length ===
                level + 1
            );

          if (
            levelEntries.length === 0
          ) {
            return prev;
          }

          const anyExpanded =
            levelEntries.some(
              ([, val]) => val !== true
            );

          const shouldCollapse =
            anyExpanded;

          let updated = { ...prev };

          for (
            const [path] of levelEntries
          ) {
            updated = setBranchState(
              updated,
              path,
              shouldCollapse
            );
          }

          return updated;
        }
      );
    }, []);


  /*
   * -----------------------------------------------------
   * HEADER HEIGHT
   * -----------------------------------------------------
   */

  const handleHeightChange = useCallback(
    (section, value) => {
      setHeightMap((prev) => {
        if (prev[section] === value) {
          return prev;
        }

        return {
          ...prev,
          [section]: value
        };
      });
    },
    []
  );


  /*
   * -----------------------------------------------------
   * RENDER
   * -----------------------------------------------------
   */

  return (
    <TableContainer
      component={Paper}
      ref={containerRef}
      sx={{
        height: height || settings?.height || 600,

        width: '100%',
        maxWidth: '100%',

        overflowY: 'auto',
        overflowX: 'auto',

        /*
         * Ważne dla sticky elementów
         * i virtual positioning.
         */
        position: 'relative',
      }}
    >
      <Table
        size="small"
        sx={{
          width: '100%',

          /*
           * Na razie zostawiamy native table.
           *
           * Po przeróbce VirtualizedGroupedBody
           * zdecydujemy, czy tbody/tr przechodzą
           * na grid/flex.
           */
          tableLayout: 'fixed',
        }}
      >
        <PowerTableHead
          initialData={initialData}
          columnsSchema={columnsSchema}
          settings={settings}
          groupCollapseState={
            groupCollapseState
          }
          onToggleCollapse={
            toggleCollapseLevel
          }
          onHeightChange={(h) =>
            handleHeightChange(
              'header',
              h
            )
          }
          actionsApi={actionsApi}
          height={heightMap.header}
        />

        <VirtualizedGroupedBody
          flatData={flatData}
          columnsSchema={columnsSchema}
          rowRules={rowRules}
          settings={settings}
          groupCollapseState={
            groupCollapseState
          }
          toggleCollapse={
            toggleCollapse
          }

          /*
           * NOWE:
           */
          rowVirtualizer={
            rowVirtualizer
          }

          actionsApi={actionsApi}
          editing={editing}
        />
      </Table>
    </TableContainer>
  );
};

export default GroupedTableV;