// ImportWizard.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    Box,
    Typography,
    Divider,
    CircularProgress
} from "@mui/material";

import { parseFile, downloadTemplate, buildMappedRows, computeMappingStats } from "./utils";

import TopBar from "./topBar";
import ImportTable from "./importTable";

const ImportWizard = ({ importSchema = [], lists = null, onUpload = () => { }, loading }) => {

    const fileInputRef = useRef(null);
    const [parsing, setParsing] = useState(false);
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [mapping, setMapping] = useState({});
    const [options, setOptions] = useState({}); // { period_id: '', structure_id: '' }
    const [error, setError] = useState(null);

    // initialize options from lists (or when lists prop changes)
    useEffect(() => {
        if(Array.isArray(lists) && lists.length){
            const init = {};
            (lists || []).forEach(l => {
                // prefer explicit default, otherwise empty string
                init[l.field] = typeof l.default !== 'undefined' ? l.default : '';
            });
            setOptions(init);
        }
    }, [lists]);

    const handleClear = () => {
        setRows([]);
        setMapping({});
        setHeaders([]);
        // reset options too?
        const reset = {};
        (lists || []).forEach(l => { reset[l.field] = typeof l.default !== 'undefined' ? l.default : ''; });
        setOptions(reset);
    };

    // parse file (pure parseFile used here)
    const handleFile = async (file) => {
        if (!file) return;
        setParsing(true);
        setError(null);
        try {
            const { headers: hdrs, rows: parsedRows, mapping: auto } = await parseFile(file, importSchema);
            setHeaders(hdrs);
            setRows(parsedRows);
            setMapping(auto);
        } catch (e) {
            console.error(e);
            setError("Błąd parsowania pliku (xlsx/csv).");
        } finally {
            setParsing(false);
        }
    };

    // download template wrapper
    const handleDownload = () => {
        try {
            downloadTemplate(importSchema);
        } catch (e) {
            console.error(e);
            setError("Błąd generowania szablonu");
        }
    };

    // stats (delegated)
    const { totalRows, mappedCount, requiredMissingList, uploadEnabled: baseUploadEnabled } = computeMappingStats(importSchema, mapping, rows);

    // handle list value changes called from TopBar (or other UI)
    const handleListChange = ({ field, value }) => {
        setOptions(prev => ({ ...prev, [field]: value }));
    };

    const handleUploadClick = () => {
        // base mapping checks
        if (!baseUploadEnabled) {
            setError(requiredMissingList.length ? `Brak mapowania dla: ${requiredMissingList.join(", ")}` : "Brak danych do wgrania");
            return;
        }

        // If lists defined, ensure required selections are present.
        // We treat a missing selection as empty string / null / undefined.
        const missingLists = (lists || []).filter(l => {
            // allow zero value (0) — treat '' / null / undefined as missing
            const v = options[l.field];
            return v === '' || v === null || typeof v === 'undefined';
        }).map(l => l.field);

        if (missingLists.length > 0) {
            setError(`Wybierz wartości dla: ${missingLists.join(", ")}`);
            return;
        }

        setError(null);
        let mappedRows = buildMappedRows(rows, importSchema, mapping);

        // inject list values into each mapped row
        if (mappedRows.length > 0 && (lists || []).length > 0) {
            mappedRows = mappedRows.map(row => {
                const copy = { ...row };
                (lists || []).forEach(l => {
                    const chosen = options[l.field];
                    // If override wants to map to a different field in DB, prefer l.mapsTo
                    const targetField = l.mapsTo || l.field;
                    copy[targetField] = chosen;
                });
                return copy;
            });
        }

        // call onUpload(mappedRows, importSchema, options) — third param optional
        try {
            onUpload(mappedRows, importSchema, options);
        } catch (e) {
            console.error("onUpload handler threw:", e);
            setError("Błąd podczas wywołania onUpload");
        }
    };

    return (
        <Box sx={{ p: 1, maxHeight: '100%', overflowY: 'scroll', position: 'relative' }}>
            <TopBar
                onChooseFile={handleFile}
                onDownload={handleDownload}
                onUpload={handleUploadClick}
                onClearData={handleClear}
                uploadEnabled={baseUploadEnabled}
                parsing={parsing}
                rowsCount={rows.length}
                alertsProps={{ totalRows, mappedCount, requiredMissingList }}
                importSchema={importSchema}
                mapping={mapping}
                loading={loading}
                lists={lists}
                onListsChange={handleListChange}
                optionValues={options}
            />

            <Divider sx={{ mb: 1 }} />
            <Box>
                <ImportTable
                    importSchema={importSchema}
                    rows={rows}
                    headers={headers}
                    mapping={mapping}
                    onMappingChange={(field, header) => setMapping(prev => ({ ...prev, [field]: header }))}
                    pageSize={100}
                    showMappingControls={true}
                    height={600}
                />
            </Box>
            {error && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="error">{error}</Typography>
                </Box>
            )}

            {/* Overlay spinner - wyświetlany tylko nad sekcją tabeli */}
            {loading && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        pointerEvents: "all",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <CircularProgress color="primary" />
                        <Typography variant="caption" sx={{ mt: 0.5 }}>
                            Wgrywam dane...
                        </Typography>
                    </Box>
                </Box>)}
        </Box>
    );
};

export default ImportWizard;
