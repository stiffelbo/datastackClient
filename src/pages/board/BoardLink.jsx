
import React, { useEffect, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";

import useEntity from "../../hooks/useEntity";

import { Badge, IconButton, Tooltip } from "@mui/material";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

const POLLING_INTERVAL = 30000;

const BoardLink = () => {
    const entity = useEntity({
        endpoint: "board",
        entityName: "Board",
        reload: true,
        cacheHardKey : 'Board'
    });

    const rows = entity.rows || [];

    const activeRows = useMemo(
        () => rows.filter(r => +r.is_active === 1).length,
        [rows]
    );

    useEffect(() => {
        const interval = setInterval(() => {
            if (!document.hidden) {
                entity.refresh();
            }
        }, POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, [entity.refresh]);

    return (
        <Tooltip title={`Moja tablica (${activeRows} aktywnych)`}>
            <IconButton
                component={RouterLink}
                to="/board"
                color={"default"}
                size="small"
                sx={{
                    mx: 0.5,
                    animation: activeRows > 0
                        ? "boardPulse 2.5s ease-in-out infinite"
                        : "none",
                    "@keyframes boardPulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.45 },
                    },
                    "@media (prefers-reduced-motion: reduce)": {
                        animation: "none",
                    },
                }}
            >
                <Badge
                    badgeContent={activeRows}
                    color="error"
                    max={99}
                    invisible={activeRows === 0}
                    overlap="circular"
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    <ContentPasteIcon />
                </Badge>
            </IconButton>
        </Tooltip>
    );
};

export default BoardLink;
