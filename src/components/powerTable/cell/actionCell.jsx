import React from "react";
import { TableCell, IconButton, Tooltip, Typography, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ChecklistIcon from '@mui/icons-material/Checklist';
import ClearIcon from '@mui/icons-material/Clear';

import {computeViewSelection} from '../utils';

/**
 * 🧩 getButton — drzewo decyzyjne generujące pełny obiekt przycisku akcji
 * Całość oparta na klasycznych if-ach dla czytelności i przewidywalności
 */
const getButton = ({ parent, column, columnsSchema, params, actionsApi, data = [] }) => {
  const { type } = column.meta || {};
  const { selected, selectedIds = [] } = actionsApi || {};

  // grupowe id wierszy (jeśli dostępne)
  const groupIds = Array.isArray(data)
    ? data.map((r) => (r.row ? r.row.id : r.id))
    : [];

  const selectedInGroup = groupIds.filter((id) =>
    selectedIds.includes?.(id)
  );
  const allSelected =
    selectedInGroup.length === groupIds.length && groupIds.length > 0;
  const partiallySelected =
    selectedInGroup.length > 0 && !allSelected;

  // 👇 domyślny guzik
  const button = {
    icon: <RadioButtonUncheckedIcon fontSize="small" />,
    color: "default",
    title: "",
    handler: () => { },
  };

  // --------------------------------------------------------------------------
  // 🔹 DRZEWO DECYZYJNE
  // --------------------------------------------------------------------------

  //SINGLE SELECT

  if (type === "select") {
    if (parent === "body" || parent === "grouprow" || parent === "tree") {
      if (selected === params.id) {
        button.icon = <CircleIcon fontSize="small" />;
        button.color = "primary";
        button.title = "Odznacz element";
        button.handler = () => actionsApi.toggleSelect?.(params.id);
      } else {
        button.icon = <RadioButtonUncheckedIcon fontSize="small" />;
        button.color = "primary";
        button.title = "Wybierz element";
        button.handler = () => actionsApi.toggleSelect?.(params.id);
      }
    } else {
      button.icon = null;
      button.handler = () => { };
    }
  }

  //MULTI SELECT

  else if (type === "multiSelect") {
    if (parent === "header") {
      // ids z obecnego widoku / filtrowanych wierszy
      const { viewIds: filteredIds, selectedInView, notSelectedInView } =
            computeViewSelection({ data, selectedIds });

      // brak wierszy w aktualnym widoku -> zablokuj guzik
      if (filteredIds.length === 0) {
        button.icon = <ChecklistIcon fontSize="small" />;
        button.color = "default";
        button.title = "Brak wierszy do zaznaczenia";
        button.disabled = true;
        button.handler = () => { };
      }
      // są zaznaczenia w obrębie widoku -> pokaż secondary i przekaż tylko te id
      else if (selectedInView.length > 0) {
        button.icon = <ChecklistIcon fontSize="small" />;
        button.color = "secondary";
        button.title = `Odznacz ${selectedInView.length} wierszy (z widoku)`;
        button.handler = () =>
          actionsApi.toggleMultiSelect?.(selectedInView);
      }
      // brak zaznaczeń w widoku -> zaznacz wszystkie id z widoku
      else {
        button.icon = <ChecklistIcon fontSize="small" />;
        button.color = "default";
        button.title = `Zaznacz ${filteredIds.length} wierszy (z widoku)`;
        button.handler = () =>
          actionsApi.toggleMultiSelect?.(filteredIds);
      }
    }

    else if (parent === "group") {
      if (allSelected || partiallySelected) {
        button.icon = <RadioButtonUncheckedIcon fontSize="small" />;
        button.color = "secondary";
        button.title = "Odznacz elementy grupy";
        button.handler = () => actionsApi.removeManyFromMultiSelect?.(selectedInGroup);
      } else {
        button.icon = <DoneAllIcon fontSize="small" />;
        button.color = "default";
        button.title = "Zaznacz grupę";
        button.handler = () => actionsApi.addManyToMultiSelect?.(groupIds);
      }
    }

    else if (parent === "grouprow") {
      if (selectedIds.includes(params.id)) {
        button.icon = <CheckCircleIcon fontSize="small" />;
        button.color = "secondary";
        button.title = "Zaznacz";
        button.handler = () => actionsApi.toggleMultiSelect?.(params.id);
      } else {
        button.icon = <RadioButtonUncheckedIcon fontSize="small" />;
        button.color = "default";
        button.title = "Odznacz";
        button.handler = () => actionsApi.toggleMultiSelect?.(params.id);
      }
    }

    else if (parent === "footer") {
      button.icon = (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ClearIcon fontSize="small" />
          <Typography variant="caption">{selectedIds.length}</Typography>
        </Box>
      );
      button.disabled = false;
      if (selectedIds.length > 0) {
        button.color = "warning";
        button.title = `Wyczyść : ${selectedIds.length}`;
        button.handler = () => {actionsApi.clearMultiSelect()};
      } else {
        button.disabled = true;
        button.icon = (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          </Box>
        );
        button.color = "default";
        button.title = "Brak zaznaczeń";
        button.handler = () => { };
      }
    }

    else if (parent === "body"  || parent === "tree") {
      if (selectedIds.includes(params.id)) {
        button.icon = <CheckCircleIcon fontSize="small" />;
        button.color = "secondary";
        button.title = "Odznacz wiersz";
        button.handler = () => actionsApi.toggleMultiSelect?.(params.id);
      } else {
        button.icon = <RadioButtonUncheckedIcon fontSize="small" />;
        button.color = "default";
        button.title = "Zaznacz wiersz";
        button.handler = () => actionsApi.toggleMultiSelect?.(params.id);
      }
    }
  }

  //DELETE

  else if (type === "delete") {
    if (parent === "body" || parent === "grouprow"  || parent === "tree") {
      button.icon = <DeleteIcon fontSize="small" />;
      button.color = "error";
      button.title = "Usuń wiersz";
      button.handler = () => actionsApi.deleteOne?.(params.id);
    } else {
      button.icon = null;
      button.handler = () => { };
    }
  }

  // --------------------------------------------------------------------------
  // 🧭 RETURN FINAL JSX
  // --------------------------------------------------------------------------
  if (!button.icon) return null;

  if (button.disabled) {
    return (
      <IconButton
        size="small"
        color={button.color}
        disabled
        title={button.title}
      >
        {button.icon}
      </IconButton>
    );
  }

  return (
    <Tooltip title={button.title}>
      <IconButton
        size="small"
        color={button.color}
        onClick={(e) => {
          e.stopPropagation?.();
          button.handler?.(params);
        }}
      >
        {button.icon}
      </IconButton>
    </Tooltip>
  );
};

const ActionCell = ({ column, params, parent = "body", actionsApi, cellSX = {}, data = [] }) => {


  if (!actionsApi) return null;
  //Extracting PARAMS

  return (
    <TableCell
      align={column.align || "center"}
      sx={{
        ...cellSX,
        verticalAlign: "middle",
        borderRight: "1px solid #eee",
        maxHeight: '100%',
        overflowY: 'scroll'
      }}
    >
      {getButton({ parent, column, params, actionsApi, data })}
    </TableCell>
  );
};

export default ActionCell;