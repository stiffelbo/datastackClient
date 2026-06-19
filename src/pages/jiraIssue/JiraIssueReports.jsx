import React, { useMemo, useState } from "react";

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
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import LogForm from '../../components/logForm/LogForm';
import OperationLog from "../../components/user/OperationalLog";

const NAV_ITEMS = [
    {
        key: "logForm",
        label: "Raportuj",
        icon: <AlarmAddIcon fontSize="small" color="success" />,
    },
    {
        key: "operationLog",
        label: "Czasy Pracy",
        icon: <AccessTimeIcon fontSize="small" color="primary" />,
    },
    {
        key: "machineUsageLog",
        label: "Czasy Maszyn",
        icon: <PrecisionManufacturingIcon fontSize="small" color="primary" />,
    },
    {
        key: "resourceUsageLog",
        label: "Użycie zasobów",
        icon: <InventoryIcon fontSize="small" color="primary" />,
    },
    {
        key: "productionOutputLog",
        label: "Wydania produkcyjne",
        icon: <AssignmentTurnedInIcon fontSize="small" color="primary" />,
    },
    {
        key: "directPurchaseLog",
        label: "Zakupy bezpośrednie",
        icon: <ShoppingCartIcon fontSize="small" color="primary" />,
    }
];

const JiraIssueReports = ({ id = null, row = {}, rwd = defaultRwd }) => {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const height = rwd.height - 190;

    const [activeView, setActiveView] = useState("operationLog");

    const renderComponent = () => {
        if (activeView === 'logForm')
            return <LogForm initialTasks={[row]} />
        if (activeView === 'operationLog')
            return <OperationLog
                entityName={'IssueOperationLog'}
                endpoint={'/jira_issue_operation_log/'}
                height={height}
                issue={row}
                label="Czasy Pracy"
            />
        if (activeView === 'machineUsageLog')
            return <OperationLog
                entityName={'IssueMachineUsageLog'}
                endpoint={'/jira_issue_machine_usage_log/'}
                height={height}
                issue={row}
                label="Czasy Maszyn"
            />
        if (activeView === 'resourceUsageLog')
            return <OperationLog
                entityName={'IssueResourceUsageLog'}
                endpoint={'/jira_issue_resource_usage_log/'}
                height={height}
                issue={row}
                label="Użycie zasobów"
            />
        if (activeView === 'productionOutputLog')
            return <OperationLog
                entityName={'IssueProductionOutputLog'}
                endpoint={'/jira_issue_production_output_log/'}
                height={height}
                issue={row}
                label="Wydania produkcyjne"
            />
        if (activeView === 'directPurchaseLog')
            return <OperationLog
                entityName={'IssueDirectPurchaseLog'}
                endpoint={'/jira_issue_direct_purchase/'}
                height={height}
                issue={row}
                label="Zakupy bezpośrednie"
            />
    }

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
                    <Box sx={{ p: 2 }}>
                        {renderComponent()}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default JiraIssueReports;