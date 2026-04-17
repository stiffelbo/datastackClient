import React from "react";

//Mui
import { Box, Typography, Chip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function RenderLink ({id}){
    if(!id) return;
    
    const url = `http://192.168.1.135/datastack/jiraissuesingle/${id}`;

    const handleClick = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (<Chip
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                label={`#${id}`}
                icon={<OpenInNewIcon />}
                clickable
                variant="outlined"
                size="small"
                color="primary"
            />);
}