// pages/Employees/Bilans.jsx
import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';

// helpers do formatowania
const formatPLN = (v) => {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 2,
  }).format(Number(v));
};

const formatNumber = (v, digits = 2) => {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return Number(v).toFixed(digits);
};

const formatPct = (v) => {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return `${Number(v).toFixed(1)}%`;
};

const Bilans = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Błąd ładowania bilansu: {String(error?.message || error)}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">Brak danych bilansu.</Alert>
      </Box>
    );
  }

  // ApiLoader może zwracać różne kształty, więc zróbmy małe „bezpieczne” rozpakowanie
  const payload = data.data || data; // jeśli backend ma { data: {...} }
  const issue = payload.issue || {};
  const clockify = payload.clockify || {};
  const costs = payload.costs || {};
  const summary = payload.summary || {};
  const clkAgg = clockify.aggregates || {};
  const costAgg = costs.aggregates || {};

  // ====== RENDER ======
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      {/* NAGŁÓWEK ISSUE */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="overline" color="text.secondary">
            Jira Key
          </Typography>
          <Typography variant="h6">{issue.jira_key}</Typography>
          <Typography variant="body2" color="text.secondary">
            {issue.jira_project_label}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary">
            Nazwa
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
            {issue.name}
          </Typography>
          {issue.contractor_name && (
            <Typography variant="body2" color="text.secondary" noWrap>
              Kontrahent: {issue.contractor_name}
            </Typography>
          )}
        </Box>

        <Box sx={{ minWidth: 160 }}>
          <Typography variant="overline" color="text.secondary">
            Status
          </Typography>
          <Typography variant="body1">{issue.status || '—'}</Typography>
          {issue.currency && (
            <Typography variant="body2" color="text.secondary">
              Waluta: {issue.currency}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* PODSUMOWANIE – KPI */}
      <Box sx={{display: 'flex'}}>
        {/* PRZYCHODY / BUDŻET */}
        <Paper elevation={1} sx={{ mr: 1, p: 1, width: '50%' }}>
          <Typography variant="overline" color="text.secondary">
            Przychody / budżet
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Planowany przychód
            </Typography>
            <Typography variant="h6">
              {formatPLN(summary.planned_revenue_net)}
            </Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Budżet
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.budget_net)}
            </Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Zafakturowany przychód
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.invoiced_revenue_net)}
            </Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Wpływy
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.cash_received_net)}
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={1} sx={{ mr: 1, p: 1, width: '50%' }}>
          <Typography variant="overline" color="text.secondary">
            Koszty (plan / real)
          </Typography>

          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">Plan</Typography>
            <Typography variant="body2" color="text.secondary">
              Koszty zewnętrzne
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.plan_external_costs)}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Koszty czasu (Clockify)
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.plan_clockify_costs)}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Wszystkie koszty razem
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.all_costs_plan_total)}
            </Typography>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box>
            <Typography variant="subtitle2">Real</Typography>
            <Typography variant="body2" color="text.secondary">
              Koszty zewnętrzne
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.real_external_costs)}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Koszty czasu (Clockify)
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.real_clockify_costs)}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Wszystkie koszty razem
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.all_costs_real_total)}
            </Typography>
          </Box>
        </Paper>

        {/* MARŻE */}
        <Paper elevation={1} sx={{ mr: 1, p: 1, width: '50%' }}>
          <Typography variant="overline" color="text.secondary">
            Marża
          </Typography>

          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">Plan</Typography>
            <Typography variant="body2" color="text.secondary">
              Marża kwotowo
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.plan_margin_value)}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Marża %
            </Typography>
            <Typography variant="body1">
              {formatPct(summary.plan_margin_pct ?? summary.planned_margin_pct)}
            </Typography>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box>
            <Typography variant="subtitle2">Real</Typography>
            <Typography variant="body2" color="text.secondary">
              Marża kwotowo
            </Typography>
            <Typography variant="body1">
              {formatPLN(summary.real_margin_value)}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Marża %
            </Typography>
            <Typography variant="body1">
              {formatPct(summary.real_margin_pct)}
            </Typography>
          </Box>
        </Paper>
        {/* CLOCKIFY + KOSZTY DETALICZNIE */}
        <Paper elevation={1} sx={{ mr: 1, p: 1, width: '50%' }}>
          <Typography variant="overline" color="text.secondary">
            Clockify – czas i koszty
          </Typography>

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Czas (h)
            </Typography>
            <Typography variant="h6">
              {formatNumber(clkAgg.duration_hours, 2)}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Koszt osobowy (stawka * czas)
            </Typography>
            <Typography variant="body1">
              {formatPLN(clkAgg.costPLN)}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Koszt wydziałowy (PSC)
            </Typography>
            <Typography variant="body1">
              {formatPLN(clkAgg.kosztPSC)}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Koszt łączny czasu
            </Typography>
            <Typography variant="body1">
              {formatPLN(clkAgg.kosztTotal)}
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={1} sx={{ p: 1, width: '50%' }}>
          <Typography variant="overline" color="text.secondary">
            Pozycje kosztów
          </Typography>

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Suma kosztów planowanych
            </Typography>
            <Typography variant="h6">
              {formatPLN(costAgg.plan_total)}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Suma kosztów realnych
            </Typography>
            <Typography variant="body1">
              {formatPLN(costAgg.real_total)}
            </Typography>
          </Box>

          {/* Na później możesz dodać mini-tabelkę np. Top 5 pozycji wg kosztu */}
        </Paper>
      </Box>
    </Box>);
};

      export default Bilans;
