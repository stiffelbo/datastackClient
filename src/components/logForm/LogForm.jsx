import React, { useState } from "react";
import { Alert, Grid, Box, Typography, LinearProgress, Button } from "@mui/material";
import { useRwd } from "../../context/RwdContext";
import {useAuth} from "../../context/AuthContext";

//Hooks
import useTasks from "./hooks/useTasks";
import useBrigades from "./hooks/useBrigades";
import useProcesses from "./hooks/useProcesses";
import useJiraIssueUserLogs from "./hooks/useJiraIssueUserLogs";

//DTO
import { brigadeEmployeesDto } from "./dto/brigadesDto";
import { processesDto } from "./dto/processesDto";
import { logDraftVo } from "./dto/logDraftVo";

//Utils
import { defaultTime } from "./utils";

import JiraTaskLookup from "./JiraTaskLookup";
import SelectedTasksList from "./SelectedTasksList";
import ProcessForm from "./ProcessForm";
import TimeForm from "./TimeForm";
import BrigadeEmployeesForm from "./BrigadeEmployeesForm";

import PowerTable from "../powerTable/powerTable";
import RenderLogErrors from "./RenderLogErrors";

const LogForm = ({initialTasks = []}) => {

    const { user } = useAuth();

    if (!user) return <Alert severity="error">Brak danych użytkownika. Zaloguj się ponownie.</Alert>;
    if (!user.brigades.length) return <Alert severity="warning">Brak danych o pracownikach powiązanych z użytkownikiem</Alert>
    if (!user.processes.length) return <Alert severity="warning">Brak danych o procesach do raportownaia</Alert>

    const [time, setTime] = useState(defaultTime());
    const [showControlData, setShowControlData] = useState(false);
    //Hooks
    const { height } = useRwd();

    const brigade = useBrigades({ initialTime: time, employees: brigadeEmployeesDto(user.brigades) });

    const processes = useProcesses({
        processes: processesDto(user.processes),
        initialMachineTime: time,
        setInitialMachineTime: setTime,
        onChange: null,
        employeeTimeMap: brigade.computed.employeeTimeMap,
    });

    let requiresTasks = true;
    let requiresQuantity = true;
    let requiresRemarks = false;

    if (processes.data.selectedProcess) {
        requiresTasks = !Boolean(processes.data.selectedProcess.is_general);
        requiresQuantity = processes.data.selectedProcess.requires_quantity;
        requiresRemarks = processes.data.selectedProcess.requires_remarks;
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
        structureId: null,
        periodId: null,
    });

    const log = useJiraIssueUserLogs();

    const renderSubmit = ({ dataErrors = null, logError = null, loading = false, onSave = null, onClear = null, sx = { width: '100%' } }) => {

        if (!dataErrors.length && !logError) {
            if (loading) {
                return <LinearProgress />
            } else {
                return <Button
                    color='primary'
                    onClick={onSave}
                    size="small"
                    sx={{ ...sx }}
                >
                    Wprowadź dane
                </Button>
            }
        }

        if (logError) {
            return <Button
                color='error'
                onClick={onClear}
                size="small"
                sx={{ ...sx }}
            >
                Błąd podczas zapisu danych
            </Button>
        }

    }

    const renderControlTables = (show = true) => {
        if(!show) return;
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

    return <Box mt={3} sx={{ width: '100%', height: height - 112, overflowY: 'auto', pr: 2 }}>
        <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
            <Grid item size={6}>
                {initialTasks.length === 0 && (
                    <JiraTaskLookup onAdd={tasks.actions.addTask} sx={{ mb: 2 }} />
                )}
                <SelectedTasksList
                    tasks={tasks}
                    requiresTasks={requiresTasks}
                    sx={{ mb: 2 }}
                    showDelete={initialTasks.length === 0}
                />
                <TimeForm onChange={setTime} value={time} sx={{ my: 2 }} />
                <ProcessForm processes={processes} />

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
                    onClick={()=>setShowControlData(!showControlData)}
                    color={showControlData ? 'warning' : 'primary'}
                    size="small"
                    sx={{width: '100%'}}
                    variant="outlined"
                >
                    {showControlData ? 'Ukryj dane kontrolne' : 'Pokaż dane kontrolne'}
                </Button>
            </Grid>
            <Grid item size={12}>
                {renderSubmit({ dataErrors: draft.meta.errors, logError: log.error, loading: log.loading, onSave: () => log.save(draft.logs), onClear: () => log.clear() })}
            </Grid>
        </Grid>

        {renderControlTables(showControlData)}
    </Box>;
}

export default LogForm;