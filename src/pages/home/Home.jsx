import React, {useEffect, useState} from 'react';
//http
import http from '../../http';
import { useRwd } from '../../context/RwdContext';

import AppDescription from './AppDescription';

//Mui
import { Box } from '@mui/material';

const Home = () => {

  const [pagesData, setPagesData] = useState([]);

  const { width, height } = useRwd();

  const contentHeight = height - 100;

  useEffect(() => {
    http.get('/pages/getDomains.php')
      .then(response => {
        setPagesData(response.data);
      })
      .catch(error => {
        console.error('Error fetching pages data:', error);
      });
  }, []);

  console.log(pagesData);

  return (
    <Box sx={{mt: 1, height: contentHeight, maxHeight: contentHeight, overflowY: 'hidden'}}>
      <AppDescription pages={pagesData}/>
    </Box>
  );
}

export default Home;