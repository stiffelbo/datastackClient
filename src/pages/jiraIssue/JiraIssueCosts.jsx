// pages/Employees/JiraIssueCosts.jsx
import React, { useCallback } from 'react';
import { Box } from '@mui/material';

import Mapper from '../../components/mapper/mapper';
import useEntity from '../../hooks/useEntity';

const defaultRwd = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const JiraIssueCosts = ({ id = null, data = {}, rwd = defaultRwd }) => {
  // prawa strona – słownik kosztów, w trybie readOnly (odchudzony schema)
  const costsDictEntity = useEntity({
    endpoint: '/cost_item_dict/',
    entityName: 'cost_item_dict',
    readOnly: true,
  });
  const availableCosts = costsDictEntity.rows;

  // lewa strona – pozycje przypisane do issue
  const jiraIssueCostsEntity = useEntity({
    endpoint: '/jira_issue_costs/',
    entityName: 'jira_issue_costs',
    query: { issue_id: id },
  });
  const assignedCosts = jiraIssueCostsEntity.rows;

  // ---- CALLBACK: dodawanie z prawej do lewej ----
  // mappedItemData – wiersz z prawej (CostItemDict)
  // prevElementData – aktualnie zaznaczony wiersz po lewej (na przyszłość do sekwencji)
  const handleAdd = useCallback(
    async ({ mappedItemData, prevElementData }) => {
      if (!mappedItemData) return;
      if (!id) return;
      if (typeof jiraIssueCostsEntity.create !== 'function') return;

      const today = new Date().toISOString().slice(0, 10);

      // 🔑 payload zgodny ze schematem jira_issue_costs
      const payload = {
        issue_id: id,
        item_id: mappedItemData.id,

        // plan vs wykonanie – na start ustawiamy plan
        qty_plan: 0,
        price_net_plan: mappedItemData.defaultRate ?? 0,

        qty: 0,
        price_net: mappedItemData.defaultRate ?? 0,

        currency: mappedItemData.currency ?? 'PLN',

        // jako domyślny opis można wrzucić nazwę pozycji ze słownika
        note: mappedItemData.name ?? null,

        cost_date: today,
        is_planned: 1,
        // seq: tutaj kiedyś możesz dorzucić sekwencję na podstawie prevElementData
      };

      try {
        await jiraIssueCostsEntity.create(payload);
        // create w useEntity i tak robi getOne(id) → odświeży cache wierszy
      } catch (e) {
        console.error('Error creating jira_issue_cost row', e);
      }
    },
    [id, jiraIssueCostsEntity.create]
  );

  // ---- CALLBACK: edycja w lewej tabeli (qty, price_net, note, ...) ----
  // Mapper woła: onEditLeft(newValue, params)
  // useEntity.updateField oczekuje: ({ id, field, value })
  const handleEditLeft = (params) => {
    jiraIssueCostsEntity.updateField(params);
  }

  // ---- CALLBACK: usuwanie z lewej ----
  // Mapper woła onDeleteLeft(row) – my chcemy remove(row.id)
  const handleDeleteLeft = useCallback(
    async (row) => {
      if (!row) return;
      if (!jiraIssueCostsEntity.remove) return;

      try {
        await jiraIssueCostsEntity.remove(row.id);
      } catch (e) {
        console.error('Error removing row', e);
      }
    },
    [jiraIssueCostsEntity.remove]
  );

  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Mapper
        entityName='JiraIssueCostsItems'
        ownerLabel="Jira issue"
        owner={{ id }}

        leftData={assignedCosts}
        leftColumns={jiraIssueCostsEntity.schema.columns}
        leftSearchFields={['note', 'jira_key', 'itemName', 'itemGroup']} // albo ['note'] w zależności od joinedFields
        leftProps={{showSidebar : true, enablePresets: true, }}

        rightData={availableCosts}
        rightColumnsBase={costsDictEntity.schema.columns}
        rightSearchFields={['name', 'type']}

        idField="id"
        orderField="seq" // na razie tylko info tekstowe – w schema tego pola jeszcze nie ma

        onAdd={handleAdd}
        onEditLeft={handleEditLeft}
        onDeleteLeft={handleDeleteLeft}

        height={rwd.height - 220}
        leftRowHeight={40}
        rightRowHeight={40}
      />
    </Box>
  );
};

export default JiraIssueCosts;
