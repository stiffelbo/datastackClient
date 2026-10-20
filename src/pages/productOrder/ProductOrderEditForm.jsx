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
    Grid,
    Divider
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
import { createRenderInput } from "../../components/common/RenderInput";

import CollapsibleSection from "../../components/common/CollapsibleSection";

import SectionCard from "../../components/common/SectionCard";
import ReadonlyField from "../../components/common/ReadonlyField";
import FormActionsBar from "../../components/common/FormActionsBar";
import JiraDescription from "../../components/common/jiraDescription/JiraDescription";

const renderLoading = () => (
    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
    </Box>
);

const ProductOrderEditForm = ({ id, row, rwd, entity, dashboard }) => {
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

    const renderInput = createRenderInput(form);

    return (
        <Box sx={{ width: "100%", minWidth: '100%'}}>

            {/* ZLECENIE */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Zlecenie
            </Typography>

            {/* Aktywność / typ / numer zlecenia / RO */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "0.25fr 1fr 1fr 1fr",
                gap: 2,
                alignItems: "start",
                mb: 2,
            }}>
                {renderInput("is_active")}
                {renderInput("order_type_id")}
                {renderInput("order_number")}
                {renderInput("customer_order_number")}
            </Box>

            {/* Produkt / klient / zamówienie klienta */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr",
                gap: 2,
                alignItems: "start",
                mb: 2,
            }}>
                {renderInput("contractor_id")}
                {renderInput("structure_id")}
                {renderInput("is_gmi")}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* NAKŁAD I REALIZACJA */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Nakład i realizacja
            </Typography>

            {/* Ilości */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 2,
                alignItems: "start",
                mb: 2,
            }}>
                {renderInput("qty_ordered")}
                {renderInput("qty_to_do")}
                {renderInput("qty_done")}
                {renderInput("qty_dispatched")}
            </Box>

            {/* Pakowanie / ostatni proces */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                alignItems: "start",
                mb: 3,
            }}>
                {renderInput("packing_method_id")}
                {renderInput("last_process_id")}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* KLUCZOWE TERMINY */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Terminy realizacji
            </Typography>

            {/* Tak jak w Gemie: otrzymanie / deadline / produkcja / wysyłka */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 2,
                alignItems: "start",
                mb: 3,
            }}>
                {renderInput("coin_received_date")}
                {renderInput("deadline")}
                {renderInput("production_date")}
                {renderInput("dispatch_date")}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* PRZEBIEG PRODUKCJI */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Przebieg produkcji
            </Typography>

            {/* Przygotowanie produkcji */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 2,
                alignItems: "start",
                mb: 2,
            }}>
                {renderInput("production_request_date")}
                {renderInput("production_card_printed_at")}
                {renderInput("entrance_control_date")}
            </Box>

            {/* Realizacja produkcji */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                alignItems: "start",
                mb: 3,
            }}>
                {renderInput("production_start_date")}
                {renderInput("production_completion_date")}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* ODPOWIEDZIALNOŚĆ I STATUS */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Odpowiedzialność i status
            </Typography>

            <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 2,
                alignItems: "start",
                mb: 3,
            }}>
                {renderInput("reporter_id")}
                {renderInput("assignee_id")}
                {renderInput("status_id")}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* UWAGI */}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Uwagi
            </Typography>

            <Box sx={{ mb: 3 }}>
                {renderInput("notes", { rows: 4 })}
            </Box>

            {/* AKCJE */}
            <FormActionsBar
                onSubmit={form.submit}
                onCancel={onCancel}
                disabled={!form.isValid || !form.isChanged || entity.loading}
                loading={entity.loading}
            />

        </Box>
    );
}

export default ProductOrderEditForm;