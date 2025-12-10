import { Box } from "@mui/material";
import React from "react";

const defaultRwd = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Mui

const PageAccessViewFields = ({ id = null, data = {}, rwd = defaultRwd }) => {

    return <Box>
        {id}
    </Box>
}

export default PageAccessViewFields;