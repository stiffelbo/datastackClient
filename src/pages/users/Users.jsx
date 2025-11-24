import React from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';


import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import UserPage from './UserPage';

const Users = () => {
  const entityName = "Users"
  const entity = useEntity({ endpoint: '/user/' });
  const basePath = "/users";

  return (
    <BaseEntityDashboard
      renderPage={(props) => <UserPage entity={entity} entityName={entityName} {...props} />}
      entity={entity}
      entityName={entityName}
      basePath={basePath}
    />
  );
};

export default Users;
