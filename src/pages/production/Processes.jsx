import React from "react";

import {
    Box,
    Button,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";

const Processes = ({
    onAddProcess,
    processes = [],
    loading = true
}) => {
    if(loading) return <LinearProgress />
    return (
        <Box
            sx={{
                height: "100%",
                overflow: "auto",
                borderRight: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="h6">
                    Procesy
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Kliknij proces, aby utworzyć task.
                </Typography>
            </Box>

            <Divider />

            <List disablePadding>
                {processes
                    .map(process => (
                        <ListItem
                            key={process.id}
                            divider
                            secondaryAction={
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() =>
                                        onAddProcess(process)
                                    }
                                >
                                    Dodaj
                                </Button>
                            }
                        >
                            <ListItemText
                                primary={process.name}
                                secondary={
                                    process.process_class
                                }
                            />
                        </ListItem>
                    ))}
            </List>
        </Box>
    );
};

export default Processes;