import React, {
    useCallback,
    useRef,
    useState,
} from 'react';

import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import http from '../../http';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useRwd } from '../../context/RwdContext';

import PowerTable from '../../components/powerTable/powerTable';

import {
    applySyncResult,
    createSyncState,
    getNextDateRange,
    getToday,
    isProjectComplete,
} from './jiraSynqRunner';

const projectsToSync = [
    'KON',
    'HIM',
    'CR',
    'ZP',
    'MRK',
];

const LOCAL_STORAGE_KEY = 'jiraSynq';

const SynqWithJira = () => {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 1);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    });
    const [intervalDays, setIntervalDays] = useState(7);
    const [loading, setLoading] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);

    const stopRequestedRef = useRef(false);
    const rwd = useRwd();
    const tableHeight = rwd.height - 180;

    const [syncState, setSyncState] = useLocalStorage(
        LOCAL_STORAGE_KEY,
        createSyncState(projectsToSync)
    );

    const updateProjectState = useCallback(
        (projectKey, updater) => {
            setSyncState((currentState) => {
                const state = createSyncState(
                    projectsToSync,
                    currentState
                );

                return state.map((project) => {
                    if (project.projectKey !== projectKey) {
                        return project;
                    }

                    if (typeof updater === 'function') {
                        return updater(project);
                    }

                    return {
                        ...project,
                        ...updater,
                    };
                });
            });
        },
        [setSyncState]
    );

    const syncRange = async (
        projectKey,
        dateFrom,
        dateTo
    ) => {
        setCurrentJob({
            projectKey,
            dateFrom,
            dateTo,
        });

        const response = await http.get(
            '/jira/getByProjectDates.php',
            {
                params: {
                    project: projectKey,
                    dateFrom,
                    dateTo,
                },
            }
        );

        if (!response?.result) {
            throw new Error(
                'Invalid Jira sync response.'
            );
        }

        return {
            ...response.result,
            duration: response.duration ?? null,
        };
    };

    const syncProject = async (
        projectKey,
        initialProjectState
    ) => {
        let projectState = initialProjectState;

        const today = getToday();

        while (
            !stopRequestedRef.current
            && !isProjectComplete(
                projectState,
                today
            )
        ) {
            const range = getNextDateRange({
                startDate,
                lastDateTo: projectState.lastDateTo,
                intervalDays,
                today,
            });

            if (!range) {
                break;
            }

            updateProjectState(
                projectKey,
                {
                    status: 'running',
                    lastError: null,
                }
            );

            try {
                const result = await syncRange(
                    projectKey,
                    range.dateFrom,
                    range.dateTo
                );

                projectState = applySyncResult(
                    projectState,
                    result
                );

                updateProjectState(
                    projectKey,
                    projectState
                );
            } catch (error) {
                const message =
                    error?.response?.data?.error
                    ?? error?.response?.data?.message
                    ?? error?.message
                    ?? 'Unknown Jira sync error';

                projectState = {
                    ...projectState,
                    status: 'error',
                    lastError: message,
                    updatedAt: new Date().toISOString(),
                };

                updateProjectState(
                    projectKey,
                    projectState
                );

                break;
            }
        }

        if (
            !stopRequestedRef.current
            && isProjectComplete(
                projectState,
                today
            )
        ) {
            updateProjectState(
                projectKey,
                {
                    status: 'complete',
                    updatedAt: new Date().toISOString(),
                }
            );
        }
    };

    const handleStart = async () => {
        if (loading) {
            return;
        }

        stopRequestedRef.current = false;
        setLoading(true);

        try {
            const state = createSyncState(
                projectsToSync,
                syncState
            );

            setSyncState(state);

            for (const projectKey of projectsToSync) {
                if (stopRequestedRef.current) {
                    break;
                }

                const projectState = state.find(
                    (item) =>
                        item.projectKey === projectKey
                );

                if (!projectState) {
                    continue;
                }

                if (
                    isProjectComplete(
                        projectState
                    )
                ) {
                    continue;
                }

                await syncProject(
                    projectKey,
                    projectState
                );
            }
        } finally {
            setLoading(false);
            setCurrentJob(null);
        }
    };

    const handleStop = () => {
        stopRequestedRef.current = true;
    };

    const handleReset = () => {
        if (loading) {
            return;
        }

        setSyncState(
            createSyncState(projectsToSync)
        );

        setCurrentJob(null);
    };

    const rows = createSyncState(
        projectsToSync,
        syncState
    ).map((project) => ({
        project_key: project.projectKey,

        status: project.status,

        last_date_to:
            project.lastDateTo ?? '-',

        requests:
            project.requests ?? 0,

        found:
            project.totals?.found ?? 0,

        existing:
            project.totals?.existing ?? 0,

        created:
            project.totals?.created ?? 0,

        failed:
            project.totals?.failed ?? 0,

        links_updated:
            project.totals?.linksUpdated ?? 0,

        links_failed:
            project.totals?.linksFailed ?? 0,

        error:
            project.lastError ?? '',
    }));

    return (
        <Box>
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    flexWrap="wrap"
                >
                    <TextField
                        label="Start date"
                        type="date"
                        size="small"
                        value={startDate}
                        disabled={loading}
                        onChange={(event) => {
                            setStartDate(
                                event.target.value
                            );
                        }}
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                    />

                    <TextField
                        label="Interval"
                        type="number"
                        size="small"
                        value={intervalDays}
                        disabled={loading}
                        onChange={(event) => {
                            const value = Number(
                                event.target.value
                            );

                            setIntervalDays(
                                Math.max(
                                    1,
                                    Number.isNaN(value)
                                        ? 1
                                        : value
                                )
                            );
                        }}
                        slotProps={{
                            htmlInput: {
                                min: 1,
                                max: 31,
                            },
                        }}
                        sx={{
                            width: 120,
                        }}
                    />

                    <Typography variant="body2">
                        dni
                    </Typography>

                    <Divider
                        orientation="vertical"
                        flexItem
                    />

                    <Button
                        variant="contained"
                        onClick={handleStart}
                        disabled={loading}
                    >
                        Start sync
                    </Button>

                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleStop}
                        disabled={!loading}
                    >
                        Stop
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        Reset
                    </Button>

                    {loading && (
                        <>
                            <CircularProgress
                                size={22}
                            />

                            <Typography variant="body2">
                                Synchronizacja...
                            </Typography>
                        </>
                    )}
                </Stack>

                {currentJob && (
                    <Box
                        sx={{
                            mt: 2,
                        }}
                    >
                        <Typography variant="body2">
                            Aktualnie synchronizuję:{' '}
                            <strong>
                                {currentJob.projectKey}
                            </strong>
                            {' '}
                            {currentJob.dateFrom}
                            {' → '}
                            {currentJob.dateTo}
                        </Typography>
                    </Box>
                )}
            </Paper>

            <PowerTable
                entityName="Jira Sync"
                data={rows}
                height={tableHeight}
            />
        </Box>
    );
};

export default SynqWithJira;