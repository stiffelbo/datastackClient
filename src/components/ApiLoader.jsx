// components/ApiLoader.js
import React, { useEffect, useState, useRef } from 'react';
import http from '../http';
import { Alert } from '@mui/material';

const ApiLoader = ({
  url,
  params = {},
  deps = [],
  immediate = true,
  children,
  entityName = 'defaultApiLoader',
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const run = async () => {
    if (!url) {
      console.warn(`[ApiLoader][${entityName}] Brak url`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.debug('[ApiLoader][REQ]', { entityName, url, params });

      const res = await http.get(url, { params });

      if (!isMountedRef.current) return;

      setData(res.data);
      console.debug('[ApiLoader][RES]', { entityName, data: res.data });

      return res.data;
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error('[ApiLoader][ERR]', entityName, err);
      setError(err);
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (immediate) {
      run();
    }
    // deps kontrolujesz przy użyciu ApiLoadera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const injectedProps = {
    data,
    loading,
    error,
    onRefresh: run,
    entityName,
  };

  // 1) Render prop
  if (typeof children === 'function') {
    return children(injectedProps);
  }

  // 2) Pojedyncze dziecko
  if (React.isValidElement(children)) {
    return React.cloneElement(children, injectedProps);
  }

  // 3) Wiele dzieci
  if (Array.isArray(children) && children.length > 0) {
    const mapped = children.map((child, i) =>
      React.isValidElement(child)
        ? React.cloneElement(child, {
            key: child.key || i,
            ...injectedProps,
          })
        : child
    );

    return <>{mapped}</>;
  }

  // 4) Brak sensownego dziecka → ładny defaultowy Alert
  const hasData =
    Array.isArray(data) ? data.length > 0 : data != null;

  return (
    <Alert severity="warning">
      ApiLoader (<strong>{entityName}</strong>): nie podano komponentu potomnego do
      wyrenderowania danych.
      {' '}
      {loading && 'Trwa ładowanie danych z API.'}
      {!loading && !error && hasData && 'Dane zostały pobrane, ale nie są nigdzie wyświetlane.'}
      {!loading && !error && !hasData && 'Brak danych z API lub endpoint zwrócił pustą odpowiedź.'}
      {error && ' Wystąpił błąd przy pobieraniu danych.'}
    </Alert>
  );
};

export default ApiLoader;
