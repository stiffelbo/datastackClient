import React, {
    useCallback,
    useEffect,
    useMemo,
} from "react";

import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    addEdge,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { Box } from "@mui/material";

import {
    createRelation,
    deleteRelation,
} from "./actions/relationActions";

import {
    upsertTaskLayout,
} from "./actions/layoutActions";

const buildNodes = ({
    tasks,
    layouts,
}) => {
    const layoutByTaskId = new Map(
        layouts.map(layout => [
            layout.task_id,
            layout,
        ])
    );

    return tasks.map((task, index) => {
        const layout = layoutByTaskId.get(task.id);

        return {
            id: String(task.id),

            position: layout
                ? {
                    x: layout.position_x,
                    y: layout.position_y,
                }
                : {
                    x: 100 + (index % 3) * 260,
                    y: 80 + Math.floor(index / 3) * 140,
                },

            data: {
                label: task.name,
                task,
            },

            type: "default",
        };
    });
};

const buildEdges = relations => {
    return relations.map(relation => ({
        id: String(relation.id),

        source: String(relation.from_task_id),
        target: String(relation.to_task_id),

        type: "smoothstep",

        data: {
            relation,
        },
    }));
};

const Dag = ({
    issueId,
    tasks,
    relations,
    layouts,
    onDataChange,
    onDeleteTask
}) => {
    const initialNodes = useMemo(
        () => buildNodes({ tasks, layouts }),
        [tasks, layouts]
    );

    const initialEdges = useMemo(
        () => buildEdges(relations),
        [relations]
    );

    const [
        nodes,
        setNodes,
        onNodesChange,
    ] = useNodesState(initialNodes);

    const [
        edges,
        setEdges,
        onEdgesChange,
    ] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
    }, [initialNodes, setNodes]);

    useEffect(() => {
        setEdges(initialEdges);
    }, [initialEdges, setEdges]);

    const onConnect = useCallback(
        connection => {
            try {
                const relation = createRelation({
                    issueId,
                    fromTaskId: Number(connection.source),
                    toTaskId: Number(connection.target),
                    relationType: "flow",
                });

                setEdges(currentEdges =>
                    addEdge(
                        {
                            ...connection,
                            id: String(relation.id),
                            type: "smoothstep",
                            data: {
                                relation,
                            },
                        },
                        currentEdges
                    )
                );

                onDataChange();
            } catch (error) {
                window.alert(error.message);
            }
        },
        [
            issueId,
            onDataChange,
            setEdges,
        ]
    );

    const onNodeDragStop = useCallback(
        (_, node) => {
            upsertTaskLayout({
                issueId,
                taskId: Number(node.id),
                position: node.position,
            });

            onDataChange();
        },
        [
            issueId,
            onDataChange,
        ]
    );

    const onNodesDelete = useCallback(
        deletedNodes => {
            deletedNodes.forEach(node => {
                onDeleteTask(Number(node.id));
            });
        },
        [onDeleteTask]
    );

    const onEdgesDelete = useCallback(
        deletedEdges => {
            deletedEdges.forEach(edge => {
                deleteRelation(Number(edge.id));
            });

            onDataChange();
        },
        [onDataChange]
    );

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                bgcolor: "grey.100",
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                fitView
                deleteKeyCode={["Backspace", "Delete"]}
                defaultEdgeOptions={{
                    type: "smoothstep",
                }}
            >
                <Background />
                <MiniMap />
                <Controls />
            </ReactFlow>
        </Box>
    );
};

export default Dag;