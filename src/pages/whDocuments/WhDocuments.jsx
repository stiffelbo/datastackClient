import React from 'react';

//Mui
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';

// Hooks
import useEntity from '../../hooks/useEntity';

// Components
import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import RenderLink from '../jiraIssue/RenderLink';

const entityName = "WhDocuments";
const basePath = "/whdocuments";
const endpoint = "/wh_documents/";

const DownloadLink = ({ value }) => {
    if (!value) return null;

    const storageUrl = import.meta.env.DEV
        ? import.meta.env.VITE_DEV_STORAGE_URL
        : import.meta.env.VITE_PROD_STORAGE_URL;

    if (!storageUrl) return null;

    const fileUrl = `${storageUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;

    return (
        <Tooltip title="Pobierz dokument">
            <IconButton
                component="a"
                href={fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                color="primary"
            >
                <DownloadIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
};

const Dashboard = () => {
    const entity = useEntity({ entityName, endpoint });
    
        const columns = entity.schema.columns.map(c => {
            if(c?.field === "file_path") {
                return {...c, renderCell : params => <DownloadLink value={params.value} />}
            }else{
                return c;
            }
        });
    
        entity.schema.columns = columns;
        
        const listProps = {};
    return (
        <BaseEntityDashboard
            renderPage={null}
            entity={entity}
            entityName={entityName}
            basePath={basePath}
        />
    );
};

export default Dashboard;