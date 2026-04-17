import React, { useMemo, useState } from "react";

import LSUsage from "./LSUsage";
import UsersTechStack from "./UsersTechStack";
import AppVersion from "./AppVersion";

import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import StorageIcon from "@mui/icons-material/Storage";
import AccountTreeIcon from "@mui/icons-material/AccountTree";


import { useRwd } from "../../context/RwdContext";

const NAV_ITEMS = [
    {
        key: "techstack",
        label: "Procesy",
        icon: <AccountTreeIcon fontSize="small" />,
        component: <UsersTechStack />,
    },
    {
        key: "usage",
        label: "Presety",
        icon: <StorageIcon fontSize="small" />,
        component: <LSUsage />,
    },
];

const UserDashboard = () => {
    const rwd = useRwd();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const height = rwd.height - 78;

    const [activeView, setActiveView] = useState("usage");

    const activeItem = useMemo(() => {
        return NAV_ITEMS.find((item) => item.key === activeView) ?? NAV_ITEMS[0];
    }, [activeView]);

    return (
        <Box sx={{ height }}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "2fr 10fr",
                    gap: 2,
                    height: "100%",
                }}
            >
                <Paper
                    variant="outlined"
                    sx={{
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: isMobile ? "auto" : "100%",
                    }}
                >
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderBottom: 1,
                            borderColor: "divider",
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight={700}>
                            Panel
                        </Typography>
                    </Box>

                    {isMobile ? (
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ p: 1, overflowX: "auto" }}
                        >
                            {NAV_ITEMS.map((item) => {
                                const selected = item.key === activeView;

                                return (
                                    <ListItemButton
                                        key={item.key}
                                        selected={selected}
                                        onClick={() => setActiveView(item.key)}
                                        sx={{
                                            borderRadius: 2,
                                            minWidth: 160,
                                            border: 1,
                                            borderColor: selected ? "primary.main" : "divider",
                                            flex: "0 0 auto",
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                );
                            })}
                        </Stack>
                    ) : (
                        <List sx={{ py: 1 }}>
                            {NAV_ITEMS.map((item) => (
                                <ListItemButton
                                    key={item.key}
                                    selected={item.key === activeView}
                                    onClick={() => setActiveView(item.key)}
                                    sx={{
                                        mx: 1,
                                        mb: 0.5,
                                        borderRadius: 2,
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Paper>

                <Paper
                    variant="outlined"
                    sx={{
                        minHeight: 0,
                        height: "100%",
                        overflow: "auto",
                    }}
                >
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderBottom: 1,
                            borderColor: "divider",
                        }}
                    >
                        <Typography variant="h6">
                            {activeItem.label}
                        </Typography>
                    </Box>

                    <Box sx={{ p: 2 }}>
                        {activeItem.component}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default UserDashboard;