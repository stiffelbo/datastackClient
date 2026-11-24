import React from "react";

import {
    Box,
    Stack,
    Typography,
    Alert,
    LinearProgress,
} from "@mui/material";

import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    Position,
    MarkerType,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import dagDto from "./dagDto";
import dagLayout from "./dagLayout";
import ProductionTaskNode from "./ProductionTaskNode";

const ProductionTasksDag = ({ production }) => {
    const {
        tasks = [],
        loading,
        actions,
        ui,
        getProcess,
    } = production;

    // 1. Topologia grafu
    const dag = dagDto({ tasks });

    const nodeTypes = {
        productionTask: ProductionTaskNode,
    };

    // 2. Geometria grafu
    const layout = dagLayout({
        dag,
        nodeWidth: 600,
        nodeHeight: 120,
        columnGap: 40,
        rowGap: 45,
        direction: 'TB',
    });

    const isHorizontal = layout.direction === 'LR';

    // 3. Adapter węzłów React Flow
    const nodes = layout.nodes.map(node => {
        const { task, position, width, height } = node;

        return {
            id: String(node.id),
            type: 'productionTask',
            position,

            selected: String(ui.selectedTaskId) === String(node.id),

            data: {
                task,
                process: getProcess(task.process_id),
                actions,
                ui,
                loading,
                direction: layout.direction,
                isRoot: node.isRoot,
                isLeaf: node.isLeaf,
                level: node.level,
            },

            style: {
                width,
                height,
            },
        };
    });

    // 4. Adapter relacji React Flow
    const edges = layout.edges.map(edge => {
        return {
            id: edge.id,
            source: String(edge.source),
            target: String(edge.target),

            type: 'smoothstep',

            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 16,
            },

            style: {
                strokeWidth: 1.5,
            },
        };
    });

    const initialLevels = 5;

    const initialFitNodes = layout.nodes
        .filter(node => {
            return node.level < initialLevels;
        })
        .map(node => {
            return { id: String(node.id) };
        });

    // 5. Interakcje
    const handleNodeClick = (_, node) => {
        ui.selectTask(Number(node.id));
    };

    const handlePaneClick = () => {
        ui.selectTask(null);
    };

    // 6. Walidacja grafu
    if (!dag.isValid) {
        return (
            <Box sx={{ p: 1, overflow: 'auto' }}>
                <Alert severity="error">
                    <Typography variant="subtitle2">
                        Nieprawidłowa struktura marszruty
                    </Typography>

                    {dag.errors.map((error, index) => {
                        return (
                            <Typography
                                key={index}
                                variant="caption"
                                display="block"
                            >
                                {error}
                            </Typography>
                        );
                    })}
                </Alert>
            </Box>
        );
    }

    // 7. Pusta marszruta
    if (dag.isEmpty) {
        return (
            <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ flex: 1, minHeight: 0 }}
            >
                <AccountTreeOutlinedIcon
                    sx={{
                        fontSize: 42,
                        color: 'text.disabled',
                    }}
                />

                <Typography variant="subtitle2" color="text.secondary">
                    {loading ? 'Pobieranie marszruty...' : 'Pusta marszruta'}
                </Typography>

                {!loading && (
                    <Typography variant="caption" color="text.disabled">
                        Dodaj proces, aby rozpocząć budowanie marszruty
                    </Typography>
                )}
            </Stack>
        );
    }

    // 8. Renderowanie grafu
    return (
        <Box
            sx={{
                flex: 1,
                width: '100%',
                minWidth: 0,
                minHeight: 0,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'background.default',
            }}
        >
            {loading && (
                <LinearProgress
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                    }}
                />
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}

                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}

                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                edgesReconnectable={false}

                deleteKeyCode={null}

                fitView
                fitViewOptions={{
                    nodes: initialFitNodes,
                    padding: 0.1,
                    maxZoom: 1,
                }}

                minZoom={0.1}
                maxZoom={2}

                proOptions={{
                    hideAttribution: true,
                }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                />

                <Controls showInteractive={false} />

                <MiniMap
                    pannable
                    zoomable
                    nodeStrokeWidth={2}
                />
            </ReactFlow>
        </Box>
    );
};

export default ProductionTasksDag;