
import React from "react";

import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    Divider,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import ProductionTasksList from "./ProductionTasksList";
import ProductionProcessesList from "./ProductionProcessesList";
import ProductionRoutesList from "./ProductionRoutesList";

import { PRODUCTION_TASKS_LAYOUTS } from "./productionTasksLayouts";

const PANEL_TITLES = {
    processes: 'Katalog procesów',
    routes: 'Historyczne marszruty',
    task: 'Szczegóły zadania',
    'relations-in': 'Poprzedniki',
    'relations-out': 'Następniki',
};

const ProductionTasksLayoutManager = ({ production, rwd }) => {
    const theme = useTheme();
    const compact = useMediaQuery(theme.breakpoints.down('md'));

    const activePanel = production.ui.panel;
    const layout = PRODUCTION_TASKS_LAYOUTS[activePanel]
        ?? PRODUCTION_TASKS_LAYOUTS.route;

    const left = layout.left;
    const right = layout.right;

    // Renderowanie zawartości panelu lub widoku pełnoekranowego
    const renderPanel = (component) => {
        switch (component) {
            case 'processes':
                return (
                    <ProductionProcessesList
                        data={production.processes}
                        production={production}
                    />
                );

            case 'routes':
                return (
                    <ProductionRoutesList
                        data={production.routeSuggestions}
                        production={production}
                    />
                );

            // Kolejne komponenty:
            // case 'task':
            // case 'bom':
            // case 'machines':
            // case 'files':

            default:
                return (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Panel w przygotowaniu: {component}
                        </Typography>
                    </Box>
                );
        }
    };

    // Panel boczny
    const renderSidePanel = (config, side) => {
        if (!config) return null;

        const title = PANEL_TITLES[config.component] ?? config.component;

        return (
            <Box
                sx={{
                    width: compact ? '100%' : config.width,
                    minWidth: compact ? 0 : config.minWidth,
                    maxWidth: compact ? '100%' : config.width,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    overflow: 'hidden',
                    borderRight: !compact && side === 'left' ? 1 : 0,
                    borderLeft: !compact && side === 'right' ? 1 : 0,
                    borderBottom: compact ? 1 : 0,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <Box
                    sx={{
                        px: 1,
                        py: 0.5,
                        minHeight: 35,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            flex: 1,
                            fontWeight: 700,
                            fontSize: 11.5,
                        }}
                    >
                        {title}
                    </Typography>

                    <Tooltip title="Zamknij panel">
                        <IconButton
                            size="small"
                            onClick={production.ui.closePanel}
                            sx={{ p: 0.4 }}
                        >
                            <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Divider />

                <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    {renderPanel(config.component)}
                </Box>
            </Box>
        );
    };

    // Widok główny — lista zadań
    const renderTaskList = () => (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                overflow: 'auto',
            }}
        >
            <ProductionTasksList
                data={production.tasks}
                production={production}
                rwd={rwd}
            />
        </Box>
    );

    // Widok zastępujący listę zadań (np. historyczne marszruty)
    if (layout.mode === 'replace') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    width: '100%',
                    minWidth: 0,
                    minHeight: 0,
                    overflow: 'hidden',
                }}
            >
                {renderPanel(layout.component)}
            </Box>
        );
    }

    // Standardowy layout: lewy panel | zadania | prawy panel
    return (
        <Box
            sx={{
                display: 'flex',
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                overflow: 'hidden',
                flexDirection: compact ? 'column' : 'row',
            }}
        >
            {renderSidePanel(left, 'left')}

            {renderTaskList()}

            {renderSidePanel(right, 'right')}
        </Box>
    );
};

export default ProductionTasksLayoutManager;
