import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import http from '../../http';
import {formatDecimal} from '../../utils/numbers';

import PowerTable from '../../components/powerTable/powerTable';

const sanitizeData = data => {
  if(!data || !data.length) return [];

  return data.map(i => {
    return {
      ...i,
      duration_decimal : formatDecimal(i.duration_decimal),
      billable_rate_pln : formatDecimal(i.billable_rate_pln),
      billable_amount : formatDecimal(i.billable_amount)
    }
  })
}

const columns = [
  {field: 'id', type: 'number', width: 60},
  {field: 'project', type: 'string', width: 260},
  {field: 'client', type: 'string', width: 160, groupBy: true, groupIndex: 1},
  {field: 'description', type: 'string', width: 260},
  {field: 'task', type: 'string', width: 260, groupBy: true, groupIndex: 2},
  {field: 'costPLN', headerName: 'Koszt PLN', type: 'number', width: 90, aggregationFn: 'sum', formatterKey: 'number2'},
];

const ClockifyData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const populate = async () => {
    setLoading(true);
    try {
      const { data } = await http.get('clockify/get.php');
      setRows(sanitizeData(data));
      if(data && data.length){
        toast.success(`Pobrano ${data.length} wierszy danych.`);
      }else{
        toast.warning(`Pobrano ${data.length} wierszy danych!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas pobierania danych!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    populate();
  }, []);

  return (   
      <PowerTable
        entityName='clockifyData'
        data={rows}
        height={window.innerHeight - 90}
        width={window.innerWidth}
        loading={loading}
        onRefresh={()=>populate()}
      />
  );
};

export default ClockifyData;
