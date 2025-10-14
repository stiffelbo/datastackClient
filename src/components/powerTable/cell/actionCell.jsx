import React from "react";
import { TableCell, IconButton, Tooltip, Typography, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";

/**
 * 🧩 getButton — drzewo decyzyjne generujące pełny obiekt przycisku akcji
 * Całość oparta na klasycznych if-ach dla czytelności i przewidywalności
 */
export const getButton = ({ parent, column, params, actionsApi, data = [] }) => {
  const { type } = column.meta || {};
  const { selected, selectedIds = [] } = actionsApi || {};

  // grupowe id wierszy (jeśli dostępne)
  const groupIds = Array.isArray(data)
    ? data.map((r) => (r.row ? r.row.id : r.id))
    : [];

  const selectedInGroup = groupIds.filter((id) =>
    selectedIds.includes(id)
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
    handler: () => {},
  };

  // --------------------------------------------------------------------------
  // 🔹 DRZEWO DECYZYJNE
  // --------------------------------------------------------------------------
  if (type === "select") {
    if (parent === "body") {
      if (selected === params.id) {
        button.icon = <CheckCircleIcon fontSize="small" />;
        button.color = "primary";
        button.title = "Odznacz element";
        button.handler = () => actionsApi.toggleSelect?.(params.id);
      } else {
        button.icon = <RadioButtonUncheckedIcon fontSize="small" />;
        button.color = "default";
        button.title = "Wybierz element";
        button.handler = () => actionsApi.toggleSelect?.(params.id);
      }
    } else {
      button.icon = null;
      button.handler = () => {};
    }
  }

  //MULTI SELECT

  else if (type === "multiSelect") {
    if (parent === "header") {
      if (selectedIds.length > 0) {
        button.icon = <RadioButtonUncheckedIcon fontSize="small" />;
        button.color = "secondary";
        button.title = `Odznacz ${selectedIds.length} wierszy`;
        button.handler = () => actionsApi.toggleMultiSelect?.(selectedIds);
      } else {
        button.icon = <DoneAllIcon fontSize="small" />;
        button.color = "default";
        button.title = `Zaznacz ${data.length} wierszy`;
        button.handler = () => actionsApi.toggleMultiSelect?.(data.map((i) => i.id));
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
      if(selectedIds.includes(params.id)){        
        button.icon = <CheckCircleIcon fontSize="small" />;
        button.color = "secondary";
        button.title = "Zaznacz";
        button.handler = () => actionsApi.toggleMultiSelect?.(params.id);
      }else{
        button.icon = <RadioButtonUncheckedIcon fontSize="small" />;
        button.color = "default";
        button.title = "Odznacz";
        button.handler = () => actionsApi.toggleMultiSelect?.(params.id);
      }
    }

    else if (parent === "footer") {
      button.icon = (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <DoneAllIcon fontSize="small" />
          <Typography variant="caption">{selectedIds.length}</Typography>
        </Box>
      );
      if (selectedIds.length > 0) {
        button.color = "success";
        button.title = `Zaznaczonych: ${selectedIds.length}`;
        button.handler = () => actionsApi.clearMultiSelect?.();
      } else {
        button.color = "default";
        button.title = "Brak zaznaczeń";
        button.handler = () => {};
      }
    }

    else if (parent === "body") {
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
    if (parent === "body") {
      button.icon = <DeleteIcon fontSize="small" />;
      button.color = "error";
      button.title = "Usuń wiersz";
      button.handler = () => actionsApi.deleteOne?.(params.id);
    } else {
      button.icon = null;
      button.handler = () => {};
    }
  }

  // --------------------------------------------------------------------------
  // 🧭 RETURN FINAL JSX
  // --------------------------------------------------------------------------
  if (!button.icon) return null;

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

  if (!column?.meta || !actionsApi) return null;
  //Extracting PARAMS

  return (
    <TableCell
      align={column.align || "center"}
      sx={{
        ...cellSX,
        padding: "4px",
        verticalAlign: "middle",
        borderRight: "1px solid #eee",
      }}
    >
      {getButton({ parent, column, params, actionsApi, data })}
    </TableCell>
  );
};

export default ActionCell;