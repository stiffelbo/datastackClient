import {
    Alert,
    Box,
    Button,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import OutputIcon from "@mui/icons-material/Output";

function countLogs(result, key) {
    return Array.isArray(result?.report?.[key])
        ? result.report[key].length
        : 0;
}

function SaveResultSummary({ result, onClear, sx = {} }) {
    const operationCount = countLogs(result, "operationLogs");
    const machineCount = countLogs(result, "machineLogs");
    const materialCount = countLogs(result, "materialLogs");
    const outputCount = countLogs(result, "outputLogs");

    const total =
        operationCount +
        machineCount +
        materialCount +
        outputCount;

    return (
        <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon />}
            sx={{
                borderRadius: 2,
                alignItems: "center",
                cursor: "pointer",
                ...sx,
            }}
            onClick={onClear}
        >
            <Stack spacing={1}>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Raport zapisany pomyślnie
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                        Utworzono {total} wpisów. Kliknij, aby wyczyścić komunikat.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <Chip
                        size="small"
                        icon={<AccessTimeIcon />}
                        label={`Czasy pracy: ${operationCount}`}
                    />

                    <Chip
                        size="small"
                        icon={<PrecisionManufacturingIcon />}
                        label={`Maszyny: ${machineCount}`}
                    />

                    <Chip
                        size="small"
                        icon={<Inventory2Icon />}
                        label={`Materiały: ${materialCount}`}
                    />

                    <Chip
                        size="small"
                        icon={<OutputIcon />}
                        label={`Wydania: ${outputCount}`}
                    />
                </Stack>
            </Stack>
        </Alert>
    );
}

export default SaveResultSummary;