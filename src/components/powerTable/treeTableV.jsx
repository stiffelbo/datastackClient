// treeTableV.jsx (fragment)

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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

  // 🔹 stan zwinięcia: { [path]: true }
  const [collapseState, setCollapseState] = useState({});

  useEffect(() => {
    setCollapseState({});
  }, [data, idField, parentField, rootValue]);

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

  // wysokości header/footer jak miałeś
  const [heightMap, setHeightMap] = useState({ header: 0, footer: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  const handleHeightChange = useCallback((section, value) => {
    setHeightMap((prev) => ({ ...prev, [section]: value }));
  }, []);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const bodyHeight = height - (heightMap.header + heightMap.footer);

  // 🔹 rozszerzamy actionsApi o toggleTreeNode
  const treeActionsApi = {
    ...actionsApi,
    toggleTreeNode,
  };

  return (
    <Box sx={{ height: '100%' }}>
      <TableContainer
        component={Paper}
        sx={{ maxHeight: '100%', width: '100%', maxWidth: '100%', overflowY: 'auto' }}
        onScroll={handleScroll}
      >
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <PowerTableHead
            columnsSchema={columnsSchema}
            settings={settings}
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
            settings={settings}
            height={bodyHeight}
            scrollTop={scrollTop}
            editing={editing}
            actionsApi={treeActionsApi}
          />

          <PowerTableFooter
            data={data}
            columnsSchema={columnsSchema}
            settings={settings}
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
