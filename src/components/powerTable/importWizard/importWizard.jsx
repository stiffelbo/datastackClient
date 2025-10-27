// ImportWizard.jsx
import React, { useMemo, useRef, useState } from "react";
import {
    Box,
    Typography,
    Divider,
    CircularProgress
} from "@mui/material";

import { parseFile, downloadTemplate, buildMappedRows, computeMappingStats } from "./utils"; // <- nowy utils (upewnij się ścieżki)

import TopBar from "./topBar";
import ImportTable from "./importTable";

const ImportWizard = ({ importSchema = [], onUpload = () => { }, loading }) => {

    const fileInputRef = useRef(null);
    const [parsing, setParsing] = useState(false);
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [mapping, setMapping] = useState({});
    const [error, setError] = useState(null);

    const handleClear = () => {
        setRows([]);
        setMapping({});
        setHeaders([]);
    };

    // parse file
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
            // bardziej przyjazny tekst — możesz rozszerzyć o e.message
            setError("Błąd parsowania pliku (xlsx/csv).");
            // opcjonalnie: setHeaders([]); setRows([]); setMapping({});
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
    const { totalRows, mappedCount, requiredMissingList, uploadEnabled } = computeMappingStats(importSchema, mapping, rows);

    const handleUploadClick = () => {
        if (!uploadEnabled) {
            setError(requiredMissingList.length ? `Brak mapowania dla: ${requiredMissingList.join(", ")}` : "Brak danych do wgrania");
            return;
        }
        setError(null);
        const mappedRows = buildMappedRows(rows, importSchema, mapping);
        //console.log(mappedRows);
        onUpload(mappedRows, importSchema);
    };

    return (
        <Box sx={{ p: 1, maxHeight: '100%', overflowY: 'scroll' }}>
            <TopBar
                onChooseFile={handleFile}
                onDownload={handleDownload}
                onUpload={handleUploadClick}
                onClearData={handleClear}
                uploadEnabled={uploadEnabled}
                parsing={parsing}
                rowsCount={rows.length}
                alertsProps={{ totalRows, mappedCount, requiredMissingList }}
                importSchema={importSchema}
                mapping={mapping}
                loading={loading}
            />

            <Divider sx={{ mb: 1 }} />
            <Box>
                <ImportTable
                    importSchema={importSchema}
                    rows={rows}               // surowe wiersze parsowane z XLSX
                    headers={headers}         // lista headerów z pliku
                    mapping={mapping}         // { field: header }
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
                        pointerEvents: "all", // blokuje interakcje z tabelą
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
                        {/* Opcjonalny tekst pod spinnerem — zakomentuj/usun jeśli nie chcesz */}
                        <Typography variant="caption" sx={{ mt: 0.5 }}>
                            Wgrywam dane...
                        </Typography>
                    </Box>
                </Box>)}
        </Box>
    );
};

export default ImportWizard;
