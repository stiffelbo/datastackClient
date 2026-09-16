// treeTableV.jsx

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  Table,
  Paper,
  Box,
} from '@mui/material';

import { useVirtualizer } from '@tanstack/react-virtual';

import PowerTableHead from './powerTableHead';
import PowerTableFooter from './powerTableFooter';
import VirtualizedTreeBody from './virtualizedTreeBody';

import {
  buildTreeByParent,
  flattenTree,
} from './utils';


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
 * TREE TABLE
 * =========================================================
 */

const TreeTableV = ({
  initialData,
  data = [],
  columnsSchema,
  rowRules,
  settings = {},
  treeConfig = {},
  height = 600,
  editing,
  actionsApi = {},
}) => {
  const {
    idField = 'id',
    parentField = 'parent_id',
    rootValue = null,
  } = treeConfig;


  /*
   * =====================================================
   * TREE
   * =====================================================
   */

  const [roots] = useMemo(
    () =>
      buildTreeByParent(
        data,
        {
          idField,
          parentField,
          rootValue,
        }
      ),
    [
      data,
      idField,
      parentField,
      rootValue,
    ]
  );


  /*
   * =====================================================
   * COLLAPSE STATE
   * =====================================================
   */

  const [
    collapseState,
    setCollapseState,
  ] = useState({});


  useEffect(() => {
    setCollapseState({});
  }, [
    data,
    idField,
    parentField,
    rootValue,
  ]);


  const toggleTreeNode =
    useCallback((path) => {
      setCollapseState((prev) => ({
        ...prev,
        [path]: !prev[path],
      }));
    }, []);


  /*
   * =====================================================
   * FLAT DATA
   * =====================================================
   *
   * Tylko widoczne elementy drzewa.
   *
   * Jeżeli node jest collapsed,
   * jego dzieci NIE trafiają do flatData.
   *
   * To jest jedyne źródło danych dla virtualizera.
   */

  const flatData = useMemo(
    () =>
      flattenTree(
        roots,
        collapseState,
        { idField }
      ),
    [
      roots,
      collapseState,
      idField,
    ]
  );


  /*
   * =====================================================
   * HEIGHT
   * =====================================================
   */

  const [
    heightMap,
    setHeightMap,
  ] = useState({
    header: 42.5,
    footer: 36,
  });


  const rowHeight =
    Number(settings?.rowHeight) || 45;


  const handleHeightChange =
    useCallback(
      (section, value) => {
        setHeightMap((prev) => {
          if (
            prev[section] === value
          ) {
            return prev;
          }

          return {
            ...prev,
            [section]: value,
          };
        });
      },
      []
    );


  /*
   * =====================================================
   * SCROLL REF
   * =====================================================
   *
   * Ten element obsługuje WYŁĄCZNIE scroll Y.
   *
   * TanStack Virtual obserwuje właśnie jego.
   */

  const verticalScrollRef =
    useRef(null);


  /*
   * =====================================================
   * COLUMN GEOMETRY
   * =====================================================
   */

  const visibleColumns = useMemo(
    () =>
      columnsSchema
        .getVisibleColumns?.() || [],
    [columnsSchema]
  );


  const tableWidth = useMemo(
    () =>
      visibleColumns.reduce(
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
      ),
    [visibleColumns]
  );


  /*
   * =====================================================
   * TANSTACK VIRTUAL
   * =====================================================
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

      /*
       * Bardzo ważne przy collapse/expand.
       *
       * Nie używamy samego indexu jeśli mamy
       * stabilne ID/path.
       */
      getItemKey: (index) => {
        const item = flatData[index];

        return (
          item?.[idField] ??
          item?.id ??
          item?.path ??
          item?.key ??
          index
        );
      },
    });


  /*
   * =====================================================
   * SETTINGS
   * =====================================================
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
   * ACTIONS API
   * =====================================================
   */

  const treeActionsApi =
    useMemo(
      () => ({
        ...actionsApi,
        toggleTreeNode,
      }),
      [
        actionsApi,
        toggleTreeNode,
      ]
    );


  /*
   * =====================================================
   * TABLE GEOMETRY
   * =====================================================
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
       * ===============================================
       * HORIZONTAL SCROLLER
       * ===============================================
       *
       * Jedyny scroll X.
       *
       * Header, body i footer przesuwają się razem
       * przez natywny browser scroll.
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
         * =============================================
         * COMMON CONTENT WIDTH
         * =============================================
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
           * ===========================================
           * VERTICAL SCROLLER
           * ===========================================
           *
           * TanStack Virtual obserwuje ten element.
           */}

          <Box
            ref={verticalScrollRef}
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
              sx={virtualTableSx}
            >
              <PowerTableHead
                columnsSchema={
                  columnsSchema
                }
                settings={
                  settingsWithVirtual
                }
                initialData={
                  initialData
                }
                onHeightChange={(
                  value
                ) =>
                  handleHeightChange(
                    'header',
                    value
                  )
                }
                height={
                  heightMap.header
                }
                actionsApi={
                  treeActionsApi
                }
                data={data}
                isTree={true}
              />

              <VirtualizedTreeBody
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
                editing={
                  editing
                }
                actionsApi={
                  treeActionsApi
                }
                rowVirtualizer={
                  rowVirtualizer
                }
              />

              <PowerTableFooter
                data={data}
                columnsSchema={
                  columnsSchema
                }
                settings={
                  settingsWithVirtual
                }
                onHeightChange={(
                  value
                ) =>
                  handleHeightChange(
                    'footer',
                    value
                  )
                }
                height={
                  heightMap.footer
                }
                actionsApi={
                  treeActionsApi
                }
                isTree={true}
              />
            </Table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TreeTableV;