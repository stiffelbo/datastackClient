
import * as React from "react";
import {
    Box,
    Container,
    Typography,
    Stack,
    Grid,
    Card,
    CardContent,
    Chip,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HubIcon from "@mui/icons-material/Hub";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupsIcon from "@mui/icons-material/Groups";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";


function groupPages(pages) {
  const map = new Map();
  pages.forEach((p) => {
    const key = p.group_label || "Inne";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  });
  // stable sort: group name, then page name
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "pl"))
    .map(([group, items]) => ({
      group,
      items: items.slice().sort((x, y) => (x.name || "").localeCompare(y.name || "", "pl")),
    }));
}

const GROUP_ICON = {
  System: <SettingsIcon fontSize="small" />,
  Raporty: <QueryStatsIcon fontSize="small" />,
  HR: <GroupsIcon fontSize="small" />,
  Controlling: <MonetizationOnIcon fontSize="small" />,
  Projekty: <AssignmentIcon fontSize="small" />,
  Tech: <BuildCircleIcon fontSize="small" />,
};


const AppModules = ({pages}) => {

    const grouped = groupPages(pages);

    return (<Stack spacing={3}>
        {/* Pages/modules from Excel */}
        <Box sx={{ pb: 4 }}>
          <Stack spacing={1.5} sx={{ mb: 1.25 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccountTreeIcon fontSize="small" />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Moduły / strony aplikacji
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={1.25}>
            {grouped.map(({ group, items }) => (
              <Accordion key={group} defaultExpanded={group === "Projekty"} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    {GROUP_ICON[group] ?? <AccountTreeIcon fontSize="small" />}
                    <Typography sx={{ fontWeight: 800 }}>{group}</Typography>
                    <Chip size="small" label={`${items.length}`} variant="outlined" />
                  </Stack>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container spacing={1.75}>
                    {items.map((p) => (
                      <Grid item key={p.name} sx={{ width: "32%" }}>
                        <Card variant="outlined" sx={{ borderRadius: 2, height: "100%", minWidth: "100%", width: "100%" }}>
                          <CardContent>
                            <Stack spacing={1}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                justifyContent="space-between"
                                flexWrap="wrap"
                              >
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                  {p.label}
                                </Typography>
                                <Chip size="small" label={p.name} variant="filled" />
                              </Stack>

                              <Typography variant="body2" color="text.secondary">
                                {p.description?.trim?.() ? p.description : "Opis w przygotowaniu."}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      </Stack>);

}

export default AppModules;

    