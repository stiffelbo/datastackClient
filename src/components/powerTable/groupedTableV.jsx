import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';

import {
  Table,
  Paper,
  Box,
} from '@mui/material';

import { useVirtualizer } from '@tanstack/react-virtual';

import {
  groupDataHierarchical,
  flattenGroupedData,
} from './utils';

import PowerTableHead from './powerTableHead';
import VirtualizedGroupedBody from './virtualizedGroupedBody';


/*
 * =========================================================
 * COLUMN WIDTH
 * =========================================================
 */

const getNumericWidth = (
  value,
  fallback = 120
) => {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};


/*
 * =========================================================
 * COLLAPSE HELPERS
 * =========================================================
 */

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
    if (node.type !== 'group') {
      continue;
    }

    const path = [
      ...ancestor,
      node.value,
    ].join('/');

    result[path] = false;

    result = {
      ...result,
      ...collectGroupPaths(
        node.children,
        [
          ...ancestor,
          node.value,
        ]
      ),
    };
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
  const next = {
    ...state,
  };

  Object.keys(state).forEach((path) => {
    if (
      path === basePath ||
      path.startsWith(
        `${basePath}/`
      )
    ) {
      next[path] = value;
    }
  });

  return next;
};


const GroupedTableV = ({
  initialData,
  data = [],
  columnsSchema,
  height = 600,
  actionsApi,
  settings = {},
  rowRules,
  editing,
}) => {
  /*
   * =====================================================
   * DATA / GROUPING
   * =====================================================
   */

  const groupedTree = useMemo(
    () =>
      groupDataHierarchical(
        data,
        columnsSchema.columns
      ),
    [
      data,
      columnsSchema.columns,
    ]
  );


  const groupPaths = useMemo(
    () =>
      collectGroupPaths(
        groupedTree
      ),
    [groupedTree]
  );


  const [
    groupCollapseState,
    setGroupCollapseState,
  ] = useState(groupPaths);


  /*
   * =====================================================
   * HEIGHTS
   * =====================================================
   */

  const [
    heightMap,
    setHeightMap,
  ] = useState({
    header: 42.5,
  });


  const rowHeight =
    Number(settings?.rowHeight) || 45;


  /*
   * =====================================================
   * SCROLL REFS
   * =====================================================
   *
   * Dokładnie jak w FlatTable:
   *
   * outer Box:
   *   scroll X
   *
   * verticalScrollRef:
   *   scroll Y
   *   obserwowany przez TanStack Virtual
   */

  const verticalScrollRef =
    useRef(null);


  /*
   * =====================================================
   * COLUMN GEOMETRY
   * =====================================================
   *
   * Jedno źródło prawdy dla:
   *
   * - header
   * - body
   * - virtual rows
   *
   * Tabela NIE rozciąga się do szerokości viewportu.
   */

  const visibleColumns = useMemo(
    () =>
      columnsSchema
        .getVisibleColumns?.() || [],
    [columnsSchema]
  );


  const tableWidth = useMemo(
    () => {
      return visibleColumns.reduce(
        (sum, col) => {
          const width =
            getNumericWidth(
              col.width ??
                col.minWidth,
              col.type === 'action'
                ? 40
                : 120
            );

          return sum + width;
        },
        0
      );
    },
    [visibleColumns]
  );


  /*
   * =====================================================
   * COLLAPSE HELPERS
   * =====================================================
   */

  const getParentPath =
    useCallback((key) => {
      const index =
        key.lastIndexOf('/');

      return index === -1
        ? null
        : key.slice(
            0,
            index
          );
    }, []);


  const inheritsCollapsedFromAncestor =
    useCallback(
      (
        key,
        prev
      ) => {
        let parent =
          getParentPath(key);

        while (parent) {
          if (
            prev[parent] === true
          ) {
            return true;
          }

          parent =
            getParentPath(
              parent
            );
        }

        return false;
      },
      [getParentPath]
    );


  /*
   * =====================================================
   * SYNCHRONIZACJA COLLAPSE STATE
   * =====================================================
   */

  useEffect(() => {
    const freshMap =
      collectGroupPaths(
        groupedTree
      );

    setGroupCollapseState(
      (prev) => {
        const next = {};

        for (
          const key of
          Object.keys(freshMap)
        ) {
          if (
            Object.prototype
              .hasOwnProperty.call(
                prev,
                key
              )
          ) {
            next[key] =
              prev[key];
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
      }
    );
  }, [
    groupedTree,
    inheritsCollapsedFromAncestor,
  ]);


  /*
   * =====================================================
   * FLAT DATA
   * =====================================================
   *
   * To jest źródło danych dla virtualizera.
   */

  const flatData = useMemo(
    () =>
      flattenGroupedData(
        groupedTree,
        groupCollapseState
      ),
    [
      groupedTree,
      groupCollapseState,
    ]
  );


  /*
   * =====================================================
   * TANSTACK VIRTUAL
   * =====================================================
   *
   * Virtualizer obserwuje WYŁĄCZNIE pionowy scroll.
   *
   * Horizontal scroll znajduje się poziom wyżej
   * i nie wymaga żadnej synchronizacji przez React.
   */

  const rowVirtualizer =
    useVirtualizer({
      count: flatData.length,

      getScrollElement: () =>
        verticalScrollRef.current,

      estimateSize: () =>
        rowHeight,

      overscan: 0,

      useFlushSync: false,

      getItemKey: (index) => {
        const item =
          flatData[index];

        /*
         * W przypadku zwykłego data row
         * preferujemy id rekordu.
         *
         * Dla group row dobrze mieć stabilny path.
         */
        return (
          item?.id ??
          item?.path ??
          item?.key ??
          index
        );
      },
    });


  /*
   * =====================================================
   * COLLAPSE
   * =====================================================
   */

  const toggleCollapse =
    useCallback(
      (path) => {
        setGroupCollapseState(
          (prev) =>
            updateCollapseState(
              prev,
              path,
              !(
                prev?.[
                  path
                ] === true
              )
            )
        );
      },
      []
    );


  const toggleCollapseLevel =
    useCallback(
      (level) => {
        setGroupCollapseState(
          (prev) => {
            const entries =
              Object.entries(
                prev
              );

            const levelEntries =
              entries.filter(
                ([path]) =>
                  path
                    .split('/')
                    .length ===
                  level + 1
              );

            if (
              levelEntries.length ===
              0
            ) {
              return prev;
            }

            const anyExpanded =
              levelEntries.some(
                ([, value]) =>
                  value !== true
              );

            const shouldCollapse =
              anyExpanded;

            let updated = {
              ...prev,
            };

            for (
              const [path] of
              levelEntries
            ) {
              updated =
                setBranchState(
                  updated,
                  path,
                  shouldCollapse
                );
            }

            return updated;
          }
        );
      },
      []
    );


  /*
   * =====================================================
   * HEIGHT CHANGE
   * =====================================================
   */

  const handleHeightChange =
    useCallback(
      (
        section,
        value
      ) => {
        setHeightMap(
          (prev) => {
            if (
              prev[section] ===
              value
            ) {
              return prev;
            }

            return {
              ...prev,
              [section]: value,
            };
          }
        );
      },
      []
    );


  /*
   * =====================================================
   * SETTINGS
   * =====================================================
   *
   * Tak samo jak FlatTable.
   *
   * GroupedTableV jest tutaj zawsze virtualized,
   * więc komponenty potomne powinny dostać
   * tę samą informację.
   */

  const settingsWithVirtual =
    useMemo(
      () => ({
        ...settings,

        isVirtualized: true,
        virtualFlex: true,

        rowHeight,
        height,
      }),
      [
        settings,
        rowHeight,
        height,
      ]
    );


  /*
   * =====================================================
   * TABLE GEOMETRY
   * =====================================================
   *
   * Najważniejsza część.
   *
   * NIE:
   *
   * width: 100%
   *
   * tylko dokładnie suma szerokości kolumn.
   *
   * Dzięki temu:
   *
   * ekran 800px + tabela 1200px
   * -> horizontal scroll
   *
   * ekran 2500px + tabela 500px
   * -> tabela nadal ma 500px
   *
   * Header NIE rozciąga kolumn do 2500px.
   */

  const virtualTableSx =
    useMemo(
      () => ({
        display: 'grid',

        width:
          `${tableWidth}px`,

        minWidth:
          `${tableWidth}px`,

        maxWidth:
          `${tableWidth}px`,
      }),
      [tableWidth]
    );


  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <Box
      sx={{
        height,
        width: '100%',
        minWidth: 0,

        overflow: 'hidden',
      }}
    >
      {/*
       * =================================================
       * HORIZONTAL SCROLLER
       * =================================================
       *
       * Dokładnie ta sama zasada jak FlatTable.
       *
       * TYLKO TEN element odpowiada za scroll X.
       *
       * Header i body są jego potomkami,
       * więc browser przesuwa wszystko razem.
       *
       * Nie ma:
       *
       * - scrollLeft w state
       * - synchronizacji scroll event
       * - translateX
       */}

      <Box
        component={Paper}
        sx={{
          height: '100%',
          width: '100%',

          minWidth: 0,

          overflowX: 'auto',
          overflowY: 'hidden',

          position: 'relative',
        }}
      >
        {/*
         * ===============================================
         * COMMON CONTENT WIDTH
         * ===============================================
         *
         * Fizyczna szerokość contentu =
         * suma szerokości widocznych kolumn.
         *
         * minWidth: 100% powoduje tylko, że wrapper
         * wypełnia Paper na szerokim ekranie.
         *
         * Sama Table nadal ma tableWidth.
         */}

        <Box
          sx={{
            height: '100%',

            width:
              `${tableWidth}px`,

            minWidth: '100%',

            position: 'relative',
          }}
        >
          {/*
           * =============================================
           * VERTICAL SCROLLER
           * =============================================
           *
           * TanStack obserwuje właśnie ten element.
           *
           * Nie obsługuje scroll X.
           */}

          <Box
            ref={
              verticalScrollRef
            }
            sx={{
              height: '100%',

              minHeight: 0,

              overflowY: 'auto',
              overflowX: 'hidden',

              position: 'relative',
            }}
          >
            <Table
              size="small"
              sx={
                virtualTableSx
              }
            >
              <PowerTableHead
                initialData={
                  initialData
                }
                columnsSchema={
                  columnsSchema
                }
                settings={
                  settingsWithVirtual
                }
                groupCollapseState={
                  groupCollapseState
                }
                onToggleCollapse={
                  toggleCollapseLevel
                }
                onHeightChange={(
                  value
                ) =>
                  handleHeightChange(
                    'header',
                    value
                  )
                }
                actionsApi={
                  actionsApi
                }
                height={
                  heightMap.header
                }
                data={data}
              />

              <VirtualizedGroupedBody
                flatData={
                  flatData
                }
                columnsSchema={
                  columnsSchema
                }
                rowRules={
                  rowRules
                }
                settings={
                  settingsWithVirtual
                }
                groupCollapseState={
                  groupCollapseState
                }
                toggleCollapse={
                  toggleCollapse
                }
                rowVirtualizer={
                  rowVirtualizer
                }
                actionsApi={
                  actionsApi
                }
                editing={
                  editing
                }
              />
            </Table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GroupedTableV;