import React, {useState} from "react";
import { Alert, Grid, Box } from "@mui/material";

//Hooks
import useEntity from "../../hooks/useEntity";
import useLogForm from "./hooks/useLogForm";
import useBrigades from "./hooks/useBrigades";

//DTO
import {brigadeEmployeesDto} from "./dto/brigadesDto";
import { processesDto } from "./dto/processesDto";

import JiraTaskLookup from "./JiraTaskLookup";
import SelectedTasksList from "./SelectedTasksList";
import ProcessForm from "./ProcessForm";
import TimeForm from "./TimeForm";
import BrigadeEmployeesForm from "./BrigadeEmployeesForm";


const LogForm = ({user}) => {
    if(!user) return <Alert severity="error">Brak danych użytkownika. Zaloguj się ponownie.</Alert>;

    const [time, setTime] = useState({});

    //Hook products
    const tasks = useLogForm({ onSubmit: null });
    const brigade = useBrigades({ initialTime: time, employees: brigadeEmployeesDto(user.brigades) });

    return <Box mt={3} sx={{width: '100%'}}>
        <Grid container spacing={2} alignItems="center" sx={{mb: 3}}>
            <Grid item size={6}>
                <JiraTaskLookup onAdd={tasks.actions.addTask} sx={{mb: 2}}/>
                <SelectedTasksList tasks={tasks.state.tasks} onRemove={tasks.actions.removeTask}/>
            </Grid>
            <Grid item size={6}>
                <TimeForm onChange={setTime} value={time}/>
                <ProcessForm user={user}/>
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