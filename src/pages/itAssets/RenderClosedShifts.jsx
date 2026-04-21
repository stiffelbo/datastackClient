import React, { useMemo } from 'react';

import PowerTable from '../../components/powerTable/powerTable';

const schema = [
    {
      "field": "id",
      "headerName": "Id",
      "order": 0
    },
    {
      "field": "employeeName",
      "headerName": "Pracownik",
      "order": 1
    },
    {
      "field": "assetType",
      "headerName": "Typ",
      "order": 2
    },
    {
      "field": "assetLabel",
      "headerName": "Asset",
      "order": 4
    },
    {
      "field": "serial_number",
      "headerName": "Serial",
      "order": 5
    },
    {
      "field": "date_from",
      "headerName": "Data Od",
      "order": 10
    },
    {
      "field": "date_to",
      "headerName": "Data Do",
      "order": 20
    },
    {
      "field": "createdByName",
      "headerName": "Utworzył",
      "order": 30
    },
    {
      "field": "updatedByName",
      "headerName": "Aktualizował",
      "order": 40
    },
];

export default function RenderClosedShifts({ shifts = [] }) {

    return <PowerTable 
        data={shifts}
        rowHeight={45}
        height={400}
        columnSchema={schema}
        strictSchema={true}
    />
}