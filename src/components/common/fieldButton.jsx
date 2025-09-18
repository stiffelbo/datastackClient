import React from "react";
import PropTypes from "prop-types";
import { Button, Alert } from "@mui/material";
import { green, blue, amber, grey, cyan, deepPurple, deepOrange, red } from "@mui/material/colors"; // 🎨 MUI Colors

// Icons
import NumbersIcon from "@mui/icons-material/Numbers";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DataArrayIcon from "@mui/icons-material/DataArray"; // Array Icon
import StorageIcon from "@mui/icons-material/Storage"; // Object Icon
import CodeIcon from "@mui/icons-material/Code"; // JSON Icon
import KeyIcon from "@mui/icons-material/Key";

// 🎨 Explicitly Mapped Colors from MUI Palette
const fieldStyles = {
    id: { color: green[700], icon: <KeyIcon /> },          // IDs → Green (🔑 Key-like)
    number: { color: blue[600], icon: <NumbersIcon /> },   // Numbers → Blue (Data-like)
    string: { color: deepPurple[600], icon: <TextFieldsIcon /> }, // Strings → Deep Purple (Text)
    date: { color: amber[700], icon: <CalendarTodayIcon /> }, // Dates → Amber (Time-based)
    boolean: { color: cyan[600], icon: <ToggleOnIcon /> }, // Booleans → Cyan (Switch-like)
    array: { color: deepOrange[600], icon: <DataArrayIcon /> }, // Arrays → Deep Orange (Grouped values)
    object: { color: grey[800], icon: <StorageIcon /> },  // Objects → Grey (Storage)
    json: { color: red[600], icon: <CodeIcon /> },        // JSON → Red (Code representation)
};

/**
 * FieldButton Component
 * @param {string} field - Field name
 * @param {string} type - Field type (number, string, boolean, date, array, object, json)
 * @param {function} onToggle - Function to handle field selection (toggle), controlled from parent
 * @param {boolean} selected - Whether the field is currently selected
 * @param {object} sx - Optional styles override
 */

const FieldButton = ({ field, type, onToggle, selected, sx }) => {
    if (!field) return <Alert severity="warning">Brak Danych o polu</Alert>;

    const style = fieldStyles[type] || { color: blue[500], icon: <AddCircleOutlineIcon /> }; // Default → Grey

    return (
        <Button
            variant={selected ? "contained" : "outlined"} // 🔹 Contained when selected, outlined when not
            sx={{
                m: 0.5,
                textTransform: "none",
                backgroundColor: selected ? style.color : "transparent",
                borderColor: style.color,
                color: selected ? "white" : style.color,
                "&:hover": {
                    backgroundColor: selected ? style.color : grey[200], // Subtle hover effect
                },
                ...sx, // Allows `sx` override
            }}
            startIcon={style.icon}
            onClick={() => onToggle(field)}
            title={`Typ Pola: ${type}`}
        >
            {field}
        </Button>
    );
};

FieldButton.propTypes = {
    field: PropTypes.string,
    type: PropTypes.string,
    onToggle: PropTypes.func.isRequired,
    selected: PropTypes.bool,
    sx: PropTypes.object, // Optional styling
};

FieldButton.defaultProps = {
    selected: false,
    sx: {},
};

export default FieldButton;
