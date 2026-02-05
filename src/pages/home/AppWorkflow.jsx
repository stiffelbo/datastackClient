
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


const AppWorkflow = ({pages, title}) => {

    return (
        <Stack spacing={3}>
            {/* Disclaimer */}
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2 }}>
                <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Disclaimer / kontekst operacyjny
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        W naszej firmie świadczymy usługi produkcyjne dla różnych klientów oraz produkujemy niskonakładowe serie
                        monet end-to-end. Z braku dedykowanych narzędzi od ~10 lat używamy Jira jako CRM / task manager,
                        część czasów pracy zbieramy w Clockify do tasków w Jira, a dane kosztowe utrzymujemy w plikach.
                        {` `}
                        {title} ma to uporządkować i zautomatyzować raportowanie, bez „rewolucji” procesowej.
                    </Typography>
                </Stack>
            </Paper>

            {/* What it does */}
            <Grid container spacing={2.25}>
                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
                        <CardContent>
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <HubIcon fontSize="small" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Jedna baza danych
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Spójny model encji: pracownicy, struktura, okresy, koszty, projekty oraz dane operacyjne z Jira/Clockify.
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
                        <CardContent>
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <SyncAltIcon fontSize="small" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Import + konwersja kosztów
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Importujemy czasy z Clockify i mapujemy je na realne pozycje kosztowe (słowniki + przypisania).
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
                        <CardContent>
                            <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <QueryStatsIcon fontSize="small" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Raporty przekrojowe
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Raporty per klient / produkt / projekt / okres oraz metryki wydajności pracowników — bez ręcznego sklejania arkuszy.
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Stack>
    )
};

export default AppWorkflow;