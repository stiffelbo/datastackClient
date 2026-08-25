import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import {
  Table,
  Paper,
  Box,
} from '@mui/material';

import { useVirtualizer } from '@tanstack/react-virtual';

import PowerTableHead from './powerTableHead';
import PowerTableBody from './powerTableBody';
import PowerTableFooter from './powerTableFooter';


const getNumericWidth = (value, fallback = 120) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
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


const FlatTable = ({
  initialData,
  data = [],
  columnsSchema,
  rowRules,
  settings = {},
  footerConfig,
  isVirtualized = false,
  height = 600,
  editing,
  actionsApi,
}) => {
  const [heightMap, setHeightMap] = useState({
    header: 42.5,
    footer: 36,
  });

  /*
   * TanStack obserwuje TYLKO pionowy scroll.
   */
  const verticalScrollRef = useRef(null);

  const rowHeight =
    Number(settings?.rowHeight) || 45;


  /*
   * -----------------------------------------------------
   * COLUMN GEOMETRY
   * -----------------------------------------------------
   *
   * Header / body / footer muszą mieć identyczną
   * szerokość całego layoutu.
   */
  const visibleColumns = useMemo(
    () => columnsSchema.getVisibleColumns?.() || [],
    [columnsSchema]
  );

  const tableWidth = useMemo(() => {
    return visibleColumns.reduce((sum, col) => {
      const width =
        getNumericWidth(
          col.width ?? col.minWidth,
          col.type === 'action' ? 40 : 120
        );

      return sum + width;
    }, 0);
  }, [visibleColumns]);


  /*
   * -----------------------------------------------------
   * HEIGHTS
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
          [section]: value,
        };
      });
    },
    []
  );

  /*
   * Footer jest poza pionowym scrollem.
   */
  const verticalAreaHeight = Math.max(
    height - heightMap.footer,
    rowHeight
  );


  /*
   * -----------------------------------------------------
   * TANSTACK VIRTUAL
   * -----------------------------------------------------
   */

  const rowVirtualizer = useVirtualizer({
    count: data.length,

    getScrollElement: () =>
      verticalScrollRef.current,

    estimateSize: () =>
      rowHeight,

    overscan: 0,

    enabled: isVirtualized,

    useFlushSync: false,

    getItemKey: (index) =>
      data[index]?.id ?? index,
  });


  /*
   * -----------------------------------------------------
   * SETTINGS
   * -----------------------------------------------------
   */

  const settingsWithVirtual = {
    ...settings,

    isVirtualized,
    virtualFlex: isVirtualized,

    rowHeight,
    height,
  };


  /*
   * -----------------------------------------------------
   * COMMON TABLE WIDTH
   * -----------------------------------------------------
   *
   * Ten sam rozmiar MUSI dostać tabela header/body
   * oraz tabela footera.
   */
  const virtualTableSx = isVirtualized
    ? {
        display: 'grid',

        width: `${tableWidth}px`,
        minWidth: `${tableWidth}px`,
        maxWidth: `${tableWidth}px`,
      }
    : {
        tableLayout: 'fixed',
        width: '100%',
      };


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
       * ==================================================
       * HORIZONTAL SCROLLER
       * ==================================================
       *
       * TYLKO TEN element obsługuje scroll X.
       *
       * Header, body i footer są jego potomkami,
       * więc browser przesuwa wszystkie trzy razem.
       *
       * ZERO React state podczas scroll X.
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
         * ==================================================
         * WSPÓLNY CONTENT WIDTH
         * ==================================================
         */}
        <Box
          sx={{
            height: '100%',

            width: isVirtualized
              ? `${tableWidth}px`
              : '100%',

            minWidth: '100%',

            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/*
           * ==================================================
           * VERTICAL SCROLL
           * ==================================================
           *
           * TanStack Virtual obserwuje właśnie ten element.
           *
           * Nie ma tutaj scroll X.
           */}
          <Box
            ref={verticalScrollRef}
            sx={{
              height: verticalAreaHeight,

              flex: '1 1 auto',
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
                columnsSchema={columnsSchema}
                settings={settingsWithVirtual}
                initialData={initialData}
                onHeightChange={(value) =>
                  handleHeightChange(
                    'header',
                    value
                  )
                }
                height={heightMap.header}
                actionsApi={actionsApi}
                data={data}
              />

              <PowerTableBody
                data={data}
                columnsSchema={columnsSchema}
                rowRules={rowRules}
                settings={settingsWithVirtual}
                rowVirtualizer={
                  isVirtualized
                    ? rowVirtualizer
                    : null
                }
                editing={editing}
                actionsApi={actionsApi}
              />
            </Table>
          </Box>


          {/*
           * ==================================================
           * FOOTER
           * ==================================================
           *
           * Poza pionowym scroll-em:
           * → zawsze widoczny na dole.
           *
           * Nadal wewnątrz poziomego scrollera:
           * → scroll X przesuwa go razem z header/body.
           *
           * Nie potrzeba:
           * - scrollLeft state
           * - onScroll synchronizacji
           * - transform translateX
           */}
          <Box
            sx={{
              flex: `0 0 ${heightMap.footer}px`,

              height: heightMap.footer,
              minHeight: heightMap.footer,
              maxHeight: heightMap.footer,

              width: isVirtualized
                ? `${tableWidth}px`
                : '100%',

              overflow: 'hidden',

              boxSizing: 'border-box',

              backgroundColor: '#f9f9f9',

              borderTop: '1px solid #ddd',
            }}
          >
            <Table
              size="small"
              sx={virtualTableSx}
            >
              <PowerTableFooter
                data={data}
                columnsSchema={columnsSchema}
                settings={settingsWithVirtual}
                height={heightMap.footer}
                actionsApi={actionsApi}
              />
            </Table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FlatTable;