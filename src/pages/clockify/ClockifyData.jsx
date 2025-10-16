import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import http from '../../http';
import { formatDecimal } from '../../utils/numbers';

import PowerTable from '../../components/powerTable/powerTable';

const sanitizeData = data => {
  if (!data || !data.length) return [];

  return data.map(i => {
    return {
      ...i,
      duration_decimal: formatDecimal(i.duration_decimal),
      billable_rate_pln: formatDecimal(i.billable_rate_pln),
      billable_amount: formatDecimal(i.billable_amount)
    }
  })
}

const ClockifyData = () => {
  const [rows, setRows] = useState([]);
  const [structOptions, setStructOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const populate = async () => {
    setLoading(true);
    try {
      const { data } = await http.get('clockify/get.php');
      setRows(sanitizeData(data));
      if (data && data.length) {
        toast.success(`Pobrano ${data.length} wierszy danych.`);
      } else {
        toast.warning(`Pobrano ${data.length} wierszy danych!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas pobierania danych!');
    } finally {
      setLoading(false);
    }
  };

  const populateStructOptions = async () => {
    setLoading(true);
    try {
      const { data } = await http.get('structures/getOptions.php');
      if (data && data.length) {
        setStructOptions(data);
        toast.success(`Pobrano ${data.length} opcji Działów.`);
      } else {
        toast.warning(`Pobrano ${data.length} opcji Działów!`);
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
    populateStructOptions();
  }, []);

  const handleEdit = async (value, params) => {
    const { field, id } = params;
    try {
      const { updated } = await http.post('/clockify/updateField.php', { field, id, value });
      if (updated) {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
      } else {
        // obsłuż sytuację "nie zmieniono" jeśli chcesz
      }
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas zapisywania');
    }
  };

  //Actions
  const handleDelete = async (id) => {
    if (id) {
      const { data } = await http.delete('/clockify/delete.php?id=' + id);
      if (data) {
        setRows(prev =>
          prev.filter(r => +r.id !== +id)
        )
      }
    }
  }

  const handleMultiDelete = async (ids = []) => {
    if (!ids || !ids.length) return;
    try {
      const { deleted } = await http.post('/clockify/deleteMany.php', { ids });
      if (deleted === ids.length) {
        setRows(prev => prev.filter(r => !ids.includes(+r.id)));
        toast.success(`Usunięto ${deleted} rekordów`);
      } else {
        toast.warning(`Usunięto ${deleted} z ${ids.length} rekordów`);
        populate();
      }
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas usuwania rekordów');
    }
  };

  const handleBulkEdit = async (ids = [], formState = {}) => {
    if (!ids || !ids.length) {
      toast.warning('Brak zaznaczonych rekordów.');
      return;
    }
    try {
      const payload = { ids, changes : formState };
      const { updated } = await http.post('/clockify/updateMany.php', payload); // http wrapper musi wysyłać JSON
      if (updated === ids.length) {
        toast.success(`Zaktualizowano ${updated} rekordów.`);
        // 5) zaktualizuj UI lokalnie: mapuj rows i nakładaj changes na zaznaczone rekordy
        setRows(prev => prev.map(r => ids.includes(+r.id) ? { ...r, ...formState } : r));
        // alternatywnie: wywołaj populate() by wgrać świeże dane z serwera
      } else {
        toast.success('Operacja zakończona.');
        populate();
      }
    } catch (err) {
      console.error('bulk edit error', err);
      toast.error('Błąd podczas zapisywania zmian.');
    }
  };

  const actions = [
    { type: 'multiSelect' },
    { type: 'multiDelete', handler: handleMultiDelete },
  ];

  const bulkEditFormSchema = [
    { name: 'task', label: 'Zadanie', type: 'text', md: 3 },
    { name: 'parrentTask', label: 'Zadanie nadrzędne', type: 'text', md: 3 },
    { name: 'structure_id', label: 'Struktura', type: 'select', md: 3, selectOptions: structOptions },
    { name: 'end_date', label: 'Data Koniec', type: 'date', md: 3 },
    { name: 'duration_decimal', label: 'Czas', type: 'number', md: 3, step: '0.01' },
  ];

  const columns = [
    { field: 'id', type: 'number', width: 60 },
    { field: 'structure_id', headerName: 'Dział', type: 'number', inputType : 'select', options: structOptions, width: 140, editable: true },
    { field: 'project', type: 'string', width: 260 },
    { field: 'client', type: 'string', width: 160 },
    { field: 'description', type: 'string', width: 260 },
    { field: 'task', type: 'string', width: 260, editable: true },
    { field: 'parrentTask', type: 'string', width: 260, editable: true },
    { field: 'costPLN', headerName: 'Koszt PLN', type: 'number', width: 90, aggregationFn: 'sum', formatterKey: 'number2' },
    { field: 'tags', headerName: 'Tagi', type: 'number', editable: true, width: 90, aggregationFn: 'sum', formatterKey: 'number2' },
  ];

  return (
    <PowerTable
      entityName='clockifyData'
      data={rows}
      height={window.innerHeight - 90}
      width={window.innerWidth}
      loading={loading}
      onRefresh={() => populate()}
      columnSchema={columns}
      onEdit={handleEdit}

      actions={actions}
      onMultiDelete={handleMultiDelete}
      bulkEditFormSchema={bulkEditFormSchema}
      onBulkEdit={handleBulkEdit}
    />
  );
};

export default ClockifyData;
