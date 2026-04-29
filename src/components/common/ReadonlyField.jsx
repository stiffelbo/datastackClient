import React from "react";
import { Box, Typography, Chip } from "@mui/material";

const emptyValue = "—";

const ReadonlyField = ({
  label,
  value,
  icon = null,
  variant = "text",
  chipProps = {},
  formatter = null,
  sx = {},
}) => {
  const displayValue =
    typeof formatter === "function"
      ? formatter(value)
      : value === null || typeof value === "undefined" || value === ""
        ? emptyValue
        : String(value);

  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.25 }}
      >
        {label}
      </Typography>

      {variant === "chip" ? (
        <Chip
          size="small"
          variant="outlined"
          label={displayValue}
          icon={icon || undefined}
          {...chipProps}
        />
      ) : (
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {displayValue}
        </Typography>
      )}
    </Box>
  );
};

export default ReadonlyField;