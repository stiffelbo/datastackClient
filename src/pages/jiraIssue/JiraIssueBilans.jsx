import React from 'react';

//Mui
import { Box } from '@mui/material';

//Comp
import ApiLoader from '../../components/ApiLoader';
import Bilans from './Bilans';

const JiraIssueBilans = ({id, row}) => {
    return <ApiLoader
        url={`/jira_issue/bilans.php?id=${id}&issue=${row.jira_key}`}
        deps={[id]}
    >
        <Bilans data={null}/>
    </ApiLoader>
}

export default JiraIssueBilans;