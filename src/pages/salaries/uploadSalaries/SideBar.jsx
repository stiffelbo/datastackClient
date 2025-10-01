import React, { useState } from "react";

//Comp
import PeriodsList from "./PeriodsList";

//Mui
import { Box, Drawer, IconButton, Alert, Typography, CircularProgress, Menu, MenuItem, Badge } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const SideBar = ({ rows, loading, periods, periodID, setPeriodID, onUpload, onInputFiles, setRows }) => {
    //UI
    const [openDrawer, setOpenDrawer] = useState(false);

    const renderDeleteData = () => {
        if (rows.length) {
            return <IconButton size="small" color="error" title="Usuń dane" onClick={() => setRows([])}>
                <DeleteIcon fontSize="small" />
            </IconButton>
        }
    }

    const renderUploadButton = () => {
        if (loading) return <CircularProgress size="small" />
        if (rows.length && periodID) {
            return <IconButton size="small" color="success" onClick={onUpload}>
                <CloudUploadIcon />
            </IconButton>
        }
    }

    return <Box
        sx={{
            width: '3rem',
            bgcolor: 'background.paper',
            borderRight: '1px solid #ddd',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 1,
            gap: 1,
        }}
    >
        <IconButton size="small" color="primary" title="Wgraj dane z plików .xslx" onClick={() => setOpenDrawer(true)}>
            <UploadFileIcon fontSize="small" />
        </IconButton>
        {renderDeleteData()}
        {renderUploadButton()}
        <PeriodsList
            periods={periods}
            onChange={setPeriodID}
            value={periodID}
        />
        <Drawer anchor="left" open={openDrawer} onClose={() => setOpenDrawer(false)}>
            <Box p={2} minWidth={250}>
                <Typography variant="subtitle1">Wgraj pliki z wynagrodzeniami</Typography>
                <input
                    type="file"
                    accept=".xlsx"
                    multiple
                    onChange={onInputFiles}
                    style={{ marginTop: '1rem' }}
                />
            </Box>
        </Drawer>
    </Box>
}

export default SideBar;