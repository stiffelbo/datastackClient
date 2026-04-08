import React from "react";
//context
import { useAuth } from '../../context/AuthContext';

//components
import LogForm from "../../components/logForm/LogForm";



const UserLogForm = () => {
    const { user } = useAuth();
    return <LogForm user={user} />
}

export default UserLogForm;