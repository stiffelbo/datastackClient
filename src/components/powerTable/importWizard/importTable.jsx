// ImportTable.jsx
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  TableContainer,
  TablePagination,
  Paper,
} from "@mui/material";

import { useTheme, alpha } from "@mui/material/styles";
import MappingSelect from "./mappingSelect";

const ImportTable = ({
  importSchema = [],
  rows = [],
  headers = [],
  mapping = {},
  onMappingChange = () => {},
  pageSize: defaultPageSize = 100,
  pageSizeOptions = [25, 50, 100, 200],
  showMappingControls = true,
  height = 450,
}) => {
  const theme = useTheme();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // helper: case-insensitive cell fetch
  const getCellValue = (row, header) => {
    if (!header || header === "__none__") return null;
    if (Object.prototype.hasOwnProperty.call(row, header)) return row[header];
    const key = Object.keys(row).find((k) => k.toLowerCase() === String(header).toLowerCase());
    return key ? row[key] : null;
  };

  // calculate visible columns from importSchema (preserve order)
  const columns = useMemo(
    () => importSchema.map((f) => ({ field: f.field, computed: !!f.computed })),
    [importSchema]
  );

  // subtle theme-aware backgrounds
  const warningBg = alpha(theme.palette.warning?.main ?? "#ff9800", 0.10); // subtle orange
  const noneBg =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.grey?.[800] ?? "#111", 0.08)
      : alpha(theme.palette.grey?.[200] ?? "#eee", 0.6); // very light grey in light mode

  // paginated rows
  const pageRows = useMemo(() => {
    const from = page * pageSize;
    return rows.slice(from, from + pageSize);
  }, [rows, page, pageSize]);

  // handlers
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    const ps = parseInt(e.target.value, 10);
    setPageSize(ps);
    setPage(0);
  };

  return (
    <Paper variant="outlined" sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: height }}>
        <Table stickyHeader size="small" sx={{ fontSize: "0.85rem" }}>
          <TableHead>
            {/* TOP header: db fields + optional select control */}
            <TableRow>
              {columns.map((col) => {
                const curMap = mapping?.[col.field] ?? "";
                let colBg = "white";
                if (!col.computed) {
                  if (curMap === "") {
                    colBg = warningBg;
                  } else if (curMap === "__none__") {
                    colBg = noneBg;
                  }
                }
                return (
                  <TableCell
                    key={`top-${col.field}`}
                    sx={{
                      py: 0.5,
                      px: 1,
                      minWidth: 120,
                      verticalAlign: "bottom",
                      backgroundColor: colBg,
                    }}
                  >
                    <Typography variant="caption" sx={{ display: "block", fontWeight: 600, fontSize: "0.72rem" }}>
                      {col.field}
                    </Typography>
                    {showMappingControls && !col.computed && (
                      <MappingSelect
                        value={mapping[col.field] ?? ""}
                        headers={headers}
                        onChange={(val) => onMappingChange(col.field, val)}
                        includeNone={true}
                        includeEmpty={true}
                        minWidth={120}
                        size="small"
                        sx={{ backgroundColor: "transparent" }}
                      />
                    )}

                    {col.computed && (
                      <Typography
                        variant="caption"
                        color="info.main"
                        sx={{ display: "block", mt: 0.5, fontSize: "0.68rem" }}
                      >
                        computed
                      </Typography>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {pageRows.length > 0 ? (
              pageRows.map((r, rowIndex) => (
                <TableRow key={`r-${page * pageSize + rowIndex}`}>
                  {columns.map((col) => {
                    const mappedHeader = mapping?.[col.field];
                    const v = col.computed ? "" : getCellValue(r, mappedHeader);

                    // same background per column as header
                    const curMap = mapping?.[col.field] ?? "";
                    let colBg = "transparent";
                    if (!col.computed) {
                      if (curMap === "") {
                        colBg = warningBg;
                      } else if (curMap === "__none__") {
                        colBg = noneBg;
                      }
                    }

                    return (
                      <TableCell key={`${col.field}-${rowIndex}`} sx={{ py: 0.5, px: 1, backgroundColor: colBg }}>
                        <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                          {v == null ? "" : String(v)}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 2, px: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Brak danych do podglądu
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={pageSizeOptions}
          labelRowsPerPage="Na stronie"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} z ${count}`}
          sx={{
            "& .MuiTablePagination-toolbar": { minHeight: 36, py: 0.5 },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.75rem" },
            "& .MuiTablePagination-select": { fontSize: "0.75rem" },
          }}
        />
      </Box>
    </Paper>
  );
};

ImportTable.propTypes = {
  importSchema: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  headers: PropTypes.array.isRequired,
  mapping: PropTypes.object.isRequired,
  onMappingChange: PropTypes.func,
  pageSize: PropTypes.number,
  pageSizeOptions: PropTypes.array,
  showMappingControls: PropTypes.bool,
  height: PropTypes.number,
};

export default ImportTable;
