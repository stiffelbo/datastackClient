import React, { useState, useEffect } from "react";
import { Alert, Grid, Box, Typography, LinearProgress, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useRwd } from "../../context/RwdContext";
import { useAuth } from "../../context/AuthContext";

//Hooks
import useTasks from "./hooks/useTasks";
import useBrigades from "./hooks/useBrigades";
import useProcesses from "./hooks/useProcesses";
import useJiraIssueUserLogs from "./hooks/useJiraIssueUserLogs";

//DTO
import { brigadeEmployeesDto } from "./dto/brigadesDto";
import { processesDto, buildMachineIndex, hasMachines } from "./dto/processesDto";
import { logDraftVo } from "./dto/logDraftVo";

//Utils
import { defaultTime } from "./utils";

import Manual from "../Manual";

import JiraTaskLookup from "./JiraTaskLookup";
import SelectedTasksList from "./SelectedTasksList";
import ProcessForm from "./ProcessForm";
import TimeForm from "./TimeForm";
import BrigadeEmployeesForm from "./BrigadeEmployeesForm";

import PowerTable from "../powerTable/powerTable";
import RenderLogErrors from "./RenderLogErrors";
import SubmitLogForm from "./SubmitLogForm";
import MachineIndexedForm from "./MachineIndexedForm";


