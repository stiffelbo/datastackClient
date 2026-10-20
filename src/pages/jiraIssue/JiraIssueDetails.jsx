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
import LinkIcon from '@mui/icons-material/Link';

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
import {createRenderInput} from "../../components/common/RenderInput";

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

const resolveFieldAccess = ({ name, access }) => {
    if (!name) return false;
    if (!access?.view_restricted_fields) {
        return true;
    } else {
        const restrictedFields = `${access?.view_restricted_fields}`.split(',');
        const isRestricted = restrictedFields.includes(name);
        return isRestricted ? false : true;
    }
}

const JiraIssueDetails = ({ id, row, rwd, entity, dashboard }) => {
    const schema = normalizeSchema(entity.schema.editForm.schema);
    const mainAccess = entity.schema.access || {};
    const access = mainAccess.page || {}
    
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

    const renderInput = createRenderInput(form);

    // zamiast getField(schema, name)
    const field = form.getField(name);

    // zamiast getErrorText(form.errors, name)
    const errorsText = form.getErrorText(name);

    const isOrder = `${row.is_order}` === '1';

    return (
        <Box sx={{ width: "100%", maxWidth: "100%", p: 2 }}>
            <Row gap={2} align="flex-start">
                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                    {form.formState.jira_project_label || "—"}
                    {" / "}
                    {form.formState.jira_parent_key || form.formState.jira_key || "—"}
                    {form.formState.jira_parent_key ? ` / ${form.formState.jira_key || ""}` : ""}
                </Typography>
                <RenderLink id={id} title={`Strona ${form.formState.jira_key}`} />
                <RenderLink baseUrl="https://germaniamint.atlassian.net/browse/" id={form.formState.jira_key} title={"Link do jiry"} icon={<LinkIcon />} />
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
                        {renderInput("structure_id")}


                    </CollapsibleSection>

                    <CollapsibleSection title="Ilości" defaultOpen={true} show={isOrder}>

                        <Row>
                            {renderInput("qty_ordered")}
                            {renderInput("qty_to_do")}
                            {renderInput("qty_done")}
                        </Row>
                        <Row>
                            {renderInput("qty_invoiced")}
                            {renderInput("qty_dispatched")}
                        </Row>
                    </CollapsibleSection>

                    <CollapsibleSection title="Finanse" defaultOpen={true} show={isOrder}>
                        {resolveFieldAccess({ name: "ro_nr", access }) ? renderInput("ro_nr") : null}
                        {resolveFieldAccess({ name: "design_price", access }) ? renderInput("design_price") : null}
                        {resolveFieldAccess({ name: "setup_price", access }) ? renderInput("setup_price") : null}
                        {resolveFieldAccess({ name: "unit_price", access }) ? renderInput("unit_price") : null}
                        {resolveFieldAccess({ name: "currency", access }) ? renderInput("currency") : null}
                        {resolveFieldAccess({ name: "conversion_rate", access }) ? renderInput("conversion_rate") : null}
                        {resolveFieldAccess({ name: "budget_net", access }) ? renderInput("budget_net") : null}
                        {resolveFieldAccess({ name: "planned_margin_pct", access }) ? renderInput("planned_margin_pct") : null}
                        {resolveFieldAccess({ name: "planned_revenue_net", access }) ? renderInput("planned_revenue_net") : null}
                        {resolveFieldAccess({ name: "committed_costs_net", access }) ? renderInput("committed_costs_net") : null}
                        {resolveFieldAccess({ name: "invoiced_revenue_net", access }) ? renderInput("invoiced_revenue_net") : null}
                        {resolveFieldAccess({ name: "cash_received_net", access }) ? renderInput("cash_received_net") : null}
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
                    <CollapsibleSection title="Daty Operacyjne" defaultOpen={true} show={isOrder}>
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