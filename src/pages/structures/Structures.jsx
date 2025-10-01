import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { getStructures } from '../../services/structures/getStructures';

import PowerTable from '../../components/powerTable/powerTable';

const sanitizeData = data => {
  if(!data || !data.length) return [];

  return data.map(i => {
    return {
      ...i
    }

  })
}

const Structures = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const populate = async () => {
    setLoading(true);
    try {
      const { data } = await getStructures();
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
        entityName='Structures'
        data={rows}
        height={window.innerHeight - 90}
        width={window.innerWidth}
        loading={loading}
        onRefresh={()=>populate()}
      />
  );
};

export default Structures;
