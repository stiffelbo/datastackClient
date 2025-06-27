import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { parseXLSX } from '../../utils/parseXLSX'
import { toISODate, toISOTime } from '../../utils/toISO';
import { uploadClockifyData } from './../../services/clockify/upload';
//Mui
import { Box, Button, Drawer, IconButton, Alert, Stack, Typography, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const processData = (data = []) => {
  if (!data) return [];

  const bracketRegex = /^\[(.*?)\]/; // dla task
  const suffixRegex = /\|(.*?)\|?$/; // dla parrentTask

  return data.map((row, index) => {
    let task = row['Task'] || '';
    let parrentTask = '';
    let description = row['Description'] || '';

    // Parsuj task jeśli puste i Description zawiera [XXX-1234]
    const matchTask = description.match(bracketRegex);
    if (!task && matchTask) {
      task = matchTask[1]; // np. HIM-8934
    }

    // Parsuj parrentTask jeśli Description zawiera |XXX-1234|
    const matchParrent = description.match(suffixRegex);
    if (matchParrent && matchParrent[1] !== task) {
      parrentTask = matchParrent[1];
    }

    return {
      id: index + 1,
      project: row['Project'] || '',
      client: row['Client'] || '',
      description: description,
      task: task,
      parrentTask: parrentTask,
      user: row['User'] || '',
      group: row['Group'] || '',
      email: row['Email'] || '',
      tags: row['Tags'] || '',
      billable: row['Billable']?.toLowerCase() === 'yes' ? 1 : 0,
      start_date: toISODate(row['Start Date']),
      start_time: row['Start Time'] || '',
      end_date: toISODate(row['End Date']),
      end_time: row['End Time'] || '',
      duration_h: row['Duration (h)'] || '',
      duration_decimal: parseFloat(row['Duration (decimal)']) || 0,
      billable_rate_pln: parseFloat(row['Billable Rate (PLN)']) || 0,
      billable_amount_pln: parseFloat(row['Billable Amount (PLN)']) || 0,
    };
  });
};


const Clockify = () => {
  const [rows, setRows] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files);
    const allData = [];
    for (const file of files) {
      try {
        const data = await parseXLSX(file);
        allData.push(...data);
      } catch (err) {
        console.error('Błąd podczas parsowania:', err);
      }
    }
    setRows(processData(allData));
    setOpenDrawer(false);
  };

  const handleDelete = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      const data = await uploadClockifyData(rows);
      console.log(data);
      setRows([]);
      toast.success('✅ Wysłano dane!');
    } catch (err) {
      console.error(err);
      toast.error('❌ Błąd podczas wysyłania danych!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (params) => {
    const { id, field, value } = params;
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? { ...row, [field]: value }
          : row
      )
    );
  };


  const renderDeleteData = () => {
    if (rows.length) {
      return <IconButton size="small" color="error" title="Usuń dane" onClick={() => setRows([])}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    }
  }

  const renderUploadButton = () => {
    if (loading) return <CircularProgress size="small" />
    if (rows.length) {
      return <IconButton size="small" color="success" onClick={handleUpload}>
        <CloudUploadIcon />
      </IconButton>
    }
  }

  const columns = [
    {
      field: 'id',
      headerName: '',
      width: 40,
      renderCell: (params) => (
        <IconButton size="small" onClick={() => handleDelete(params.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
    { field: 'user', headerName: 'Użytkownik', width: 150 },
    { field: 'client', headerName: 'Klient', width: 100, editable: true },
    { field: 'project', headerName: 'Projekt', width: 180, editable: true },
    { field: 'description', headerName: 'Opis', width: 220, editable: true },
    { field: 'task', headerName: 'Zadanie', width: 120, editable: true },
    { field: 'parrentTask', headerName: 'Zadanie nadrzędne', width: 140, editable: true },
    { field: 'tags', headerName: 'Tagi', width: 100 },
    { field: 'billable', headerName: 'Billable', width: 90 },
    { field: 'start_date', headerName: 'Data startu', width: 110 },
    { field: 'start_time', headerName: 'Czas startu', width: 100 },
    { field: 'end_date', headerName: 'Data końca', width: 110 },
    { field: 'end_time', headerName: 'Czas końca', width: 100 },
    { field: 'duration_h', headerName: 'Czas (h)', width: 90 },
    { field: 'duration_decimal', headerName: 'Czas (dec)', width: 100 },
    { field: 'billable_rate_pln', headerName: 'Stawka (PLN)', width: 110 },
    { field: 'billable_amount_pln', headerName: 'Kwota (PLN)', width: 110 },
    { field: 'email', headerName: 'Email', width: 180 },
    { field: 'group', headerName: 'Grupa', width: 100 },
  ];

  return (
    <Box display="flex" height="calc(100vh - 88px)" mt={0.5}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '3rem',
          bgcolor: 'background.paper',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1,
          gap: 1,
        }}
      >
        <IconButton size="small" color="primary" title="Wgraj dane z plików .xslx" onClick={() => setOpenDrawer(true)}>
          <UploadFileIcon fontSize="small" />
        </IconButton>
        {renderDeleteData()}
        {renderUploadButton()}
        <Drawer anchor="left" open={openDrawer} onClose={() => setOpenDrawer(false)}>
          <Box p={2} minWidth={250}>
            <Typography variant="subtitle1">Wgraj pliki Clockify</Typography>
            <input
              type="file"
              accept=".xlsx"
              multiple
              onChange={handleFiles}
              style={{ marginTop: '1rem' }}
            />
          </Box>
        </Drawer>
      </Box>

      {/* Content */}
      <Box flex={1} overflow="hidden">
        {rows.length > 0 ? (
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            onCellEditCommit={handleEdit}
            sx={{ height: '100%' }}
          />
        ) : (
          <Box p={3}>
            <Alert severity="info">Brak danych. Wgraj plik z Clockify.</Alert>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Clockify;
