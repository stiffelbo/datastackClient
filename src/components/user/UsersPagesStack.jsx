import React from "react";

import { useAuth } from '../../context/AuthContext';
import { useRwd } from "../../context/RwdContext";

import PowerTable from "../powerTable/powerTable";

const UsersPagesStack = () => {
    const { user } = useAuth();
    const rwd = useRwd();
    const pages = user?.pages;

    return <PowerTable
        entityName="UsersPagesStack" 
        data={pages}
        height={rwd.height - 176}    
    />
}

export default UsersPagesStack;