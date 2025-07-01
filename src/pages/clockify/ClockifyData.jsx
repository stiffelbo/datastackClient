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

const ClockifyData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const populate = async () => {
    setLoading(true);
    try {
      const { data } = await http.get('clockify/get.php');
      setRows(sanitizeData(data));
      if(data.length){
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
      />
  );
};

export default ClockifyData;
