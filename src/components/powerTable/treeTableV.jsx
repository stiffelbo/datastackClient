// treeTableV.jsx
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { TableContainer, Table, Paper, Box } from '@mui/material';
import PowerTableHead from './powerTableHead';
import PowerTableFooter from './powerTableFooter';
import VirtualizedTreeBody from './virtualizedTreeBody';
import { buildTreeByParent, flattenTree } from './utils';

const TreeTableV = ({
  initialData,
  data,
  columnsSchema,
  rowRules,
  settings,
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

  const [roots] = useMemo(
    () => buildTreeByParent(data, { idField, parentField, rootValue }),
    [data, idField, parentField, rootValue]
  );

  // collapse state dla węzłów drzewa
  const [collapseState, setCollapseState] = useState({});

  useEffect(() => {
    setCollapseState({});
  }, [data, idField, parentField, rootValue]);

  // flatData ma zawierać tylko WIDOCZNE węzły (dzieci pomijane, jeśli rodzic collapsed)
  const flatData = useMemo(
    () => flattenTree(roots, collapseState, { idField }),
    [roots, collapseState, idField]
  );

  const toggleTreeNode = useCallback((path) => {
    setCollapseState((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const [heightMap, setHeightMap] = useState({ header: 60, footer: 60 });
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const containerRef = useRef(null);

  const handleHeightChange = useCallback((section, value) => {
    setHeightMap((prev) => {
      if (prev[section] === value) return prev;
      return { ...prev, [section]: value };
    });
  }, []);

  // scrollTop tylko z eventu scrolla
  const handleScroll = (e) => {
    const nextTop = e.target.scrollTop;
    setScrollTop((prev) => (prev === nextTop ? prev : nextTop));
  };

  // viewport height z TableContainer przez ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const h = el.clientHeight;
      setViewportHeight((prev) => (prev === h ? prev : h));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const rowHeight = settings?.rowHeight || 45;
  const headerFooterHeight = heightMap.header + heightMap.footer;
  const fallbackBodyHeight = Math.max(height - headerFooterHeight, 0);
  const effectiveViewport = viewportHeight || fallbackBodyHeight || height;

  // clamp scrollTop po zmianie liczby widocznych wierszy (expand/collapse)
  useEffect(() => {
    const totalHeight = flatData.length * rowHeight;
    const maxScroll = Math.max(totalHeight - effectiveViewport, 0);

    setScrollTop((prev) => (prev > maxScroll ? maxScroll : prev));
  }, [flatData.length, effectiveViewport, rowHeight]);

  const settingsWithVirtual = {
    ...settings,
    rowHeight,
    isVirtualized: true,
    height,
  };

  // rozszerzamy actionsApi o toggleTreeNode
  const treeActionsApi = {
    ...actionsApi,
    toggleTreeNode,
  };

  return (
    <Box sx={{ height, width: '100%' }}>
      <TableContainer
        component={Paper}
        ref={containerRef}
        sx={{
          height,
          width: '100%',
          maxWidth: '100%',
          overflowY: 'auto',
        }}
        onScroll={handleScroll}
      >
        <Table
          stickyHeader={false} // virtualized + tree: bez sticky
          size="small"
          sx={{ tableLayout: 'fixed', width: '100%' }}
        >
          <PowerTableHead
            columnsSchema={columnsSchema}
            settings={settingsWithVirtual}
            initialData={initialData}
            onHeightChange={(val) => handleHeightChange('header', val)}
            height={heightMap.header}
            actionsApi={treeActionsApi}
            data={data}
            isTree={true}
          />

          <VirtualizedTreeBody
            flatData={flatData}
            columnsSchema={columnsSchema}
            rowRules={rowRules}
            settings={settingsWithVirtual}
            height={effectiveViewport}   // viewport, nie bodyHeight
            scrollTop={scrollTop}
            editing={editing}
            actionsApi={treeActionsApi}
          />

          <PowerTableFooter
            data={data}
            columnsSchema={columnsSchema}
            settings={settingsWithVirtual}
            onHeightChange={(val) => handleHeightChange('footer', val)}
            height={heightMap.footer}
            actionsApi={treeActionsApi}
            isTree={true}
          />
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TreeTableV;
