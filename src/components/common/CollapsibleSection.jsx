// src/components/common/CollapsibleSection.jsx
import React, { useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const CollapsibleSectionHeader = ({
  open,
  title,
  subtitle = null,
  action = null,
  onToggle,
}) => {
  const Icon = open ? KeyboardArrowDownIcon : KeyboardArrowRightIcon;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "32px minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 1,
        minHeight: 36,
      }}
    >
      <IconButton size="small" onClick={onToggle}>
        <Icon fontSize="small" />
      </IconButton>

      <Box
        onClick={onToggle}
        sx={{
          minWidth: 0,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {title}
        </Typography>

        {subtitle ? (
          <Typography variant="caption" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      {action ? (
        <Box onClick={(e) => e.stopPropagation()}>
          {action}
        </Box>
      ) : null}
    </Box>
  );
};

const CollapsibleSectionBody = ({ children }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "32px minmax(0, 1fr)",
        gap: 1,
      }}
    >
      <Box />

      <Box sx={{ minWidth: 0, pb: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

const CollapsibleSection = ({
  title,
  subtitle = null,
  action = null,
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange = null,
  sx = {},
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = typeof controlledOpen === "boolean";
  const open = isControlled ? controlledOpen : internalOpen;

  const handleToggle = () => {
    const next = !open;

    if (!isControlled) {
      setInternalOpen(next);
    }

    if (typeof onOpenChange === "function") {
      onOpenChange(next);
    }
  };

  return (
    <Box
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        py: 0.5,
        ...sx,
      }}
    >
      <CollapsibleSectionHeader
        open={open}
        title={title}
        subtitle={subtitle}
        action={action}
        onToggle={handleToggle}
      />

      <Collapse in={open} timeout="auto" unmountOnExit={false}>
        <CollapsibleSectionBody>
          {children}
        </CollapsibleSectionBody>
      </Collapse>
    </Box>
  );
};

export default CollapsibleSection;