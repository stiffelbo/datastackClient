import React from 'react';

//Hooks
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import UserPage from './UserPage';

import RenderLink from '../jiraIssue/RenderLink';

const entityName = "Users"
const basePath = "/users";
const endpoint = "/user/";

const Users = () => {
  const entity = useEntity({ endpoint });

  const columns = entity.schema.columns.map(c => {
      if(c?.field === "empId") {
          return {...c, renderCell : params => <RenderLink 
              id={params.value} 
              baseUrl="http://192.168.1.135/datastack/employees/"  
              title="link do pracownika"
              nullTitle='Nie powiązano pracownika' 
            />}
      }else{
          return c;
      }
  });

  entity.schema.columns = columns;
  

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
