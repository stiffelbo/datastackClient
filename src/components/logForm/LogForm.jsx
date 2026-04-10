import React, { useState } from "react";
import { Alert, Grid, Box, Typography } from "@mui/material";

//Hooks
import useEntity from "../../hooks/useEntity";
import useTasks from "./hooks/useTasks";
import useBrigades from "./hooks/useBrigades";

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
import useProcesses from "./hooks/useProcesses";

import PowerTable from "../powerTable/powerTable";
import { useRwd } from "../../context/RwdContext";

const LogForm = ({ user }) => {
    if (!user) return <Alert severity="error">Brak danych użytkownika. Zaloguj się ponownie.</Alert>;

    const [time, setTime] = useState(defaultTime());

    //Hooks
    const { height } = useRwd();

    const brigade = useBrigades({ initialTime: time, employees: brigadeEmployeesDto(user.brigades) });

    const processes = useProcesses({
        processes: processesDto(user.processes),
        initialMachineTime: time,
        onChange: null
    });

    let requiresQuantity = true;
    let requiresRemarks = false;

    if(processes.data.selectedProcess){
        requiresQuantity = processes.data.selectedProcess.requires_quantity;
        requiresRemarks = processes.data.selectedProcess.requires_remarks;
    }

    const tasks = useTasks({requiresQuantity, requiresRemarks});

    const draft = logDraftVo({
        tasksState: tasks.state.tasks,
        brigadesState: brigade.state.brigades,
        processesState: {
            selectedProcess: processes.data.selectedProcess,
            selectedMachine: processes.data.selectedMachine,
            machineTime: processes.state.machineTime,
            materialsReport: processes.state.materialsReport,
            materials: processes.data.materials,
        },
        structureId : null,
        periodId : null,
    });

    return <Box mt={3} sx={{ width: '100%', height: height - 112, overflowY: 'auto', pr: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item size={6}>
                <JiraTaskLookup onAdd={tasks.actions.addTask} sx={{ mb: 2 }} />
                <SelectedTasksList
                    tasks={tasks.state.tasks}
                    onRemove={tasks.actions.removeTask}
                    onQuantityChange={(task, value) =>
                        tasks.actions.setTaskQuantity(task, value)
                    }
                    onRemarksChange={(task, value) =>
                        tasks.actions.setTaskRemarks(task, value)
                    }
                />
            </Grid>
            <Grid item size={6}>
                {brigade.state.brigades.length !== 1 ? <TimeForm onChange={setTime} value={time} /> : null}
                <ProcessForm processForm={processes} />
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
            </Grid>
        </Grid>
        <Box mt={2} sx={{height: '400px', overflowY: 'auto'}}>
            <Typography variant="h6" gutterBottom>
                Czasy Pracownika
            </Typography>
            <PowerTable 
                entityName="LogPreview_Operation"
                data={draft.logs.operationLogs}
                height={350}
            />          
        </Box>
        <Box mt={2} sx={{height: '400px', overflowY: 'auto'}}>
            <Typography variant="h6" gutterBottom>
                Czasy Maszyn
            </Typography>
            <PowerTable 
                entityName="LogPreview_MachineLogs"
                data={draft.logs.machineLogs}
                height={350}
            />          
        </Box>
        <Box mt={2} sx={{height: '400px', overflowY: 'auto'}}>
            <Typography variant="h6" gutterBottom>
                Materiały
            </Typography>
            <PowerTable 
                entityName="LogPreview_MaterialsLogs"
                data={draft.logs.materialLogs}
                height={350}
            />          
        </Box>
        <Box mt={2} sx={{height: '400px', overflowY: 'auto'}}>
            <Typography variant="h6" gutterBottom>
                Ilosci Produkcyjne
            </Typography>
            <PowerTable 
                entityName="LogPreview_OutputsLogs"
                data={draft.logs.outputLogs}
                height={350}
            />          
        </Box>
    </Box>;
}

export default LogForm;