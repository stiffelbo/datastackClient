import React from "react";

//Mui
import { Box, Typography, Chip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function RenderLink ({id, baseUrl = 'http://192.168.1.135/datastack/jiraissuesingle/', title = null, icon = null}){
    if(!id && !baseUrl) return;
    
    let url = `${baseUrl}${id}`;
    if(!id){
        url = `${baseUrl}`;
    }

    const handleClick = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (<Chip
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                label={`${id}`}
                title={title ? title : 'Link'}
                icon={icon ? icon : <OpenInNewIcon />}
                clickable
                variant="outlined"
                size="small"
                color="primary"
            />);
}