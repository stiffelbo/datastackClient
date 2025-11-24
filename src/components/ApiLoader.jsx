// components/ApiLoader.js
import React, { useEffect, useState, useRef } from 'react';
import http from '../http';
import { Alert } from '@mui/material';

const ApiLoader = ({
  // url może być stringiem (stary tryb) albo mapą { data: '/api/data', schema: '/api/schema' }
  url,
  params = {},
  deps = [],
  immediate = true,
  children,
  entityName = 'defaultApiLoader',
}) => {
  // trzymamy dane jako cokolwiek (array, obiekt, itd.)
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isMulti = url && typeof url === 'object' && !Array.isArray(url);

  const run = async () => {
    if (!url) {
      console.warn(`[ApiLoader][${entityName}] Brak url`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // --- TRYB SINGLE: url jako string ---
      if (!isMulti) {
        console.debug('[ApiLoader][REQ_SINGLE]', { entityName, url, params });

        const res = await http.get(url, { params });

        if (!isMountedRef.current) return;

        setData(res.data);
        console.debug('[ApiLoader][RES_SINGLE]', { entityName, data: res.data });

        return res.data;
      }

      // --- TRYB MULTI: url jako mapa ---
      const entries = Object.entries(url); // np. [['data', '/api/data'], ['schema', '/api/schema']]

      if (entries.length === 0) {
        console.warn(`[ApiLoader][${entityName}] Pusta mapa url`);
        return;
      }

      console.debug('[ApiLoader][REQ_MULTI]', { entityName, urls: url, params });

      // równoległe requesty
      const responses = await Promise.all(
        entries.map(([key, endpoint]) =>
          http.get(endpoint, { params }) // jeśli chcesz osobne parametry per key -> tu łatwo rozbudować
        )
      );

      if (!isMountedRef.current) return;

      const nextData = {};
      entries.forEach(([key], i) => {
        nextData[key] = responses[i].data;
      });

      setData(nextData);
      console.debug('[ApiLoader][RES_MULTI]', { entityName, data: nextData });

      return nextData;
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

  // Jeśli mamy multi-URL i dane są obiektem, rozsypujemy klucze jako props
  // np. { data, schema } -> child dostaje props.data i props.schema
  const namedData =
    isMulti && data && typeof data === 'object' && !Array.isArray(data)
      ? data
      : {};

  const injectedProps = {
    // zawsze:
    data,        // w single: to jest wynik z API; w multi: pełna mapa
    ...namedData, // w multi: data, schema, ... jako osobne propsy
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
  const hasData = Array.isArray(data)
    ? data.length > 0
    : data != null && (typeof data !== 'object' || Object.keys(data).length > 0);

  return (
    <Alert severity="warning">
      ApiLoader (<strong>{entityName}</strong>): nie podano komponentu potomnego do
      wyrenderowania danych.{' '}
      {loading && 'Trwa ładowanie danych z API.'}
      {!loading && !error && hasData && 'Dane zostały pobrane, ale nie są nigdzie wyświetlane.'}
      {!loading && !error && !hasData && 'Brak danych z API lub endpoint zwrócił pustą odpowiedź.'}
      {error && ' Wystąpił błąd przy pobieraniu danych.'}
    </Alert>
  );
};

export default ApiLoader;
