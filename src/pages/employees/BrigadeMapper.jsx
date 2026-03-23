import React, { useCallback } from 'react';
import { Box } from '@mui/material';

import Mapper from '../../components/mapper/mapper';
import useEntity from '../../hooks/useEntity';

const defaultRwd = {
    width: window.innerWidth,
    height: window.innerHeight,
};


const BrigadeMapper = ({ id = null, data = {}, rwd }) => {

    if (data.is_brigade == 0) {
        return <pre>{JSON.stringify(data)}</pre>;
    }

    // prawa strona – słownik opcji, w trybie readOnly (odchudzony schema)
    const optionsEntity = useEntity({
        endpoint: '/employees/',
        entityName: 'BrygadaPracownicy',
        query: { rowsForBrigades: 'true' },
        readOnly: true,
    });
    const options = optionsEntity.rows;

    // lewa strona – pozycje przypisane
    const assignedEntity = useEntity({
        endpoint: '/employees_brigades/',
        entityName: 'OpcjePracownikówDlaBrygady',
        query: { brigade_id: id },
    });
    const assigned = assignedEntity.rows;
    const assignedIds = assigned.map((item) => item.employee_id);

    const handleAdd = useCallback(
        async ({ mappedItemData, prevElementData }) => {

            if (!mappedItemData) return;
            if (!id) return;
            if (typeof assignedEntity.create !== 'function') return;

            const today = new Date().toISOString().slice(0, 10);

            // 🔑 payload zgodny ze schematem jira_issue_costs
            const payload = {
                brigade_id: id,
                employee_id: mappedItemData.id,
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

    const optionsFieldsToShow = ['structure_id', 'first_name', 'last_name'];

    const optionsColumns = optionsFieldsToShow
        .map((field) => optionsEntity.schema.columns.find((col) => col.field === field))
        .filter(Boolean)
        .map((col) => ({ ...col, editable: false }));

    const combedOptions = options.map((option) => ({
        id: option.id,
        structure_id: option.structure_id,
        first_name: option.first_name,
        last_name: option.last_name,
    }));

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
                entityName='EmployeesBrigadesMapper'
                ownerLabel={"Skład Brygady: " + data.first_name}
                owner={{ id }}

                leftData={assigned}
                leftColumns={assignedEntity.schema.columns}
                leftSearchFields={['first_name', 'last_name']} // albo ['note'] w zależności od joinedFields
                leftProps={{ showSidebar: false, enablePresets: false, }}

                rightData={combedOptions}
                rightColumnsBase={optionsColumns}
                rightSearchFields={['first_name', 'last_name']} // albo ['note'] w zależności od joinedFields

                idField="id"
                distinct={true}
                distinctField='employee_id'

                onAdd={handleAdd}
                onEditLeft={null}
                onDeleteLeft={handleDeleteLeft}

                height={rwd.height - 300}
                leftRowHeight={40}
                rightRowHeight={40}
            />
        </Box>
    );
};

export default BrigadeMapper;