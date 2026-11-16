
import React, { useMemo, useState } from "react";

import {
    Box,
    Paper,
    Stack,
    Typography,
    Divider,
    Collapse,
    IconButton,
    CircularProgress,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";

import { useForm } from "../../components/powerTable/form/useForm";
import { normalizeSchema } from "../../components/powerTable/form/schemaUtils";
import { validatorDefault } from "../../components/powerTable/form/validator";
import { createRenderInput } from "../../components/common/RenderInput";
import { copyToClipboard } from "../../utils/copyToClipboard";

import FormActionsBar from "../../components/common/FormActionsBar";
import ProductOrderHeader from "./ProductOrderHeader";
import ProductionCardPrint from "./ProductionCardPrint";

// ---------------------------------------------------------
// Layout
// ---------------------------------------------------------

const grid = columns => ({
    display: "grid",
    gridTemplateColumns: {
        xs: "minmax(0, 1fr)",
        sm: `repeat(${Math.min(columns, 2)}, minmax(0, 1fr))`,
        lg: `repeat(${columns}, minmax(0, 1fr))`,
    },
    gap: 1.25,
    alignItems: "start",
});

const fieldSx = {
    minWidth: 0,
    "& .MuiInputBase-root": {
        fontSize: 12.5,
    },
    "& .MuiInputLabel-root": {
        fontSize: 12.5,
    },
};

const Section = ({
    title,
    icon: Icon,
    children,
    collapsible = false,
    defaultOpen = true,
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 1.5,
                overflow: "hidden",
            }}
        >
            <Box
                onClick={collapsible ? () => setOpen(v => !v) : undefined}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    cursor: collapsible ? "pointer" : "default",
                    "&:hover": collapsible ? {
                        bgcolor: "action.hover",
                    } : {},
                }}
            >
                <Icon sx={{ fontSize: 17, color: "text.secondary" }} />

                <Typography
                    variant="subtitle2"
                    sx={{ fontSize: 12.5, fontWeight: 700 }}
                >
                    {title}
                </Typography>

                <Box sx={{ flex: 1 }} />

                {collapsible && (
                    <IconButton
                        size="small"
                        sx={{
                            p: 0.25,
                            transform: open ? "rotate(180deg)" : "none",
                            transition: "transform 150ms",
                        }}
                    >
                        <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            <Collapse in={open} unmountOnExit={false}>
                <Divider />
                <Box sx={{ p: 1.5 }}>
                    {children}
                </Box>
            </Collapse>
        </Paper>
    );
};

// ---------------------------------------------------------
// ProductOrderEditForm
// ---------------------------------------------------------

