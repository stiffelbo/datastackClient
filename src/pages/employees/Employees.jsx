// pages/Employees.jsx
import React from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import EmployeePage from './EmployeePage';

const Employees = () => {
  const entityName = "Employees"
  const entity = useEntity({ endpoint: '/employees/' });
  return (
    <BaseEntityDashboard
      renderPage={dashboard => <EmployeePage entity={entity} dashboard={dashboard} entityName={entityName}/>}
      entity={entity}
      entityName={entityName}
      basePath="/employees"
    />
  );
};

export default Employees;
