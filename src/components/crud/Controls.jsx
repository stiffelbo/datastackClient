import React from "react";

import {Box, IconButton, Tooltip} from '@mui/material';
//Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SettingsIcon from '@mui/icons-material/Settings';

const Controls = ({openDrawer}) => {

    return <Box sx={{display: 'flex', flexDirection: 'row'}}>
        <IconButton onClick={()=>openDrawer('addForm')} size="small">
            <AddCircleOutlineIcon />
        </IconButton>
        <IconButton onClick={()=>openDrawer('settings')} size="small">
            <SettingsIcon />
        </IconButton>
        <IconButton onClick={()=>openDrawer('filters')} size="small">
            <FilterAltIcon />
        </IconButton>
    </Box>
}

export default Controls;