import React from "react";
import { Box } from "@mui/material";

const Row = ({
  children,
  gap = 2,
  align = "stretch",
  justify = "flex-start",
  wrap = "wrap",
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: wrap,
        alignItems: align,
        justifyContent: justify,
        gap,
        width: "100%",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default Row;