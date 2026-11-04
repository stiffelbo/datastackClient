
import React from "react";
import { Chip, Tooltip } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const DSLink = ({ value, column }) => {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0 || !column?.reference) return <span>{value}</span>;

    const appUrl = import.meta.env.DEV
        ? import.meta.env.VITE_DEV_APP_URL
        : import.meta.env.VITE_PROD_APP_URL;

    const reference = column.reference;
    const tab = column?.tab ?? null;

    const link = [
        appUrl,
        encodeURIComponent(reference),
        id,
        ...(tab ? [encodeURIComponent(tab)] : []),
    ].join("/");

    return (
        <Tooltip title={`Otwórz ${reference} #${id} w nowej karcie`} arrow>
            <Chip
                component="a"
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                clickable
                size="small"
                variant="outlined"
                color="primary"
                label={`#${id}`}
                icon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
                sx={{
                    height: 24,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "none",
                    "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                    },
                }}
            />
        </Tooltip>
    );
};

export default DSLink;
