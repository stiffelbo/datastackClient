
import React, {useCallback, useEffect, useState} from "react";

import http from "../../../http";
import useEntity from "../../../hooks/useEntity";

// MUI imports
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";

// Components
import PowerTable from "../../../components/powerTable/powerTable";
import Manual from "../../../components/Manual";
import BilansSummary from "./BilansSummary";

const VIEW_MODE = {
    SUMMARY: "summary",
    COSTS: "costs",
};


const Bilans = ({data, rwd}) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState(VIEW_MODE.SUMMARY);

    const entity = useEntity({
        entityName: "JiraIssueCosts",
        schemaOnly: "true",
        endpoint: "/jira_issue_costs/",
    });

    const fetchBilans = useCallback(async (id) => {
        if (!id) {
            setReport(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await http.get(
                `/jira_issue_costs/get.php?id=${id}`
            );

            setReport(response.data);
        } catch (err) {
            if (err.response) {
                setError(
                    err.response.data?.message
                    || `Błąd ${err.response.status}`
                );
            } else if (err.request) {
                setError("Brak odpowiedzi z serwera.");
            } else {
                setError(
                    err.message
                    || "Wystąpił nieznany błąd."
                );
            }

            setReport(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBilans(data?.id);
    }, [data?.id, fetchBilans]);

    const renderNavigation = () => (
        <Paper
            variant="outlined"
            sx={{
                p: 1,
                borderRadius: 2,
            }}
        >
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={2}
                alignItems={{
                    xs: "stretch",
                    sm: "center",
                }}
                justifyContent="space-between"
            >
                <Box sx={{px: 1}}>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        Rozliczenie projektu
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Podsumowanie finansowe i szczegółowe pozycje kosztowe
                    </Typography>
                </Box>

                <ButtonGroup
                    variant="outlined"
                    aria-label="Wybór widoku bilansu"
                    size="small"
                >
                    <Button
                        startIcon={<AssessmentRoundedIcon/>}
                        size="small"
                        variant={
                            mode === VIEW_MODE.SUMMARY
                                ? "contained"
                                : "outlined"
                        }
                        onClick={() => {
                            setMode(VIEW_MODE.SUMMARY);
                        }}
                    >
                        Karta bilansowa
                    </Button>

                    <Button
                        startIcon={<TableRowsRoundedIcon/>}
                        size="small"
                        variant={
                            mode === VIEW_MODE.COSTS
                                ? "contained"
                                : "outlined"
                        }
                        onClick={() => {
                            setMode(VIEW_MODE.COSTS);
                        }}
                    >
                        Tabela kosztów
                    </Button>
                </ButtonGroup>
            </Stack>
        </Paper>
    );

    const renderLoading = () => (
        <Box
            sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 240,
            }}
        >
            <Stack
                spacing={2}
                alignItems="center"
            >
                <CircularProgress size={32}/>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Pobieranie danych rozliczenia...
                </Typography>
            </Stack>
        </Box>
    );

    const renderError = () => (
        <Alert
            severity="error"
            action={
                data?.id
                    ? (
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => fetchBilans(data.id)}
                        >
                            Ponów
                        </Button>
                    )
                    : null
            }
        >
            {error}
        </Alert>
    );

    const renderEmptyState = () => (
        <Alert severity="info">
            Brak danych rozliczenia dla wybranego projektu.
        </Alert>
    );

    const renderSummary = () => (
        <Box
            sx={{
                minHeight: 0,
                overflow: "auto",
                pr: 0.5,
            }}
        >
            <BilansSummary data={report}/>
        </Box>
    );

    const renderCostsTable = () => (
        <Box
            sx={{
                flex: 1,
                minHeight: 0,
            }}
        >
            <PowerTable
                data={report?.costs ?? []}
                height={rwd?.height - 272}
                entityName="JiraIssueBilans"
                columnSchema={entity.schema?.columns ?? []}
                loading={loading}
                onRefresh={() => fetchBilans(data?.id)}
            />
        </Box>
    );

    const renderContent = () => {
        if (loading && !report) {
            return renderLoading();
        }

        if (error) {
            return renderError();
        }

        if (!report) {
            return renderEmptyState();
        }

        if (mode === VIEW_MODE.COSTS) {
            return renderCostsTable();
        }

        return renderSummary();
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                height: "100%",
                minHeight: 0,
                position: "relative",
            }}
        >
            {renderNavigation()}

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                }}
            >
                {renderContent()}
            </Box>
        </Box>
    );
};

export default Bilans;

