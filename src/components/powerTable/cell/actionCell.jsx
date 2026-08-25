import React from "react";
import {
  TableCell,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CircleIcon from "@mui/icons-material/Circle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ClearIcon from "@mui/icons-material/Clear";

import { computeViewSelection } from "../utils";
import {
  getCellSx,
  getCellInnerSx,
} from "./cellLayout";

/**
 * Drzewo decyzyjne przycisku akcji.
 */
const getButton = ({
  parent,
  column,
  params,
  actionsApi,
  data = [],
}) => {
  const { type } = column.meta || {};
  const { selected, selectedIds = [] } = actionsApi || {};

  const groupIds = Array.isArray(data)
    ? data.map((r) => (r.row ? r.row.id : r.id))
    : [];

  const selectedInGroup = groupIds.filter((id) =>
    selectedIds.includes?.(id)
  );

  const allSelected =
    selectedInGroup.length === groupIds.length &&
    groupIds.length > 0;

  const partiallySelected =
    selectedInGroup.length > 0 &&
    !allSelected;

  const button = {
    icon: (
      <RadioButtonUncheckedIcon fontSize="small" />
    ),
    color: "default",
    title: "",
    disabled: false,
    handler: () => { },
  };

  // SINGLE SELECT
  if (type === "select") {
    if (
      parent === "body" ||
      parent === "grouprow" ||
      parent === "tree"
    ) {
      if (selected === params.id) {
        button.icon = (
          <CircleIcon fontSize="small" />
        );

        button.color = "primary";
        button.title = "Odznacz element";

        button.handler = () =>
          actionsApi.toggleSelect?.(params.id);
      } else {
        button.icon = (
          <RadioButtonUncheckedIcon fontSize="small" />
        );

        button.color = "primary";
        button.title = "Wybierz element";

        button.handler = () =>
          actionsApi.toggleSelect?.(params.id);
      }
    } else {
      button.icon = null;
    }
  }

  // MULTI SELECT
  else if (type === "multiSelect") {
    if (parent === "header") {
      const {
        viewIds: filteredIds,
        selectedInView,
      } = computeViewSelection({
        data,
        selectedIds,
      });

      if (filteredIds.length === 0) {
        button.icon = (
          <ChecklistIcon fontSize="small" />
        );

        button.color = "default";
        button.title = "Brak wierszy do zaznaczenia";
        button.disabled = true;
      }

      else if (selectedInView.length > 0) {
        button.icon = (
          <ChecklistIcon fontSize="small" />
        );

        button.color = "secondary";

        button.title =
          `Odznacz ${selectedInView.length} wierszy (z widoku)`;

        button.handler = () =>
          actionsApi.toggleMultiSelect?.(
            selectedInView
          );
      }

      else {
        button.icon = (
          <ChecklistIcon fontSize="small" />
        );

        button.color = "default";

        button.title =
          `Zaznacz ${filteredIds.length} wierszy (z widoku)`;

        button.handler = () =>
          actionsApi.toggleMultiSelect?.(
            filteredIds
          );
      }
    }

    else if (parent === "group") {
      if (allSelected || partiallySelected) {
        button.icon = (
          <RadioButtonUncheckedIcon fontSize="small" />
        );

        button.color = "secondary";
        button.title = "Odznacz elementy grupy";

        button.handler = () =>
          actionsApi.removeManyFromMultiSelect?.(
            selectedInGroup
          );
      } else {
        button.icon = (
          <DoneAllIcon fontSize="small" />
        );

        button.color = "default";
        button.title = "Zaznacz grupę";

        button.handler = () =>
          actionsApi.addManyToMultiSelect?.(
            groupIds
          );
      }
    }

    else if (parent === "grouprow") {
      if (
        selectedIds.includes(params.id)
      ) {
        button.icon = (
          <CheckCircleIcon fontSize="small" />
        );

        button.color = "secondary";
        button.title = "Odznacz";

        button.handler = () =>
          actionsApi.toggleMultiSelect?.(
            params.id
          );
      } else {
        button.icon = (
          <RadioButtonUncheckedIcon fontSize="small" />
        );

        button.color = "default";
        button.title = "Zaznacz";

        button.handler = () =>
          actionsApi.toggleMultiSelect?.(
            params.id
          );
      }
    }

    else if (parent === "footer") {
      button.disabled =
        selectedIds.length === 0;

      if (selectedIds.length > 0) {
        button.icon = (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <ClearIcon fontSize="small" />

            <Typography variant="caption">
              {selectedIds.length}
            </Typography>
          </Box>
        );

        button.color = "warning";

        button.title =
          `Wyczyść: ${selectedIds.length}`;

        button.handler = () =>
          actionsApi.clearMultiSelect?.();
      } else {
        button.icon = (
          <Box
            sx={{
              width: 20,
              height: 20,
            }}
          />
        );

        button.color = "default";
        button.title = "Brak zaznaczeń";
      }
    }

    else if (
      parent === "body" ||
      parent === "tree"
    ) {
      if (
        selectedIds.includes(params.id)
      ) {
        button.icon = (
          <CheckCircleIcon fontSize="small" />
        );

        button.color = "secondary";
        button.title = "Odznacz wiersz";

        button.handler = () =>
          actionsApi.toggleMultiSelect?.(
            params.id
          );
      } else {
        button.icon = (
          <RadioButtonUncheckedIcon fontSize="small" />
        );

        button.color = "default";
        button.title = "Zaznacz wiersz";

        button.handler = () =>
          actionsApi.toggleMultiSelect?.(
            params.id
          );
      }
    }
  }

  // DELETE
  else if (type === "delete") {
    if (
      parent === "body" ||
      parent === "grouprow" ||
      parent === "tree"
    ) {
      button.icon = (
        <DeleteIcon fontSize="small" />
      );

      button.color = "error";
      button.title = "Usuń wiersz";

      button.handler = () =>
        actionsApi.deleteOne?.(params.id);
    } else {
      button.icon = null;
    }
  }

  if (!button.icon) {
    return null;
  }

  const iconButton = (
    <IconButton
      size="small"
      color={button.color}
      disabled={button.disabled}
      title={
        button.disabled
          ? button.title
          : undefined
      }
      onClick={
        button.disabled
          ? undefined
          : (e) => {
            e.stopPropagation?.();
            button.handler?.();
          }
      }
    >
      {button.icon}
    </IconButton>
  );

  if (button.disabled) {
    return iconButton;
  }

  return (
    <Tooltip title={button.title}>
      {iconButton}
    </Tooltip>
  );
};

const ActionCell = ({
  column = {},
  params = {},
  parent = "body",
  actionsApi,
  cellSX = {},
  data = [],
  settings = {},
}) => {
  if (!actionsApi) return null;

  const baseCellSx = getCellSx({
    column,
    settings,
    fallbackWidth: 40,
    align: column.align || "center",
    sx: cellSX,
  });

  const baseInnerSx = getCellInnerSx({
    settings,
    mode: "action",
  });

  return (
    <TableCell
      align={column.align || "center"}
      sx={{
        ...baseCellSx
      }}
    >
      <Box sx={baseInnerSx}>
        {getButton({
          parent,
          column,
          params,
          actionsApi,
          data,
        })}
      </Box>
    </TableCell>
  );
};

export default ActionCell;