import React, { useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import ReorderIcon from "@mui/icons-material/Reorder";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

/**
 * ColumnList – zarządzanie widocznością i kolejnością kolumn
 */
const ColumnList = ({ columnsSchema, onClose }) => {
  const cols = columnsSchema.columns || [];

  const [dragIndex, setDragIndex] = useState(null);

  const handleDragStart = (i) => setDragIndex(i);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (dropIndex) => {
    if (dragIndex !== null && dragIndex !== dropIndex) {
      columnsSchema.reorderColumn(dragIndex, dropIndex);
    }
    setDragIndex(null);
  };

  return (
    <Box sx={{ width: 300, p: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, opacity: 0.7, textAlign: "center" }}
      >
        Widoczność kolumn
      </Typography>

      {cols.map((c, i) => (
        <MenuItem
          key={c.field}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(i)}
          sx={{
            cursor: "grab",
            userSelect: "none",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Checkbox
            checked={!c.hidden}
            onClick={(e) => {
              e.stopPropagation();
              columnsSchema.toggleColumnHidden(c.field);
            }}
          />

          <ListItemText
            primary={
              <Typography variant="body2" fontWeight={500}>
                {c.headerName || c.field}
              </Typography>
            }
            secondary={
              c.fieldGroup && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  {c.fieldGroup}
                </Typography>
              )
            }
          />

          <Tooltip title="Przeciągnij, by zmienić kolejność">
            <IconButton size="small" edge="end" sx={{ cursor: "grab" }}>
              <ReorderIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MenuItem>
      ))}

      <Divider sx={{ my: 1 }} />

      <Box sx={{ textAlign: "center", py: 0.5 }}>
        <Tooltip title="Pokaż wszystkie kolumny">
          <IconButton
            size="small"
            color="primary"
            onClick={() => columnsSchema.setAllVisible(true)}
          >
            <ViewColumnIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Ukryj wszystkie kolumny">
          <IconButton
            size="small"
            color="warning"
            onClick={() => columnsSchema.setAllVisible(false)}
          >
            <ViewColumnIcon fontSize="small" sx={{ opacity: 0.4 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ColumnList;
