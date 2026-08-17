import React from "react";

import {
    Alert,
    FormControlLabel,
    Paper,
    Stack,
    Switch,
    TextField,
} from "@mui/material";

const EntityQueryPresetMetadata = ({
    value = null,
    disabled = false,
    errors = {},
    onChange = () => {},
}) => {
    const metadata = {
        name: String(value?.name ?? ""),
        description: String(value?.description ?? ""),
        isPublic: Boolean(value?.isPublic),
    };

    const nameError = String(errors?.name ?? "");
    const descriptionError = String(errors?.description ?? "");

    const updateField = (field, fieldValue) => {
        onChange({
            ...metadata,
            [field]: fieldValue,
        });
    };

    return (
        <Paper
            elevation={0}
            square
            sx={{
                width: "100%",
                minWidth: 0,
                bgcolor: "transparent",
            }}
        >
            <Stack
                spacing={1.5}
                sx={{
                    px: 1.5,
                    py: 1.25,
                }}
            >
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                >
                    <TextField
                        fullWidth
                        required
                        size="small"
                        label="Nazwa presetu"
                        value={metadata.name}
                        disabled={disabled}
                        error={nameError !== ""}
                        helperText={nameError}
                        onChange={(event) => updateField("name", event.target.value)}
                    />

                    <FormControlLabel
                        label="Publiczny"
                        sx={{
                            flexShrink: 0,
                            mr: 0,
                        }}
                        control={
                            <Switch
                                checked={metadata.isPublic}
                                disabled={disabled}
                                onChange={(event) => updateField("isPublic", event.target.checked)}
                            />
                        }
                    />
                </Stack>

                <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={5}
                    size="small"
                    label="Opis"
                    value={metadata.description}
                    disabled={disabled}
                    error={descriptionError !== ""}
                    helperText={descriptionError}
                    onChange={(event) => updateField("description", event.target.value)}
                />

                {(nameError !== "" || descriptionError !== "") && (
                    <Alert
                        severity="error"
                        icon={false}
                        sx={{
                            py: 0.5,
                            px: 1,
                        }}
                    >
                        Popraw metadane presetu przed zapisaniem.
                    </Alert>
                )}
            </Stack>
        </Paper>
    );
};

export default EntityQueryPresetMetadata;