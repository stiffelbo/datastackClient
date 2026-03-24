// pages/Employees.jsx
import React from 'react';
import useEntity from '../../hooks/useEntity';

import BaseEntityDashboard from '../../components/dashboard/BaseEntityDashboard';
import EmployeePage from './EmployeePage';

const Employees = () => {

  const entityName = "Employees"
  const entity = useEntity({ entityName, endpoint: '/employees/' });
  const basePath = "/employees";

  const storageUrl = import.meta.env.VITE_STORAGE_URL;

  const profileColumn = {
    field: 'profile_url',
    headerName: 'Profil',
    width: 100,
    renderCell: (params) => {
      const { profile_url, name, is_active } = params.row;

      const style = {
        width: 80,
        height: 80,
        borderRadius: '50%',
        opacity: is_active ? 1 : 0.3,
      };

      if (!profile_url) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <div style={{ ...style, backgroundColor: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: 24 }}>
                {name ? name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <img
            src={storageUrl + profile_url}
            alt={name}
            style={style}
          />
        </div>
      );
    },
  };

  //we need to inject profileColumn as the first column in the columns array
  const columns = entity.schema.columns.map(col => col.field === 'profile_url' ? profileColumn : col);
  entity.schema.columns = columns;

  return (
    <BaseEntityDashboard
      renderPage={(props) => <EmployeePage entity={entity} entityName={entityName} {...props} />}
      entity={entity}
      entityName={entityName}
      basePath={basePath}
      listProps={{ rowHeight: 90 }}
    />
  );
};

export default Employees;
