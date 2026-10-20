import React from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    FormControl,
    FormHelperText,
    InputLabel,
    Select,
    ListSubheader,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import {
    normalizeOptions,
    normalizeDateInputValue,
    normalizeDateTimeLocalInputValue,
} from "../powerTable/form/utils";

export const createRenderInput = (form) => {
    return (name, overrides = {}, sx = {}) => {
        const field = form.getField(name);
        if (!field) return null;
        const merged = { ...field, ...overrides };
        const value = form.formState[name];
        const errorsText = form.getErrorText(name);

        switch (merged.type) {
            case "date":
                return (
                    <Box fullWidth sx={{...sx}}>
                        <TextField
                            lang="pl"
                            fullWidth
                            size="small"
                            type="date"
                            label={merged.label}
                            value={normalizeDateInputValue(value)}
                            onChange={(e) => form.setField(name, e.target.value)}
                            error={!!errorsText}
                            helperText={errorsText || merged.helperText}
                            InputLabelProps={{ shrink: true }}
                            disabled={merged.disabled}
                        />
                    </Box>

                );

            case "datetime":
            case "datetime-local":
                return (
                    <Box fullWidth sx={{...sx}}>
                        <TextField
                            fullWidth
                            size="small"
                            type="datetime-local"
                            label={merged.label}
                            value={normalizeDateTimeLocalInputValue(value)}
                            onChange={(e) => form.setField(name, e.target.value)}
                            error={!!errorsText}
                            helperText={errorsText || merged.helperText}
                            InputLabelProps={{ shrink: true }}
                            disabled={merged.disabled}
                        />
                    </Box>
                );

            case "number":
                return (
                    <Box fullWidth sx={{...sx}}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label={merged.label}
                            value={value ?? ""}
                            onChange={(e) => {
                                const raw = e.target.value;
                                const normalized =
                                    typeof raw === "string" ? raw.replace(",", ".") : raw;

                                form.setField(
                                    name,
                                    normalized === "" ? "" : Number(normalized),
                                    { runValidate: true, raw: true }
                                );
                            }}
                            error={!!errorsText}
                            helperText={errorsText || merged.helperText}
                            InputLabelProps={{ shrink: true }}
                            disabled={merged.disabled}
                            inputProps={{
                                step: merged.step ?? 1,
                                min: merged.min,
                                max: merged.max,
                            }}
                        />
                    </Box>
                );

            case "select":
            case "select-object": {
                const opts = normalizeOptions(merged.selectOptions || []);

                const groupedOptions = opts.reduce((acc, opt) => {
                    const groupName = opt.group || '';
                    if (!acc[groupName]) acc[groupName] = [];
                    acc[groupName].push(opt);
                    return acc;
                }, {});

                return (
                    <Box fullWidth sx={{...sx}}>
                        <FormControl fullWidth error={!!errorsText} disabled={field.disabled}>
                            <InputLabel id={`${field.name}-label`}>
                                {field.label}
                            </InputLabel>

                            <Select
                                labelId={`${field.name}-label`}
                                name={field.name}
                                label={field.label}
                                value={
                                    typeof value === 'undefined' || value === null
                                        ? ''
                                        : value
                                }
                                onChange={(e) => {
                                    const val = e.target.value;
                                    form.setField(field.name, val);
                                }}
                                size={field.size || 'small'}
                                {...(field.selectProps || {})}
                            >

                                <MenuItem value="">
                                    {`-- ${field.label || 'Wybierz'} --`}
                                </MenuItem>


                                {Object.entries(groupedOptions).flatMap(([groupName, groupItems]) => {
                                    const items = [];

                                    if (groupName) {
                                        items.push(
                                            <ListSubheader key={`group-${groupName}`} disableSticky>
                                                {groupName}
                                            </ListSubheader>
                                        );
                                    }

                                    groupItems.forEach((opt) => {
                                        items.push(
                                            <MenuItem
                                                key={`opt-${opt.value}`}
                                                value={opt.value}
                                                disabled={opt.disabled}
                                                title={opt.title || ''}
                                            >
                                                {opt.label}
                                            </MenuItem>
                                        );
                                    });

                                    return items;
                                })}
                            </Select>

                            {errorsText ? <FormHelperText>{errorsText}</FormHelperText> : null}
                        </FormControl>
                    </Box>

                );
            }

            case "textarea":
                return (
                    <Box fullWidth sx={{...sx}}>
                        <TextField
                            fullWidth
                            multiline
                            rows={merged.rows || 5}
                            size="small"
                            label={merged.label}
                            value={value ?? ""}
                            onChange={(e) => form.setField(name, e.target.value)}
                            error={!!errorsText}
                            helperText={errorsText || merged.helperText}
                            InputLabelProps={{ shrink: true }}
                            disabled={merged.disabled}
                        />
                    </Box>

                );

            case "bool":
            case "boolean": {
                const normalizeIncoming = (v) => {
                    if (v === null || v === undefined || v === "") return null;
                    if (typeof v === "boolean") return v;
                    if (v === "true" || v === "1" || v === 1) return true;
                    if (v === "false" || v === "0" || v === 0) return false;
                    return null;
                };

                const toSelectValue = (v) => {
                    if (v === null) return "";
                    if (v === true) return "true";
                    return "false";
                };

                const normalized = normalizeIncoming(value);

                const handleChange = (e) => {
                    let v = e.target.value;

                    if (v === "") v = null;
                    if (v === "true") v = true;
                    if (v === "false") v = false;

                    form.setField(field.name, v);
                };

                const itemStyle = { display: "flex", alignItems: "center", gap: 1 };

                return (
                    <Box fullWidth sx={{...sx}}>
                        <FormControl fullWidth error={!!errorsText} disabled={field.disabled}>
                            <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>

                            <Select
                                labelId={`${field.name}-label`}
                                label={field.label}
                                value={toSelectValue(normalized)}
                                onChange={handleChange}
                                size="small"
                                variant="outlined"
                                fullWidth
                                error={!!errorsText}
                                title={errorsText || undefined}
                            >
                                <MenuItem value="">
                                    <Box sx={itemStyle}>
                                        <RemoveIcon
                                            fontSize="small"
                                            sx={{ color: "text.disabled" }}
                                        />
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            — Brak —
                                        </Typography>
                                    </Box>
                                </MenuItem>

                                <MenuItem value="true">
                                    <Box sx={itemStyle}>
                                        <CheckIcon fontSize="small" sx={{ color: "success.main" }} />
                                        <Typography variant="body2">Tak</Typography>
                                    </Box>
                                </MenuItem>

                                <MenuItem value="false">
                                    <Box sx={itemStyle}>
                                        <CloseIcon fontSize="small" sx={{ color: "error.main" }} />
                                        <Typography variant="body2">Nie</Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {errorsText ? (
                            <Typography variant="caption" color="error" sx={{ mt: 0.75 }}>
                                {errorsText}
                            </Typography>
                        ) : null}
                    </Box>
                );
            }

            default:
                return (
                    <Box fullWidth sx={{...sx}}>
                        <TextField
                            fullWidth
                            size="small"
                            label={merged.label}
                            value={value ?? ""}
                            onChange={(e) => form.setField(name, e.target.value)}
                            error={!!errorsText}
                            helperText={errorsText || merged.helperText}
                            InputLabelProps={{ shrink: true }}
                            disabled={merged.disabled}
                        />
                    </Box>
                );
        }
    };
};
