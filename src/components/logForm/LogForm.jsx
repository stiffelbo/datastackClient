import React, {useState} from "react";
import { Alert, Grid, Box } from "@mui/material";

//Hooks
import useEntity from "../../hooks/useEntity";
import useLogForm from "./hooks/useLogForm";

import JiraTaskLookup from "./JiraTaskLookup";
import SelectedTasksList from "./SelectedTasksList";
import ProcessForm from "./ProcessForm";
import TimeForm from "./TimeForm";
import BrigadeEmployeesForm from "./BrigadeEmployeesForm";


const LogForm = ({user}) => {
    if(!user) return <Alert severity="error">Brak danych użytkownika. Zaloguj się ponownie.</Alert>;

    const [time, setTime] = useState({});

    const { state, actions, getters, computed } = useLogForm({ onSubmit: null });

    return <Box mt={3} sx={{width: '100%'}}>
        <Grid container spacing={2} alignItems="center" sx={{mb: 3}}>
            <Grid item size={6}>
                <JiraTaskLookup onAdd={actions.addTask} sx={{mb: 2}}/>
                <SelectedTasksList tasks={state.tasks} onRemove={actions.removeTask}/>
            </Grid>
            <Grid item size={6}>
                <TimeForm onChange={setTime} value={time}/>
                <ProcessForm user={user}/>
                <BrigadeEmployeesForm user={user} onChange={null} initialTime={time}/>
            </Grid>
        </Grid>
    </Box>;
}

export default LogForm;