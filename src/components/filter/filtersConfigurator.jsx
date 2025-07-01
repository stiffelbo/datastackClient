import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";
import { Close } from "@mui/icons-material";
import useLocalStorage from "../../../hooks/useLocalStorage";
import FieldButton from "../grouper/fieldButton";
import { mergeFiltersWithExtractedFields } from "./utils";

const AVAILABLE_TYPES = {
    string: ["select", "select-transistor"],
    number: ["number", "range"],
    id: ["number", "range"],
    boolean: ["bool"],
    date: ["date", "dateRange", "select", "select-transistor"],
    slug: ["slug"]
};

const FiltersConfigurator = ({ schema, extractedFields, entityName, onClose, onSave }) => {
    const storageKey = `${entityName}-filterSchema`;

    // 🔹 Load stored settings, fallback to merged schema
    const [storedSchema, setStoredSchema] = useLocalStorage(storageKey, []);
    const [config, setConfig] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null); // 🟢 Track index of dragged item

    // 🔹 Extract fields from dataset and merge with schema
    useEffect(() => {
        const mergedSchema = mergeFiltersWithExtractedFields(schema, extractedFields);

        setConfig(storedSchema.length ? storedSchema : mergedSchema);
    }, [schema, storedSchema, extractedFields]);

    /** 🟢 Toggle Field Visibility */
    const toggleFieldVisibility = (name) => {
        setConfig(prev =>
            prev.map(col =>
                col.name === name ? { ...col, show: !col.show } : col
            )
        );
    };

    /** 🟢 Handle Label Change */
    const handleLabelChange = (name, newLabel) => {
        setConfig(prev =>
            prev.map(col =>
                col.name === name ? { ...col, label: newLabel } : col
            )
        );
    };

    /** 🟢 Change Filter Type */
    const handleTypeChange = (name, newType) => {
        setConfig(prev =>
            prev.map(col =>
                col.name === name ? { ...col, type: newType } : col
            )
        );
    };

    /** 🟢 Change Width */
    const handleWidthChange = (name, width) => {
        setConfig(prev =>
            prev.map(col =>
                col.name === name ? { ...col, width: width } : col
            )
        );
    };

   /** 🟢 DRAG & DROP HANDLERS **/
   const handleDragStart = (index) => {
    setDraggedIndex(index);
};

const handleDragOver = (event) => {
    event.preventDefault(); // Required for drop event to fire
};

const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedConfig = [...config];
    const [movedItem] = updatedConfig.splice(draggedIndex, 1); // Remove dragged item

    updatedConfig.splice(index, 0, movedItem); // Insert at new position

    setConfig(updatedConfig);
    setDraggedIndex(null);
};
    /** 🟢 Save Configurations */
    const saveSettings = () => {
        setStoredSchema(config);
        onSave(config);
        onClose();
    };

    /** 🟢 Delete Configurations */
    const resetSettings = () => {
        setStoredSchema([]);
        onSave([]);
        onClose();
    };

    /** 🔹 Render Individual Filter */
    const renderField = (col, index) => (
        <Grid container 
            key={col.name} 
            draggable="true" // 🟢 Make draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, p: 1, 
                borderRadius: 1, bgcolor: col.show ? "rgba(0, 150, 255, 0.15)" : "rgba(0, 0, 0, 0.05)",
                cursor: "grab" 
            }}
        >
            
            {/* Toggle Visibility */}
            <Grid item md={3}>
                <FieldButton field={col.name} type={col.type} selected={col.show} onToggle={toggleFieldVisibility} sx={{width: 350}}/>
            </Grid>

            {/* Edit Label */}
            <TextField
                size="small"
                variant="outlined"
                value={col.label}
                onChange={(e) => handleLabelChange(col.name, e.target.value)}
                label="Nazwa filtra"
                sx={{ width: 300 }}
            />

            {/* Select Type */}
            <FormControl size="small" sx={{ width: 220 }}>
                <InputLabel>Typ</InputLabel>
                <Select value={col.type} onChange={(e) => handleTypeChange(col.name, e.target.value)}>
                    {AVAILABLE_TYPES[col.dataType]?.map(type => (
                        <MenuItem key={type} value={type}>
                            {type}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Filter Width */}
            <TextField
                size="small"
                type="number"
                variant="outlined"
                value={col.width || 200}
                onChange={(e) => handleWidthChange(col.name, Number(e.target.value))}
                inputProps={{step: 10}}
                label="Szerokość"
                sx={{ width: 100 }}
            />
        </Grid>
    );

    return (
        <Paper sx={{ display: "flex", flexDirection: "column", padding: 3, height: "100%", width: "100%", overflow: "hidden" }}>
            
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: "white", borderBottom: 1, display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Konfiguracja Filtrów</Typography>
                <Button variant="contained" onClick={saveSettings}>Zapisz</Button>
                <Button variant="contained" color="error" onClick={resetSettings} sx={{marginLeft : 3}}>Wyczyść Ustawienia</Button>
                <IconButton onClick={onClose}><Close /></IconButton>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ overflowY: "auto", p: 2 }}>
                {config.map((col, index) => renderField(col, index))}
            </Box>
        </Paper>
    );
};

export default FiltersConfigurator;
