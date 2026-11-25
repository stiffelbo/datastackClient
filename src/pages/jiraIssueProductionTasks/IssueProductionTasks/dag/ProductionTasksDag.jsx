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
import { getDagColor } from "./dagColors";
import ProductionTaskNode from "./ProductionTaskNode";

const ProductionTasksDag = ({
    production,
    edgesOnTop = true,
    colorBy = 'process_id',
}) => {
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
        columnGap: 80,
        rowGap: 90,
        direction: 'TB',
    });

    const isHorizontal = layout.direction === 'LR';

    // 3. Adapter węzłów React Flow
    const nodes = layout.nodes.map(node => {
        const { task, position, width, height } = node;

        const selected = String(ui.selectedTaskId) === String(node.id);
        const color = getDagColor(task[colorBy]);

        return {
            id: String(node.id),
            type: 'productionTask',
            position,
            selected,
            zIndex: selected ? 100 : 1,

            data: {
                task,
                process: getProcess(task.process_id),
                actions,
                ui,
                loading,
                color,
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
    // 4. Adapter relacji React Flow
    const edges = layout.edges.map(edge => {
        const sourceTask = dag.nodesMap[edge.source]?.task;

        const color = getDagColor(sourceTask?.[colorBy]);

        const isHighlighted =
            String(ui.selectedTaskId) === String(edge.source)
            || String(ui.selectedTaskId) === String(edge.target);

        return {
            id: edge.id,
            source: String(edge.source),
            target: String(edge.target),

            type: 'smoothstep',

            zIndex: edgesOnTop
                ? isHighlighted ? 20 : 10
                : 0,

            interactionWidth: 24,

            pathOptions: {
                borderRadius: 12,
                offset: 25,
            },

            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 18,
                height: 18,
                color,
            },

            style: {
                stroke: color,
                strokeWidth: isHighlighted ? 4 : 2.5,
                strokeOpacity: isHighlighted ? 1 : 0.8,
                cursor: loading ? 'default' : 'pointer',
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

    const isValidConnection = ({ source, target }) => {
        if (loading || !source || !target || source === target) {
            return false;
        }

        const exists = edges.some(edge => {
            return edge.source === source && edge.target === target;
        });

        if (exists) {
            return false;
        }

        // Sprawdzenie, czy target prowadzi już do source.
        const visited = new Set();
        const queue = [target];

        while (queue.length > 0) {
            const id = queue.pop();

            if (id === source) {
                return false;
            }

            if (visited.has(id)) {
                continue;
            }

            visited.add(id);

            edges.forEach(edge => {
                if (edge.source === id) {
                    queue.push(edge.target);
                }
            });
        }

        return true;
    };


    const handleConnect = async (connection) => {
        if (!isValidConnection(connection)) {
            return;
        }

        await actions.connect({
            sourceId: Number(connection.source),
            targetId: Number(connection.target),
        });
    };

    const handleEdgeDoubleClick = async (event, edge) => {
        event.stopPropagation();

        if (loading) {
            return;
        }

        await actions.disconnect({
            sourceId: Number(edge.source),
            targetId: Number(edge.target),
        });
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

                onConnect={handleConnect}
                onEdgeDoubleClick={handleEdgeDoubleClick}
                isValidConnection={isValidConnection}

                nodesDraggable={false}
                nodesConnectable={!loading}
                elementsSelectable={true}
                edgesReconnectable={false}
                elevateNodesOnSelect={false}
                elevateEdgesOnSelect={false}

                connectionLineStyle={{
                    stroke: '#1976d2',
                    strokeWidth: 3,
                }}

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
            </ReactFlow>
        </Box>
    );
};

export default ProductionTasksDag;