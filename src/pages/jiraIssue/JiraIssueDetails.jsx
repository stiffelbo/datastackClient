import React from "react";

import {
    Box,
    Typography,
    CircularProgress,
    TextField,
    MenuItem,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    Select,
    Switch,
    ListSubheader,
    Button,
    IconButton,
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useForm } from "../../components/powerTable/form/useForm";
import { normalizeSchema } from "../../components/powerTable/form/schemaUtils";
import validatorDefault from "../../components/powerTable/form/validator";
import {
    normalizeOptions,
    normalizeDateInputValue,
    normalizeDateTimeLocalInputValue,
} from "../../components/powerTable/form/utils";

import Row from "../../components/common/Row";
import Col from "../../components/common/Col";

import CollapsibleSection from "../../components/common/CollapsibleSection";

import SectionCard from "../../components/common/SectionCard";
import ReadonlyField from "../../components/common/ReadonlyField";
import FormActionsBar from "../../components/common/FormActionsBar";
import JiraDescription from "../../components/common/jiraDescription/JiraDescription";

import RenderLink from "./RenderLink";

const renderLabel = (id) => {
    if (!id) return "Edytuj Jira Issue";

    return (
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h6">Edytuj Jira Issue</Typography>
            <RenderLink id={id} />
        </Box>
    );
};

const renderLoading = () => (
    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
    </Box>
);


const JiraIssueDetails = ({ id, row, entity, dashboard }) => {

    console.log(row);

    const schema = normalizeSchema(entity.schema.editForm.schema);

    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    };

    const form = useForm({
        data: row,
        schema,
        mode: "edit",
        validator: validatorDefault,
        onSubmit: (data) => entity.update(id, data),
        sendFormData: false,
        addons: null,
    });

    if (entity.loading) {
        return renderLoading();
    }

    const renderReadonly = (name, options = {}) => {
        const field = form.getField(name);
        if (!field) return null;

        return (
            <Box mb={2} fullWidth>
                <ReadonlyField
                    label={options.label || field.label}
                    value={form.formState[name]}
                    variant={options.variant || "text"}
                    icon={options.icon || null}
                    chipProps={options.chipProps || {}}
                    formatter={options.formatter || null}
                />
            </Box>

        );
    };

    const renderADF = (name) => {
        return <JiraDescription value={form.formState[name]} emptyText="Brak Treści" />
    }

    const renderInput = (name, overrides = {}) => {
        const field = form.getField(name);
        if (!field) return null;

        const merged = { ...field, ...overrides };
        const value = form.formState[name];
        const errorsText = form.getErrorText(name);

        switch (merged.type) {
            case "date":
                return (
                    <Box mb={2} fullWidth>
                        <TextField
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
                    <Box mb={2} fullWidth>
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
                    <Box mb={2} fullWidth>
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

                return (
                    <Box mb={2}>
                        <FormControl fullWidth size="small" error={!!errorsText} mb={2}>
                            <InputLabel>{merged.label}</InputLabel>
                            <Select
                                label={merged.label}
                                value={value ?? ""}
                                onChange={(e) => form.setField(name, e.target.value)}
                                disabled={merged.disabled}
                            >
                                <MenuItem value="">-- {merged.label || "Wybierz"} --</MenuItem>
                                {opts.map((opt) => (
                                    <MenuItem
                                        key={`${name}-${opt.value}`}
                                        value={opt.value}
                                        disabled={opt.disabled}
                                    >
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                );
            }

            case "textarea":
                return (
                    <Box mb={2}>
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
                    <Box mb={2}>
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
                    <Box mb={2}>
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

    // zamiast getField(schema, name)
    const field = form.getField(name);

    // zamiast getErrorText(form.errors, name)
    const errorsText = form.getErrorText(name);

    return (
        <Box sx={{ width: "100%", maxWidth: "100%", p: 2 }}>
            <Row gap={2} align="flex-start">
                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                    {form.formState.jira_project_label || "—"}
                    {" / "}
                    {form.formState.jira_parent_key || form.formState.jira_key || "—"}
                    {form.formState.jira_parent_key ? ` / ${form.formState.jira_key || ""}` : ""}
                </Typography>
                <RenderLink id={id} />
            </Row>
            <Row>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {form.formState.name || "—"}
                </Typography>
            </Row>

            <Row gap={2} align="flex-start">
                <Col xs={12} md={7} xl={7}>
                    <CollapsibleSection title="Opis" defaultOpen>
                        {renderADF("description")}
                    </CollapsibleSection>

                    <CollapsibleSection title="Podstawowe / konfiguracja" defaultOpen>
                        <Row>
                            {renderReadonly("jira_issue_type", {
                                variant: "chip",
                                chipProps: { size: "small", variant: "outlined" },
                            })}
                            {renderReadonly("product_group")}
                            {renderInput("is_order")}
                        </Row>
                        {renderInput("jira_issue_groups_id")}
                        {renderInput("contractor_id")}
                        
                        
                    </CollapsibleSection>

                    <CollapsibleSection title="Ilości" defaultOpen={false}>
                        {renderInput("qty_ordered")}
                        <Row>
                            {renderInput("qty_to_do")}
                            {renderInput("qty_done")}
                        </Row>
                        <Row>
                            {renderInput("qty_invoiced")}
                            {renderInput("qty_dispatched")}
                        </Row>
                    </CollapsibleSection>

                    <CollapsibleSection title="Finanse" defaultOpen={false}>
                            {renderInput("ro_nr")}
                            {renderInput("design_price")}
                            {renderInput("setup_price")}
                            {renderInput("unit_price")}

                            {renderInput("currency")}
                            {renderInput("conversion_rate")}
                            {renderInput("budget_net")}

                            {renderInput("planned_margin_pct")}
                            {renderInput("planned_revenue_net")}
                            {renderInput("committed_costs_net")}

                            {renderInput("invoiced_revenue_net")}
                            {renderInput("cash_received_net")}
                    </CollapsibleSection>
                </Col>

                <Col xs={12} md={4} xl={4}>
                    <CollapsibleSection title="Status" defaultOpen={true}>
                        {renderInput("is_active")}
                        {renderReadonly("status")}
                        
                        {renderReadonly("jira_status_category", {
                            variant: "chip",
                            chipProps: { size: "small", color: "info", variant: "outlined" },
                        })}
                        {renderReadonly("created_at_jira")}
                        {renderReadonly("updated_at_jira")}

                        {renderReadonly("resolved_at_jira")}

                        {renderReadonly("jira_resolution")}
                    </CollapsibleSection>
                    <CollapsibleSection title="Daty Operacyjne" defaultOpen={true}>
                        {renderInput("receipt_date")}
                        {renderInput("production_request_date")}
                        {renderInput("start_date")}
                        {renderInput("end_date")}
                    </CollapsibleSection>
                    <CollapsibleSection title="Osoby" defaultOpen={true}>
                        {renderInput("reporter_id")}
                        {renderInput("assignee_id")}
                        {renderInput("production_manager_id")}
                        {renderInput("account_manager_id")}
                    </CollapsibleSection>
                    <CollapsibleSection title="Log / synchronizacja" defaultOpen={false}>
                        {renderReadonly("jira_synced_at")}
                    </CollapsibleSection>
                </Col>
            </Row>
            <FormActionsBar
                onSubmit={form.submit}
                onCancel={onCancel}
                disabled={!form.isValid || !form.isChanged || entity.loading}
                loading={entity.loading}
            />
        </Box >
    );
};

export default JiraIssueDetails;