import React, {useState} from "react";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

import {useRwd} from "../../../context/RwdContext";
import EntityQueryManager from "./EntityQueryManager";

const MOBILE_BREAKPOINT = 768;

const EntityQueryButton = ({entity, disabled = false}) => {
    const [open, setOpen] = useState(false);

    const rwd = useRwd();

    const screenWidth = Number(
        rwd?.screen?.width ??
        rwd?.width ??
        0
    );

    const isMobile = screenWidth < MOBILE_BREAKPOINT;

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    if(!entity || !entity.schema || !entity.schema.filterableFields || entity.schema.filterableFields.length === 0) {
        return null;
    }

    return (
        <>
            <Tooltip title="Otwórz konfigurator filtrów">
                <span>
                    <IconButton
                        size="small"
                        color="info"
                        disabled={disabled}
                        onClick={handleOpen}
                        aria-label="Otwórz konfigurator filtrów"
                    >
                        <ManageSearchIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>

            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                fullScreen={isMobile}
                maxWidth="xl"
                slotProps={{
                    paper: {
                        sx: {
                            width: "100%",
                            height: isMobile ? "100%" : "90vh",
                            maxHeight: isMobile ? "100%" : "90vh",
                            m: isMobile ? 0 : 2,
                            overflow: "hidden",
                        },
                    },
                }}
            >
                <DialogTitle
                    component="div"
                    sx={{
                        minHeight: 56,
                        px: 2,
                        py: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        borderBottom: 1,
                        borderColor: "divider",
                    }}
                >
                    Konfigurator filtrów danych

                    <Tooltip title="Zamknij konfigurator">
                        <IconButton
                            size="small"
                            onClick={handleClose}
                            aria-label="Zamknij konfigurator filtrów"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </DialogTitle>

                <DialogContent
                    sx={{
                        p: 0,
                        flex: 1,
                        minHeight: 0,
                        overflow: "hidden",
                    }}
                >
                    {open && (
                        <EntityQueryManager
                            entity={entity}
                            onClose={handleClose}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EntityQueryButton;