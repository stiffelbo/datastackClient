import React from "react";
import { Chip, Tooltip } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const ALLOWED_HOSTS = new Set([
    "192.168.1.135",
    window.location.hostname,
]);

const DSLink = ({ value }) => {
    if (value == null || value === "") return null;

    const raw = String(value).trim();

    const parseLink = () => {
        try {
            const url = new URL(raw, window.location.origin);

            if (!["http:", "https:"].includes(url.protocol)) return null;
            if (!ALLOWED_HOSTS.has(url.hostname)) return null;
            if (url.username || url.password) return null;

            const parts = url.pathname.split("/").filter(Boolean);

            if (parts.length < 3 || parts.length > 4) return null;
            if (parts[0] !== "datastack") return null;

            const [, entity, id, tab] = parts;

            if (!/^[a-z][a-z0-9_-]*$/i.test(entity)) return null;
            if (!/^[1-9]\d*$/.test(id)) return null;
            if (tab && !/^[a-z][a-z0-9_-]*$/i.test(tab)) return null;

            return {
                entity,
                id,
                tab,
                href: url.href,
            };
        } catch {
            return null;
        }
    };

    const link = parseLink();

    if (!link) return <span>{raw}</span>;

    const label = [
        link.entity,
        `#${link.id}`,
        link.tab,
    ].filter(Boolean).join(" / ");

    return (
        <Tooltip title={link.href} arrow>
            <Chip
                size="small"
                variant="outlined"
                color="primary"
                icon={<OpenInNewIcon fontSize="small" />}
                label={label}
                component="a"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                clickable
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                sx={{
                    maxWidth: "100%",
                    cursor: "pointer",
                    "& .MuiChip-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    },
                }}
            />
        </Tooltip>
    );
};

export default DSLink;