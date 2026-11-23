import React, { useCallback, useState } from 'react';

import ProductionTasksManager from '../jiraIssueProductionTasks/IssueProductionTasks/ProductionTasksManager';

const defaultRwd = {
    width: window.innerWidth,
    height: window.innerHeight,
};


const JiraIssueProductionTasks = ({ id = null, row = {}, rwd = defaultRwd }) => {
    return <ProductionTasksManager issue={row} product_order={null} rwd={rwd}/>
}

export default JiraIssueProductionTasks;