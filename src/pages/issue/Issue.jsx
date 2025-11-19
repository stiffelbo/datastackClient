import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useRwd } from '../../context/RwdContext';

//Mui
import { Alert } from '@mui/material';

const Issue = () => {
  const { sygn } = useParams();
  const rwd = useRwd();

  if (!sygn) {
    return <Alert severity='error'>Brak Sygnatury</Alert>
  }

  return (
    <Alert severity='info'>{sygn}</Alert>
  );
};

export default Issue;
