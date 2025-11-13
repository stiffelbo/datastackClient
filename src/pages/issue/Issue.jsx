import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

//Components
import IssueClockify from './issueClockify';

const Issue = () => {
  const { sygn } = useParams();

  return (
    <div className="container py-3">
      <h5 className="mb-3">Issue: {sygn}</h5>
      <IssueClockify sygn={sygn} />
    </div>
  );
};

export default Issue;
