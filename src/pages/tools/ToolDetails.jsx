import React, { useMemo } from 'react';

const ToolDetails = ({ id, row, rows, entity, rwd, dashboard }) => {
  const onCancel = () => {
    dashboard.setCurrentId(null);
    dashboard.setTab(null);
  };

  return <p>Tool Details: {id}</p>

}

export default ToolDetails;