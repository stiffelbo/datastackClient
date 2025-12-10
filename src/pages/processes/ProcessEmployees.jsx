// pages/Employees/PageUser.jsx
import React, { useCallback } from 'react';
import { Box } from '@mui/material';

import Mapper from '../../components/mapper/mapper';
import useEntity from '../../hooks/useEntity';

const defaultRwd = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const ProcessEmployees = ({ id = null, data = {}, rwd = defaultRwd }) => {
  // prawa strona – słownik opcji, w trybie readOnly (odchudzony schema)
  const optionsEntity = useEntity({
    endpoint: '/employees/',
    entityName: 'Employees',
    readOnly: true,
  });
  const options = optionsEntity.rows;

  // lewa strona – pozycje przypisane
  const assignedEntity = useEntity({
    endpoint: '/employees_processes/',
    entityName: 'EmployeeProcess',
    query: { process_id: id },
  });
  const assigned = assignedEntity.rows;

  // ---- CALLBACK: dodawanie z prawej do lewej ----
  // mappedItemData – wiersz z prawej (CostItemDict)
  // prevElementData – aktualnie zaznaczony wiersz po lewej (na przyszłość do sekwencji)
  const handleAdd = useCallback(
    async ({ mappedItemData, prevElementData }) => {
      if (!mappedItemData) return;
      if (!id) return;
      if (typeof assignedEntity.create !== 'function') return;

      const today = new Date().toISOString().slice(0, 10);

      // 🔑 payload zgodny ze schematem jira_issue_costs
      const payload = {
        process_id: id,
        employee_id: mappedItemData.id,
        importance_score: 5,
        is_complementary: false,
        notes: '',
      };

      try {
        await assignedEntity.create(payload);
        // create w useEntity i tak robi getOne(id) → odświeży cache wierszy
      } catch (e) {
        console.error('Error creating jira_issue_cost row', e);
      }
    },
    [id, assignedEntity.create]
  );

  // ---- CALLBACK: edycja w lewej tabeli (qty, price_net, note, ...) ----
  // Mapper woła: onEditLeft(newValue, params)
  // useEntity.updateField oczekuje: ({ id, field, value })
  const handleEditLeft = (params) => {
    assignedEntity.updateField(params);
  }

  // ---- CALLBACK: usuwanie z lewej ----
  // Mapper woła onDeleteLeft(row) – my chcemy remove(row.id)
  const handleDeleteLeft = useCallback(
    async (row) => {
      if (!row) return;
      if (!assignedEntity.remove) return;

      try {
        await assignedEntity.remove(row.id);
      } catch (e) {
        console.error('Error removing row', e);
      }
    },
    [assignedEntity.remove]
  );

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Mapper
        entityName='EmployeeProcessesMapper'
        ownerLabel="Procesy Pracownika"
        owner={{ id }}

        leftData={assigned}
        leftColumns={assignedEntity.schema.columns}
        leftSearchFields={['pageName', 'pageLabel', 'groupKey', 'groupLabel', 'pageKey']} // albo ['note'] w zależności od joinedFields
        leftProps={{showSidebar : true, enablePresets: true, }}

        rightData={options}
        rightColumnsBase={optionsEntity.schema.columns}
        rightSearchFields={['userName', 'userLastName']}

        idField="id"
        orderField="seq" // na razie tylko info tekstowe – w schema tego pola jeszcze nie ma
        distinct={true}
        distinctField='employee_id'

        onAdd={handleAdd}
        onEditLeft={handleEditLeft}
        onDeleteLeft={handleDeleteLeft}

        height={rwd.height - 190}
        leftRowHeight={40}
        rightRowHeight={40}
      />
    </Box>
  );
};

export default ProcessEmployees;
