import React from "react";

import { useAuth } from '../../context/AuthContext';
import { useRwd } from "../../context/RwdContext";

import EmployeeWorkReport from "../../pages/employees/EmployeeWorkReport";

const UserWorkReport = () => {
    const { user } = useAuth();
    const rwd = useRwd();

    return <EmployeeWorkReport id={user?.employee?.id} rwd={rwd} heightSpan={180}/>
}

export default UserWorkReport;