import React from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import UserPage from './UserPage';

const entityName = "Users"
const basePath = "/users";
const endpoint = "/user/";

const Users = () => {
  const entity = useEntity({ endpoint });

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
