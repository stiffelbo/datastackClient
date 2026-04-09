import React, { useState } from "react";
import { Alert, Grid, Box } from "@mui/material";

//Hooks
import useEntity from "../../hooks/useEntity";
import useTasks from "./hooks/useTasks";
import useBrigades from "./hooks/useBrigades";

//DTO
import { brigadeEmployeesDto } from "./dto/brigadesDto";
import { processesDto } from "./dto/processesDto";

import JiraTaskLookup from "./JiraTaskLookup";
import SelectedTasksList from "./SelectedTasksList";
import ProcessForm from "./ProcessForm";
import TimeForm from "./TimeForm";
import BrigadeEmployeesForm from "./BrigadeEmployeesForm";
import useProcesses from "./hooks/useProcesses";


const LogForm = ({ user }) => {
    if (!user) return <Alert severity="error">Brak danych użytkownika. Zaloguj się ponownie.</Alert>;

    const [time, setTime] = useState({});

    //Hooks
    const brigade = useBrigades({ initialTime: time, employees: brigadeEmployeesDto(user.brigades) });
    const processes = useProcesses({
        processes: processesDto(user.processes),
        initialMachineTime: time,
        onChange: (payload) => {
            console.log(payload);
        }
    });

    //here we need to collect data from above hooks

    //- time sum for brigade employees
    //- time sum for machines
    //- materials quantity

    const tasks = useTasks({});

    return <Box mt={3} sx={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item size={6}>
                <JiraTaskLookup onAdd={tasks.actions.addTask} sx={{ mb: 2 }} />
                <SelectedTasksList
                    tasks={tasks.state.tasks}
                    onRemove={tasks.actions.removeTask}
                    onQuantityChange={(task, value) =>
                        tasks.actions.setTaskQuantity(task, value)
                    }
                />
            </Grid>
            <Grid item size={6}>
                <TimeForm onChange={setTime} value={time} />
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
    </Box>;
}

export default LogForm;