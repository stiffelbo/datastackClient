import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import http from '../../http';

import { Box, CircularProgress, Backdrop } from '@mui/material';
import Crud from '../../components/crud/crud';

const ClockifyData = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const populate = async () => {
    setLoading(true);
    try {
      const { data } = await http.get('clockify/get.php');
      setRows(data);
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
   
      <Crud
        data={rows}
      />
  );
};

export default ClockifyData;