const LogForm = ({ initialTasks = [] }) => {

    const auth = useAuth();
    const { user } = auth;

    useEffect(() => {
        auth.refreshUser();
    }, []);

    if (!user) return <Alert severity="error">Brak danych użytkownika. Zaloguj się ponownie.</Alert>;
    if (!user.brigades.length) return <Alert severity="warning">Brak danych o pracownikach powiązanych z użytkownikiem</Alert>
    if (!user.processes.length) return <Alert severity="warning">Brak danych o procesach do raportownaia</Alert>

    const [time, setTime] = useState(defaultTime());
    const [showControlData, setShowControlData] = useState(false);
    const [reportMode, setReportMode] = useState('process'); // 'process' | 'machine'

    //Hooks
    const { height } = useRwd();

    const brigade = useBrigades({ initialTime: time, employees: brigadeEmployeesDto(user.brigades) });

    const processesAfterDTO = processesDto(user.processes);
    const canUseMachineMode = hasMachines(processesAfterDTO);

    const machineIndexedProcessesDTO =
        canUseMachineMode
            ? buildMachineIndex(processesAfterDTO)
            : [];

    useEffect(() => {
        if (!canUseMachineMode && reportMode === "machine") {
            setReportMode("process");
        }
    }, [canUseMachineMode, reportMode]);

    const processes = useProcesses({
        processes: processesAfterDTO,
        onChange: null,
        employeeTimeMap: brigade.computed.employeeTimeMap,
        mode: reportMode
    });

    let requiresTasks = true;
    let requiresQuantity = true;
    let requiresRemarks = false;
    let isProduction = true;

    if (processes.data.selectedProcess) {
        requiresTasks = !Boolean(processes.data.selectedProcess.is_general);
        requiresQuantity = processes.data.selectedProcess.requires_quantity;
        requiresRemarks = processes.data.selectedProcess.requires_remarks;
        isProduction = processes.data.selectedProcess.is_production;
    }

    const tasks = useTasks({ requiresQuantity, requiresRemarks, requiresTasks, initialValues: { tasks: initialTasks } });

    const draft = logDraftVo({
        tasksState: tasks.state.tasks,
        brigadesState: brigade.state.brigades,
        processesState: {
            selectedProcess: processes.data.selectedProcess,
            selectedMachine: processes.data.selectedMachine,
            machineTime: processes.state.machineTime,
            materialsReport: processes.state.materialsReport,
            materials: processes.data.materials,
            isRework: processes.state.isRework,
        },
    });

    const log = useJiraIssueUserLogs(auth);

    const renderModeToggle = () => {
        if (!canUseMachineMode) return;
        return (<ToggleButtonGroup
            value={reportMode}
            exclusive
            onChange={(e, value) => value && setReportMode(value)}
            size="small"
            sx={{ my: 1 }}
        >
            <ToggleButton value="process">Tryb proces</ToggleButton>
            <ToggleButton value="machine">Tryb maszyna</ToggleButton>
        </ToggleButtonGroup>);
    }

    const renderControlTables = (show = true) => {
        if (!show) return;
        return (
            <Grid container>
                <Grid item size={12}>
                    <Box mt={2} sx={{ height: '400px', overflowY: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Czasy Pracownika
                        </Typography>
                        <PowerTable
                            entityName="LogPreview_Operation"
                            data={draft.logs.operationLogs}
                            height={350}
                            rowHeight={60}
                        />
                    </Box>
                </Grid>
                <Grid item size={12}>
                    <Box mt={2} sx={{ height: '400px', overflowY: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Ilosci Produkcyjne
                        </Typography>
                        <PowerTable
                            entityName="LogPreview_OutputsLogs"
                            data={draft.logs.outputLogs}
                            height={350}
                            rowHeight={60}
                        />
                    </Box>
                </Grid>
                <Grid item size={12}>
                    <Box mt={2} sx={{ height: '400px', overflowY: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Czasy Maszyn
                        </Typography>
                        <PowerTable
                            entityName="LogPreview_MachineLogs"
                            data={draft.logs.machineLogs}
                            height={350}
                            rowHeight={60}
                        />
                    </Box>
                </Grid>
                <Grid item size={12}>
                    <Box mt={2} sx={{ height: '400px', overflowY: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Materiały
                        </Typography>
                        <PowerTable
                            entityName="LogPreview_MaterialsLogs"
                            data={draft.logs.materialLogs}
                            height={350}
                            rowHeight={60}
                        />
                    </Box>
                </Grid>
            </Grid>
        )
    }

    const renderForm = () => {
        // 'process' | 'machine'
        if (reportMode === 'process') {
            return <ProcessForm processes={processes} disabled={log.loading} />
        }
        if (reportMode === 'machine') {
            return <MachineIndexedForm processes={processes} settings={machineIndexedProcessesDTO} disabled={log.loading} />
        }
    }

    return <Box mt={3} sx={{ width: '100%', height: height - 112, overflowY: 'auto', pr: 2 }}>

        <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
            <Grid item size={6}>
                <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item sx={{ flexShrink: 0 }}>
                        <Manual
                            name="LogFormDoc"
                            iconOnly
                        />
                    </Grid>

                    <Grid item zeroMinWidth sx={{flexGrow: 1}}>
                        {initialTasks.length === 0 && (
                            <JiraTaskLookup
                                onAdd={tasks.actions.addTask}
                                sx={{ width: "100%" }}
                            />
                        )}
                    </Grid>
                </Grid>

                <SelectedTasksList
                    tasks={tasks}
                    requiresTasks={requiresTasks}
                    sx={{ mb: 2 }}
                    showDelete={initialTasks.length === 0}
                    settings={processes.settings.tasks}
                />
                {renderModeToggle()}
                {renderForm()}
                <TimeForm onChange={setTime} value={time} sx={{ my: 2 }} />

                <RenderLogErrors errors={draft.meta.errors} sx={{ my: 2, width: '100%', maxWidth: '100%' }} />

            </Grid>

            <Grid item size={6}>
                <BrigadeEmployeesForm
                    employees={brigade.state.brigades}
                    selectedIds={brigade.computed.selectedIds}
                    employeeTimes={brigade.computed.employeeTimeMapAll ?? brigade.computed.employeeTimeMap}
                    initialTime={time}
                    onToggle={brigade.actions.toggleSelected}
                    onSelectAll={brigade.actions.selectAll}
                    onClear={brigade.actions.clearAll}
                    onEmployeeTimeChange={brigade.actions.setEmployeeTime}
                />
                <Button
                    onClick={() => setShowControlData(!showControlData)}
                    color={showControlData ? 'warning' : 'primary'}
                    size="small"
                    sx={{ width: '100%' }}
                    variant="outlined"
                >
                    {showControlData ? 'Ukryj dane kontrolne' : 'Pokaż dane kontrolne'}
                </Button>
            </Grid>
            <Grid item size={12}>
                <SubmitLogForm
                    dataErrors={draft.meta.errors}
                    logError={log.error}
                    result={log.result}
                    loading={log.loading}
                    onSave={() => log.save(draft.logs)}
                    onClear={() => log.clear()}
                />
            </Grid>
        </Grid>

        {renderControlTables(showControlData)}
    </Box>;
}

export default LogForm;