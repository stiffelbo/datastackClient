// TopBar.jsx
import React from "react";
import {
    Stack,
    Tooltip,
    IconButton,
    Box,
    Typography,
    CircularProgress,
    Divider
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import AlertsChips from "./alertChips";
/**
 * TopBar z podziałem na segmenty:
 *  [ akcja ] | [ nawigacja ] | [ alerty ] | [ misc ]
 *
 * Props:
 *  - onChooseFile(file)
 *  - onDownload()
 *  - onUpload()
 *  - uploadEnabled (bool)
 *  - parsing (bool)
 *  - rowsCount (int)
 *  - view ("mapper"|"table")
 *  - setView(view)
 *  - alertsProps: { totalRows, mappedCount, requiredMissingList }   // opcjonalne — jeśli podasz, TopBar pokaże krótkie statystyki
 */
const TopBar = ({
    onChooseFile = () => { },
    onDownload = () => { },
    onUpload = () => { },
    onClearData = () => { },
    uploadEnabled = false,
    parsing = false,
    rowsCount = 0,
    alertsProps = null,
    importSchema = [],
    mapping = {},
    loading = false
}) => {
    // helper do wrappera tooltipu na disabled element
    const wrap = (children, title, disabled = false) =>
        disabled ? <Tooltip title={title}><span>{children}</span></Tooltip> : <Tooltip title={title}>{children}</Tooltip>;

    // powody wyłączenia uploadu (tooltip)
    const uploadDisabledReason = () => {
        if (parsing) return "Upload zablokowany — trwa parsowanie pliku";
        if (rowsCount === 0) return "Brak załadowanego pliku";
        if (!uploadEnabled) {
            if (alertsProps?.requiredMissingList?.length) {
                return `Brakuje mapowania dla wymaganych pól: ${alertsProps.requiredMissingList.join(", ")}`;
            }
            return "Upload zablokowany — sprawdź mapowanie pól";
        }
        return "Wgraj dane";
    };

    // file input handler (we receive File object)
    const onFileInputChange = (e) => {
        const f = e.target.files?.[0];
        if (f) onChooseFile(f);
        e.target.value = null;
    };

    return (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, gap: 1 }}>
            {/* ==== AKCJA ==== */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <input
                    id="import-file-input-topbar"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: "none" }}
                    onChange={onFileInputChange}
                />
                {wrap(
                    <IconButton
                        size="small"
                        aria-label="Wybierz plik"
                        color="primary"
                        onClick={() => document.getElementById("import-file-input-topbar")?.click()}
                    >
                        <InsertDriveFileIcon fontSize="small" />
                    </IconButton>,
                    "Wybierz plik (.xlsx, .csv)"
                )}

                {wrap(
                    <IconButton size="small" aria-label="Pobierz szablon" color="secondary" onClick={onDownload}>
                        <DownloadIcon fontSize="small" />
                    </IconButton>,
                    "Pobierz szablon (nagłówki pól)"
                )}
                {wrap(
                    <IconButton size="small" aria-label="Pobierz szablon" color="error" onClick={onClearData}>
                        <DeleteForeverIcon fontSize="small" />
                    </IconButton>,
                    "Wyczyść wczytane Dane"
                )}

                {!loading && wrap(
                    <IconButton
                        size="small"
                        aria-label="Upload"
                        color={uploadEnabled ? "success" : "default"}
                        onClick={onUpload}
                        disabled={!uploadEnabled || parsing || rowsCount === 0}
                    >
                        <CloudUploadIcon fontSize="small" />
                    </IconButton>,
                    uploadDisabledReason(),
                    !uploadEnabled || parsing || rowsCount === 0
                )}
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* ==== ALERTY / STATS ==== */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <AlertsChips
                    alertsProps={alertsProps.requiredMissingList}
                    rowsCount={rowsCount}
                    importSchema={importSchema}
                    mapping={mapping}
                />
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* ==== MISC ==== */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {parsing && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CircularProgress size={16} />
                        <Typography variant="caption" color="text.secondary">
                            Parsowanie...
                        </Typography>
                    </Box>
                )}
            </Box>
        </Stack>
    );
};

export default TopBar;
