import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Box,
    Grid,
} from "@mui/material";

import Processes from "./Processes";
import Dag from "./Dag";

import { useRwd } from "../../context/RwdContext";

import http from "../../http";

import {
    createTaskFromProcess,
    deleteTaskFromProcess,
    getTasksByIssue,
} from "./actions/taskActions";

import {
    getRelationsByIssue,
} from "./actions/relationActions";

import {
    getLayoutsByIssue,
} from "./actions/layoutActions";

/*
 * Na potrzeby sandboxa używamy stałego issue.
 * Później pobierzesz je z URL, kontekstu albo propsów.
 */
const SANDBOX_ISSUE_ID = 1;

const Production = () => {
    const { height } = useRwd();

    const [loading, setLoading] = useState(false);
    const [processes, setProcesses] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [relations, setRelations] = useState([]);
    const [layouts, setLayouts] = useState([]);

    const fetchProcesses = async () => {
        const url = '/processes/get.php';
        setLoading(true);
        const res = await http.get(url);
        setProcesses(res.data);
        setLoading(false);
    }

    const loadData = useCallback(() => {
        setTasks(
            getTasksByIssue(SANDBOX_ISSUE_ID)
        );

        setRelations(
            getRelationsByIssue(SANDBOX_ISSUE_ID)
        );

        setLayouts(
            getLayoutsByIssue(SANDBOX_ISSUE_ID)
        );
    }, []);

    useEffect(()=>{
        fetchProcesses();
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddProcess = useCallback(
        process => {
            createTaskFromProcess({
                issueId: SANDBOX_ISSUE_ID,
                process,
            });

            loadData();
        },
        [loadData]
    );

    const handleDeleteTask = useCallback(
        taskId => {
            try {
                deleteTaskFromProcess({
                    id: taskId,
                });

                loadData();
            } catch (error) {
                window.alert(error.message);
            }
        },
        [loadData]
    );

    return (
        <Box
            sx={{
                height: height - 80,
                minHeight: 500,
                overflow: "hidden",
                bgcolor: "background.default",
            }}
        >
            <Grid
                container
                sx={{ height: "100%" }}
            >
                <Grid
                    size={{
                        xs: 12,
                        sm: 4,
                        md: 3,
                    }}
                    sx={{
                        height: "100%",
                        minWidth: 0,
                    }}
                >
                    <Processes
                        onAddProcess={handleAddProcess}
                        processes={processes}
                        loading={loading}
                    />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 8,
                        md: 9,
                    }}
                    sx={{
                        height: "100%",
                        minWidth: 0,
                    }}
                >
                    <Dag
                        issueId={SANDBOX_ISSUE_ID}
                        tasks={tasks}
                        relations={relations}
                        layouts={layouts}
                        onDataChange={loadData}
                        onDeleteTask={handleDeleteTask}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Production;