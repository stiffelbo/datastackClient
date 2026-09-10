import React, { useState } from "react";
import {
    Alert,
    AlertTitle,
    Box,
    Collapse,
    Typography,
} from "@mui/material";

const MissingReportsWarning = ({ report }) => {
    const [open, setOpen] = useState(true);

    if (
        !report ||
        !report.hasMissing ||
        Number(report.isManager) === 1 ||
        !report.missingDays?.length
    ) {
        return null;
    }

    return (
        <Collapse
            in={open}
            timeout={400}
            unmountOnExit
        >
            <Alert
                severity="warning"
                variant="filled"
                onClose={() => setOpen(false)}
                sx={{
                    mb: 2,
                    position: "sticky",
                    top: 0,
                    zIndex: 1300,

                    animation: "warningPulse 2.5s ease-in-out infinite",

                    "@keyframes warningPulse": {
                        "0%, 100%": {
                            transform: "scale(1)",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        },
                        "50%": {
                            transform: "scale(1.008)",
                            boxShadow: "0 5px 16px rgba(0,0,0,0.28)",
                        },
                    },
                }}
            >
                <AlertTitle>
                    Masz nieuzupełniony czas pracy
                </AlertTitle>

                <Typography variant="body2" sx={{ mb: 1 }}>
                    Uzupełnij raport czasu pracy dla poniższych dni:
                </Typography>

                <Box
                    component="ul"
                    sx={{
                        m: 0,
                        pl: 2.5,
                    }}
                >
                    {report.missingDays.map((day) => (
                        <li key={day.date}>
                            <strong>{day.date}</strong>
                            {" — "}
                            brakuje{" "}
                            {Number(day.unreportedHours).toFixed(2)} h
                        </li>
                    ))}
                </Box>
            </Alert>
        </Collapse>
    );
};

export default MissingReportsWarning;