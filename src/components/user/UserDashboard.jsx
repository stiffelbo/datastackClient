import React from "react";

import LSUsage from "./LSUsage"

import { Box } from "@mui/material";

import { useRwd } from "../../context/RwdContext";

const UserDashboard = () => {
    const rwd = useRwd();
    const height = rwd.height - 78; // Odejmij wysokość paska nawigacji

    return (<Box sx={{height}}>
        <LSUsage />
    </Box>);
}

export default UserDashboard;