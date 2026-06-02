import React, { useMemo, useState } from "react";

import LSUsage from "./LSUsage";
import UsersTechStack from "./UsersTechStack";
import AppVersion from "./AppVersion";

import LogForm from "../logForm/LogForm";

import OperationLog from "./OperationalLog";

import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import StorageIcon from "@mui/icons-material/Storage";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AlarmAddIcon from '@mui/icons-material/AlarmAdd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

import { useRwd } from "../../context/RwdContext";

const NAV_ITEMS = [
    {
        key: "logForm",
        label: "Raportuj",
        icon: <AlarmAddIcon fontSize="small" color="success" />,
        component: <LogForm />,
    },
    {
        key: "operationLog",
        label: "Czasy Pracy",
        icon: <AccessTimeIcon fontSize="small" color="primary" />,
        component: <OperationLog entityName={'UserOperationLog'} endpoint={'/jira_issue_user_logs/operation_log/'}/>,
    },
    {
        key: "machineUsageLog",
        label: "Czasy Maszyn",
        icon: <PrecisionManufacturingIcon fontSize="small" color="primary" />,
        component: <OperationLog entityName={'UserMachineUsageLog'} endpoint={'/jira_issue_user_logs/machine_usage_log/'}/>,
    },
    {
        key: "resourceUsageLog",
        label: "Użycie zasobów",
        icon: <InventoryIcon fontSize="small" color="primary" />,
        component: <OperationLog entityName={'UserResourceUsageLog'} endpoint={'/jira_issue_user_logs/resource_usage_log/'}/>,
    },
    {
        key: "productionOutputLog",
        label: "Wydania produkcyjne",
        icon: <AssignmentTurnedInIcon fontSize="small" color="primary" />,
        component: <OperationLog entityName={'UserProductionOutputLog'} endpoint={'/jira_issue_user_logs/production_output_log/'}/>,
    },
    {
        key: "techstack",
        label: "Procesy użytkownika",
        icon: <AccountTreeIcon fontSize="small" color="secondary"/>,
        component: <UsersTechStack />,
    },
    {
        key: "usage",
        label: "Presety Dashboardów",
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
                    gridTemplateColumns: isMobile ? "1fr" : "auto 1fr",
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
                        width: isMobile ? "100%" : "72px",
                        minWidth: isMobile ? "100%" : "72px",
                        height: isMobile ? "fit-content" : "100%",
                        minHeight: isMobile ? "fit-content" : "100%",
                        maxHeight: isMobile ? "fit-content" : "100%",
                    }}
                >
                    {isMobile ? (
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ p: 1, overflowX: "auto" }}
                        >
                            {NAV_ITEMS.map((item) => {
                                const selected = item.key === activeView;

                                return (
                                    <Tooltip key={item.key} title={item.label}>
                                        <ListItemButton
                                            selected={selected}
                                            onClick={() => setActiveView(item.key)}
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                minWidth: 48,
                                                p: 0,
                                                borderRadius: 2,
                                                border: 1,
                                                borderColor: selected ? "primary.main" : "divider",
                                                justifyContent: "center",
                                                flex: "0 0 auto",
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                        </ListItemButton>
                                    </Tooltip>
                                );
                            })}
                        </Stack>
                    ) : (
                        <List sx={{ py: 1 }}>
                            {NAV_ITEMS.map((item) => (
                                <Tooltip key={item.key} title={item.label} placement="right">
                                    <ListItemButton
                                        selected={item.key === activeView}
                                        onClick={() => setActiveView(item.key)}
                                        sx={{
                                            mx: 1,
                                            mb: 0.5,
                                            borderRadius: 2,
                                            minHeight: 48,
                                            justifyContent: "center",
                                            px: 1,
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                justifyContent: "center",
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                    </ListItemButton>
                                </Tooltip>
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