import React from "react";
import { Box } from "@mui/material";

/**
 * 12-col flex grid
 * xs/md/xl = liczba kolumn (1-12)
 */
const Col = ({
  children,
  xs = 12,
  md,
  xl,
  pad = false,
  sx = {},
}) => {
  const getWidth = (val) => {
    if (!val) return "100%";
    return `${(val / 12) * 100}%`;
  };

  return (
    <Box
      sx={{
        flex: `0 0 ${getWidth(xs)}`,
        maxWidth: getWidth(xs),

        "@media (min-width:900px)": md
          ? {
              flex: `0 0 ${getWidth(md)}`,
              maxWidth: getWidth(md),
            }
          : {},

        "@media (min-width:1536px)": xl
          ? {
              flex: `0 0 ${getWidth(xl)}`,
              maxWidth: getWidth(xl),
            }
          : {},

        ...(pad && { padding: "4px" }),

        minWidth: 0, // 🔴 ważne dla overflow text
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default Col;