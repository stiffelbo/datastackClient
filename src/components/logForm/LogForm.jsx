import React from "react";

//Hooks
import useEntity from "../../hooks/useEntity";
import useLogForm from "../../hooks/useLogForm";
import { Alert } from "@mui/material";

import UsersTechStack from "../user/UsersTechStack";

const LogForm = ({user}) => {
    if(!user) return <Alert severity="error">Brak danych użytkownika. Zaloguj się ponownie.</Alert>;

    const logForm = useLogForm({user});

    return <div>Log Form</div>;
}

export default LogForm;