const ProductOrderEditForm = ({ id, row, rwd, entity, dashboard }) => {
    const schema = useMemo(
        () => normalizeSchema(entity.schema.editForm.schema),
        [entity.schema.editForm.schema]
    );

    const form = useForm({
        data: row,
        schema,
        mode: "edit",
        validator: validatorDefault,
        onSubmit: data => entity.update(id, data),
        sendFormData: false,
        addons: null,
    });

    const renderInput = createRenderInput(form);

    const onCancel = () => {
        dashboard.setCurrentId(null);
        dashboard.setTab(null);
    };

    const handleSubmit = () => {
        if (!form.isValid || !form.isChanged || entity.loading) return;
        entity.update(id, form.formState);
    };

    if (entity.loading && !row) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    const optima = `${row.id} ${row.order_number} ${row.design}`;

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
            }}
        >

            {/* PRODUKT */}
            <ProductOrderHeader
                id={id}
                data={row}
                onNumberChange={val => entity.updateField({id: id,field: 'order_number', value: val})}
            />

            {/* ZAMÓWIENIE + ILOŚCI */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        lg: "1.4fr 1fr",
                    },
                    gap: 1.25,
                    alignItems: "start",
                }}
            >
                <Section title="Dane zamówienia" icon={Inventory2OutlinedIcon}>
                    <Box sx={grid(2)}>
                        {renderInput("order_type_id", {}, fieldSx)}
                        {renderInput("contractor_id", {}, fieldSx)}
                        {renderInput("customer_order_number", {}, fieldSx)}
                        {renderInput("packing_method_id", {}, fieldSx)}
                        {renderInput("structure_id", {}, fieldSx)}
                        {renderInput("status_id", {}, fieldSx)}
                    </Box>

                    <Divider sx={{ my: 1.25 }} />

                    <Box sx={grid(2)}>
                        {renderInput("is_active", {}, fieldSx)}
                        {renderInput("is_gmi", {}, fieldSx)}
                    </Box>
                </Section>

                <Section title="Nakład i realizacja" icon={FactoryOutlinedIcon}>
                    <Box sx={grid(2)}>
                        {renderInput("qty_ordered", {}, fieldSx)}
                        {renderInput("qty_to_do", {}, fieldSx)}
                        {renderInput("qty_done", {}, fieldSx)}
                        {renderInput("qty_dispatched", {}, fieldSx)}
                        {renderInput("qty_invoiced", {}, fieldSx)}
                    </Box>

                    <Divider sx={{ my: 1.25 }} />

                    <Stack direction="row" spacing={3}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Wydano na produkcję
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                                {Number(row?.qty_issued || 0).toLocaleString("pl-PL")} szt.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Przyjęto z produkcji
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>
                                {Number(row?.qty_received || 0).toLocaleString("pl-PL")} szt.
                            </Typography>
                        </Box>
                    </Stack>
                </Section>
            </Box>

            {/* TERMINY */}
            <Section title="Terminy realizacji" icon={CalendarMonthOutlinedIcon}>
                <Box sx={{...grid(4), mb: 2}}>
                    {renderInput("coin_received_date", {}, fieldSx)}
                    {renderInput("deadline", {}, fieldSx)}
                    {renderInput("production_date", {}, fieldSx)}
                    {renderInput("dispatch_date", {}, fieldSx)}
                </Box>
                <Box sx={grid(4)}>
                    {renderInput("production_request_date", {}, fieldSx)}
                    {renderInput("entrance_control_date", {}, fieldSx)}
                    {renderInput("production_start_date", {}, fieldSx)}
                    {renderInput("production_completion_date", {}, fieldSx)}
                </Box>
            </Section>

            {/* ODPOWIEDZIALNOŚĆ */}
            <Section
                title="Odpowiedzialność"
                icon={PeopleOutlineIcon}
                collapsible
                defaultOpen={true}
            >
                <Box sx={grid(3)}>
                    {renderInput("reporter_id", {}, fieldSx)}
                    {renderInput("assignee_id", {}, fieldSx)}
                </Box>
            </Section>

            {/* UWAGI */}
            <Section
                title="Uwagi i informacje dodatkowe"
                icon={NotesOutlinedIcon}
                collapsible
                defaultOpen={true}
            >
                <Stack spacing={1.25}>
                    {renderInput("notes", { rows: 3 }, fieldSx)}
                </Stack>
            </Section>

            <Typography
                variant="subtitle2"
                onClick={() => copyToClipboard(optima)}
                sx={{ cursor: 'pointer', overflowWrap: 'anywhere', '&:hover': { opacity: 0.7 } }}
                title="Kliknij, aby skopiować ścieżkę"
            >
                {optima}
            </Typography>

            {/* AKCJE */}
            <Paper
                variant="outlined"
                sx={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 5,
                    bgcolor: "background.paper",
                    borderRadius: 1.5,
                    p: 1,
                }}
            >
                <FormActionsBar
                    onSubmit={handleSubmit}
                    onCancel={onCancel}
                    disabled={!form.isValid || !form.isChanged || entity.loading}
                    loading={entity.loading}
                />
            </Paper>
        </Box>
    );
};

export default ProductOrderEditForm;
