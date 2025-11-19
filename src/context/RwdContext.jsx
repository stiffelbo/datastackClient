// src/contexts/RwdContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const RwdContext = createContext(null);

export const RwdProvider = ({ children }) => {
  const [rwd, setRwd] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setRwd({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // initial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <RwdContext.Provider value={rwd}>
      {children}
    </RwdContext.Provider>
  );
};

export const useRwd = () => {
  const ctx = useContext(RwdContext);
  if (!ctx) {
    throw new Error('useRwd must be used within <RwdProvider>');
  }
  return ctx; // {width, height}
};
