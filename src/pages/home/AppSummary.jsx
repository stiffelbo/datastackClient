import * as React from "react";
import {
    Box,
    Typography,
    Stack,
    Paper,
    Divider,
    Chip,
} from "@mui/material";

import InsightsIcon from "@mui/icons-material/Insights";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PaidIcon from "@mui/icons-material/Paid";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LinkIcon from "@mui/icons-material/Link";
import TuneIcon from "@mui/icons-material/Tune";
import SecurityIcon from '@mui/icons-material/Security';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const FeatureRow = ({ icon, title, desc }) => (
    <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
        <Box
            sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "action.hover",
                flex: "0 0 auto",
            }}
        >
            {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {desc}
            </Typography>
        </Box>
    </Box>
);

const AppSummary = ({ title = "DataStack" }) => {
    return (
        <Box
            component="section"
            sx={{
                mb: 4,
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: { xs: "wrap", md: "nowrap" },
                alignItems: "stretch",
            }}
        >
            {/* LEFT: copy */}
            <Box sx={{ width: { xs: "100%", md: "35%", pl: 2 } }}>
                <Stack spacing={1.25}>
                    <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.12 }}>
                        Rozliczenia tasków pod kontrolą.
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
                        {title} to baza na wszystko, co wykracza poza sam workflow taska — dane liczbowe,
                        koszty, czasy pracy i informacje, które dziś lądują w załącznikach lub arkuszach Excel.
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
                        Jira zostaje do pracy i komunikacji. {title} zbiera i porządkuje liczby —
                        tak, żeby każdy task miał jeden, spójny kontekst kosztowy i budżetowy.
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pt: 0.5 }}>
                        <Chip size="small" icon={<PaidIcon />} label="Koszty per task" variant="outlined" />
                        <Chip size="small" icon={<AccessTimeIcon />} label="Czas pracy per task" variant="outlined" />
                        <Chip size="small" icon={<InsightsIcon />} label="Raporty przekrojowe" variant="outlined" />
                    </Box>
                </Stack>
            </Box>

            {/* RIGHT: alert-like card */}
            <Box sx={{ width: { xs: "100%", md: "65%" } }}>
                <Paper
                    variant="outlined"
                    sx={{
                        height: "100%",
                        borderRadius: 3,
                        p: { xs: 2, md: 2.25 },
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* subtle accent bar */}
                    <Box
                        sx={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 6,
                            backgroundImage:
                                "linear-gradient(180deg, rgba(37,99,235,0.95), rgba(29,78,216,0.65), rgba(15,118,110,0.7))",
                        }}
                    />

                    <Stack spacing={1.25} sx={{ pl: 1.25 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <InsightsIcon fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                                Jedno miejsce, gdzie taski dostają wymiar liczbowy: budżet, koszty i czas.
                            </Typography>
                        </Box>
                        <Stack spacing={1.4}>
                            <FeatureRow
                                icon={<LinkIcon fontSize="small" />}
                                title="Link z Jira do widoku danych"
                                desc="Przy tasku masz stały link do jego kontekstu kosztowego i budżetowego w DataStack."
                            />
                            <FeatureRow
                                icon={<AccountTreeIcon fontSize="small" />}
                                title="Katalogowanie tasków z bilansem"
                                desc="Porządek projektowy: grupowanie, relacje i spójne przypisania pod raporty."
                            />
                            <FeatureRow
                                icon={<AccessTimeIcon fontSize="small" />}
                                title="Czasy pracy + koszty w jednym miejscu"
                                desc="Clockify i koszty operacyjne spięte per task — bez załączników i ręcznego sklejania."
                            />
                            <FeatureRow
                                icon={<TuneIcon fontSize="small" />}
                                title="Konfigurowalne definicje"
                                desc="Słowniki i zasady: okresy, pracownicy, pozycje kosztowe, budżety — pod Wasz sposób pracy."
                            />
                            <FeatureRow
                                icon={<PaidIcon fontSize="small" />}
                                title="Dane przychodowe i budżetowe"
                                desc="Rozszerzasz definicję taska o liczby: plan, budżet, przychód, odchylenia."
                            />
                            <FeatureRow
                                icon={<SecurityIcon fontSize="small" />}
                                title="Kontrola dostępu do danych"
                                desc="Dostępy do projektów i danych oparte o role i przypisania — każdy widzi tylko to, co jest dla niego przeznaczone."
                            />
                            <FeatureRow
                                icon={<DashboardCustomizeIcon fontSize="small" />}
                                title="Konfigurowalne interfejsy i raporty"
                                desc="Widoki i raporty dopasowane do roli i potrzeb — od operacyjnych zestawień po przekrojowe raporty zarządcze."
                            />
                            <FeatureRow
                                icon={<FileDownloadIcon fontSize="small" />}
                                title="Eksport danych"
                                desc="Eksport zestawień i danych źródłowych do dalszej analizy lub integracji z innymi narzędziami."
                            />
                        </Stack>

                        <Divider />

                        <Typography variant="caption" color="text.secondary">
                            komentarze i workflow zostają w Jira. Liczby i koszty — w {title}.
                        </Typography>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    );
};

export default AppSummary;
