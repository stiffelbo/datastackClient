import React, { useMemo } from "react";
import { TableCell, Typography, Box } from "@mui/material";
import { valueFormatters } from "../valueFormatters";

const DisplayCell = ({ value, column, settings, params, onDoubleClick }) => {
    const {
        sx = {},
        densityPadding = "6px 10px",
        fontSize = "0.8rem",
        wrap = true,
        ellipsis = false,
        align = column.align || "left",
    } = settings || {};

    const formatter =
        column.formatterKey && valueFormatters[column.formatterKey]
            ? valueFormatters[column.formatterKey]
            : null;

    const conditionalSx = useMemo(() => {
        if (Array.isArray(column.displayRules)) {
            for (const rule of column.displayRules) {
                if (
                    typeof rule.condition === "function" &&
                    rule.condition(value, params.row)
                ) {
                    return rule.sx || {};
                }
            }
        }
        if (typeof column.styleFn === "function") {
            try {
                return column.styleFn(value, params) || {};
            } catch (e) {
                console.warn("styleFn error:", e);
                return {};
            }
        }
        return {};
    }, [column, value, params]);

    let displayValue = value ?? "";

    // 0️⃣ formatowanie wartości
    if (typeof formatter === "function") {
        try {
            displayValue = formatter(value, column.formatterOptions || {});
        } catch (err) {
            console.warn(`Formatter error for ${column.field}`, err);
        }
    }

    // 1️⃣ renderCell ma najwyższy priorytet
    if (typeof column.renderCell === "function") {
        displayValue = column.renderCell(params);
    } else if (typeof formatter === "function") {
        try {
            displayValue = formatter(value, column.formatterOptions || {});
        } catch (err) {
            console.warn(`Formatter error for ${column.field}`, err);
        }
    }

    if (displayValue == null) displayValue = "";

    const title =
        column.showTitle === false
            ? undefined
            : typeof displayValue === "string" && ellipsis
                ? String(displayValue)
                : undefined;

    return (
        <TableCell
            sx={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                padding: densityPadding,
                fontSize,
                lineHeight: 1.3,
                verticalAlign: "top",
                textAlign: align,
                whiteSpace: wrap ? "normal" : "nowrap",
                overflow: ellipsis ? "hidden" : "visible",
                textOverflow: ellipsis ? "ellipsis" : "clip",
                ...sx,
                ...conditionalSx,
            }}
            title={title}
            onDoubleClick={onDoubleClick}
        >

            {displayValue}

        </TableCell>
    );
};

/* -------------------------------------------------------------------------- */
/* 🔹 Registry display typów         NA razie nie używane                                         */
/* -------------------------------------------------------------------------- */
DisplayCell.displayMap = {
    text: ({ value }) => <>{value}</>,
    numeric: ({ value, column }) => (
        <Box sx={{ textAlign: column?.align || "right" }}>
            {value != null ? Number(value ?? 0).toLocaleString("pl-PL") : ""}
        </Box>
    ),
    boolean: ({ value, column }) => (
        <Box sx={{ textAlign: column?.align || "center" }}>
            {value ? "✔️" : "❌"}
        </Box>
    ),
    date: ({ value, column }) => (
        <Box sx={{ textAlign: column?.align || "left" }}>
            {value ? new Date(value).toLocaleDateString("pl-PL") : ""}
        </Box>
    ),
    chip: ({ value }) => (
        <Box
            component="span"
            sx={{
                background: "#eee",
                borderRadius: "8px",
                px: 1,
                py: "2px",
                fontSize: "0.75em",
            }}
        >
            {value}
        </Box>
    ),
    currency: ({ value, column }) => (
        <Box sx={{ textAlign: column?.align || "right" }}>
            {value != null ? `${Number(value ?? 0).toLocaleString("pl-PL")} zł` : ""}
        </Box>
    ),
};

export default DisplayCell;
