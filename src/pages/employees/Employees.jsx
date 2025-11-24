// pages/Employees.jsx
import React from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import EmployeePage from './EmployeePage';

const Employees = () => {

  const entityName = "Employees"
  const entity = useEntity({ endpoint: '/employees/' });
  const basePath = "/employees";

  return (
    <BaseEntityDashboard
      renderPage={(props) => <EmployeePage entity={entity} entityName={entityName} {...props} />}
      entity={entity}
      entityName={entityName}
      basePath={basePath}
    />
  );
};

export default Employees;
