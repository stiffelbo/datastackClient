// pages/Employees/Bilans.jsx
import React, {useMemo} from 'react';
import {
  Box,
  Paper,
  Typography
} from '@mui/material';

import PowerTable from '../../components/powerTable/powerTable';

import { generateCostRows } from './generator';

const Summary = ({ summary }) => {
    return (
        <Paper
            variant="outlined"
            sx={{
                height: 150,
                p: 2,
                display: 'flex',
                gap: 3,
                overflow: 'hidden'
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom color="error">
                    Koszty wg marży | Dane POGLADOWE
                </Typography>

                {summary.marginCumulative.map((row) => (
                    <Box
                        key={row.margin}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 13
                        }}
                    >
                        <span>{row.margin}</span>
                        <span>{row.cumulative.toFixed(2)} zł</span>
                    </Box>
                ))}
            </Box>

            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom color="error">
                    Koszty wg kategorii | Dane POGLADOWE
                </Typography>

                {Object.entries(summary.byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([key, value]) => (
                        <Box
                            key={key}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 13
                            }}
                        >
                            <span>{key}</span>
                            <span>{value.toFixed(2)} zł</span>
                        </Box>
                    ))}
            </Box>

            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom color="error">
                    Koszty wg działu | Dane POGLADOWE
                </Typography>

                {Object.entries(summary.byDepartment)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([key, value]) => (
                        <Box
                            key={key}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 13
                            }}
                        >
                            <span>{key}</span>
                            <span>{value.toFixed(2)} zł</span>
                        </Box>
                    ))}

                <Box
                    sx={{
                        mt: 1,
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 700
                    }}
                >
                    <span>SUMA</span>
                    <span>{summary.total.toFixed(2)} zł</span>
                </Box>
            </Box>
        </Paper>
    );
};

const Bilans = ({ data, rwd }) => {
  const costData = useMemo(() => generateCostRows(), [data?.id]);
  console.log(costData);
  // ====== RENDER ======
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
        {/* NAGŁÓWEK ISSUE */}
      <Summary summary={costData.summary} />
      <PowerTable data={costData.rows} height={rwd.height - 400} entityName='JiraIssueBilans'/>
    </Box>);
};

export default Bilans;
