import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const PresetGroups = ({ columns }) => {
  if (!columns) return null;

  const allGroups = columns.getAllGroups();
  const allCols = columns.columns;

  // 🔹 wykryj kolumny bez przypisanej grupy
  const ungroupedCols = allCols.filter((c) => !c.fieldGroup || c.fieldGroup.trim() === "");
  if (ungroupedCols.length > 0 && !allGroups.includes("")) {
    allGroups.push(""); // dodaj pustą grupę
  }

  if (allGroups.length === 0) {
    return (
      <Typography variant="body2" sx={{ opacity: 0.6, px: 2, py: 1 }}>
        Brak zdefiniowanych grup pól.
      </Typography>
    );
  }

  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
        Grupy pól
      </Typography>

      <List dense>
        {allGroups.map((groupName) => {
          const groupCols = groupName
            ? allCols.filter((c) => c.fieldGroup === groupName)
            : allCols.filter((c) => !c.fieldGroup || c.fieldGroup.trim() === "");

          const visibleCount = groupCols.filter((c) => !c.hidden).length;
          const totalCount = groupCols.length;

          const allVisible = visibleCount === totalCount;
          const allHidden = visibleCount === 0;
          const partiallyHidden = !allVisible && !allHidden;

          const label = groupName?.trim() ? groupName : "Bez grupy";

          return (
            <React.Fragment key={groupName || "_no_group"}>
              <ListItem
                button
                onClick={() => columns.toggleGroupVisibility(groupName)}
                sx={{
                  borderRadius: 1,
                  "&:hover": { bgcolor: "action.hover" },
                }}
                secondaryAction={
                  <Tooltip
                    title={
                      allVisible
                        ? "Ukryj wszystkie pola grupy"
                        : "Pokaż wszystkie pola grupy"
                    }
                  >
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        columns.toggleGroupVisibility(groupName);
                      }}
                    >
                      {allVisible ? (
                        <Visibility fontSize="small" color="action" />
                      ) : (
                        <VisibilityOff
                          fontSize="small"
                          color={partiallyHidden ? "warning" : "disabled"}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {label}
                      {partiallyHidden && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "0.75em",
                            color: "text.secondary",
                          }}
                        >
                          (częściowo)
                        </Typography>
                      )}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {`${totalCount} pól / ${visibleCount} widocznych`}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default PresetGroups;
