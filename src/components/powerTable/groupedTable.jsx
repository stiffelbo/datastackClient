import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableRow, TableCell, IconButton, Box
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { groupDataHierarchical } from './utils';

import PowerTableHead from './powerTableHead';
import PowerTableRow from './powerTableRow';
import PowerTableCell from './powerTableCell';


/**
 * Aktualizuje stan collapseState dla konkretnego path lub całego poziomu.
 * 
 * @param {object} prev - poprzedni collapseState
 * @param {string} path - np. 'HR/Administrator'
 * @param {boolean} expanded - true/false
 * @param {number} [level] - opcjonalny poziom, jeśli chcemy masowo zamknąć/otworzyć
 * @returns {object} - nowy obiekt collapseState
 */
const updateCollapseState = (prev, path, expanded, level = null) => {
  const newState = { ...prev };

  if (path && level === null) {
    newState[path] = expanded;
    return newState;
  }

  Object.keys(prev).forEach(p => {
    const segments = p.split('/');
    if (level !== null && segments.length >= level + 1) {
      newState[p] = expanded;
    }
  });

  return newState;
};


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

const GroupedTable = ({ initialData, data, columnsSchema, settings, rowRules, isVirtualized = false }) => {

  const groupedTree = groupDataHierarchical(data, columnsSchema.columns);
  const groupPaths = collectGroupPaths(groupedTree);

  const [groupCollapseState, setGroupCollapseState] = useState(groupPaths);

  useEffect(() => {
    if (Object.keys(groupCollapseState).length === 0 && groupedTree.length > 0) {
      const initialState = collectGroupPaths(groupedTree);
      setGroupCollapseState(initialState);
    }
  }, [data]);

  const toggleCollapseLevel = (level) => {

    setGroupCollapseState(prev => {
      const entries = Object.entries(prev);
      const levelEntries = entries.filter(([path]) => path.split('/').length === level + 1);

      const collapsedCount = levelEntries.reduce((acc, [, val]) => acc + (val === true ? 1 : 0), 0);
      const total = levelEntries.length;
      const shouldCollapse = collapsedCount < total / 2; // większość rozwinięta → zwinąć
      const updated = { ...prev };
      levelEntries.forEach(([path]) => {
        updated[path] = shouldCollapse;
      });
      return updated;
    });
  };

  const toggleCollapse = (path) => {
    setGroupCollapseState(prev =>
      updateCollapseState(prev, path, !(prev?.[path] === true))
    );
  };

  const visibleColumns = columnsSchema.getVisibleColumns();

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
        <PowerTableHead
          initialData={initialData}
          columnsSchema={columnsSchema}
          settings={settings}
          groupCollapseState={groupCollapseState}
          onToggleCollapse={(level) => toggleCollapseLevel(level)} // ← dla headera: poziom
        />
        <TableBody>
          {groupedTree.map((node, i) => (
            <GroupedNode
              key={i}
              node={node}
              level={0}
              groupModel={columnsSchema.groupModel}
              visibleColumns={visibleColumns}
              columnsSchema={columnsSchema}
              groupCollapseState={groupCollapseState}
              toggleCollapse={toggleCollapse}
              ancestorValues={[]}
              settings={settings}
            />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const GroupedNode = ({
  node, level, groupModel, visibleColumns,
  columnsSchema, groupCollapseState, toggleCollapse,
  ancestorValues = [], settings
}) => {
  const path = [...ancestorValues, node.value].join('/');
  const isCollapsed = groupCollapseState?.[path] === true;
  const open = !isCollapsed;
  const isLeaf = node.type === 'row';

  const key = node.row ? path + "_" + node.row.id : 'no_id';
  const structurePadding = {
    structurePadding: {
      pl: `${level * 2}rem`, // padding-left zależny od poziomu zagnieżdżenia
    }
  };

  const settingsWithIndent = { ...settings, ...structurePadding };

  if (isLeaf) {
    return [
      <PowerTableRow
        key={key}
        row={node.row}
        columnsSchema={columnsSchema}
        settings={settingsWithIndent}
        level={level}
      />
    ];
  }

  const groupField = node.field;
  const groupLabel = `${node.value} (${node.rows?.length ?? 0})`;

  const groupRow = (
    <TableRow key={path} sx={{ backgroundColor: '#f3f3f3' }}>
      {visibleColumns.map((col) => {
        if (groupModel.includes(col.field)) {
          if (col.field === groupField) {
            return (
              <TableCell key={col.field}>
                <Box sx={{ pl: level * 2, display: 'flex', alignItems: 'center' }}>
                  {node.children?.length > 0 && (
                    <IconButton size="small" onClick={() => toggleCollapse(path)}>
                      {open ? <ExpandMore /> : <ExpandLess />}
                    </IconButton>
                  )}
                  {groupLabel}
                </Box>
              </TableCell>
            );
          }
          return <TableCell key={col.field} />;
        };
        const agg = node.aggregates?.[col.field];
        return <PowerTableCell key={col.field} value={agg} column={col}/>;
      })}
    </TableRow>
  );

  const children = open
    ? node.children.flatMap((child, i) =>
      GroupedNode({
        node: child,
        level: level + 1,
        groupModel,
        visibleColumns,
        columnsSchema,
        groupCollapseState,
        toggleCollapse,
        ancestorValues: [...ancestorValues, node.value],
        settings,
      })
    )
    : [];

  return [groupRow, ...children];
};


export default GroupedTable;
