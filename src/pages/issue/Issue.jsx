import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Issue = () => {
  const { id } = useParams();

  return (
    <div className="container py-3">
      <h5 className="mb-3">Issue: {id}</h5>
    </div>
  );
};

export default Issue;
