import { Fragment, useMemo, useState } from 'react';
import {
    Box,
    Chip,
    Collapse,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Divider,
} from '@mui/material';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FactoryIcon from '@mui/icons-material/Factory';
import BusinessIcon from '@mui/icons-material/Business';
import BuildIcon from '@mui/icons-material/Build';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import FlagIcon from '@mui/icons-material/Flag';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import OutboundIcon from '@mui/icons-material/Outbound';
import GroupsIcon from '@mui/icons-material/Groups';
import NumbersIcon from '@mui/icons-material/Numbers';
import NotesIcon from '@mui/icons-material/Notes';
import MemoryIcon from '@mui/icons-material/Memory';
import InventoryIcon from '@mui/icons-material/Inventory';
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import StraightenIcon from '@mui/icons-material/Straighten';
import TagIcon from '@mui/icons-material/Tag';

import { useAuth } from '../../context/AuthContext';

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function isTruthyFlag(value) {
    return value === 1 || value === true || value === '1';
}

function processTypeLabel(process) {
    return isTruthyFlag(process?.is_general) ? 'Ogólny' : 'Produkcyjny';
}

function processTypeIcon(process) {
    return isTruthyFlag(process?.is_general)
        ? <FactoryIcon fontSize="small" />
        : <BusinessIcon fontSize="small" />;
}

function processTypeColor(process) {
    return isTruthyFlag(process?.is_general) ? 'default' : 'primary';
}

function ActiveChip({ active }) {
    return isTruthyFlag(active) ? (
        <Chip
            size="small"
            color="success"
            variant="outlined"
            icon={<ToggleOnIcon />}
            label="Aktywny"
        />
    ) : (
        <Chip
            size="small"
            color="default"
            variant="outlined"
            icon={<ToggleOffIcon />}
            label="Nieaktywny"
        />
    );
}
function MachineRow({ item, index }) {
    const details = item?.details ?? {};
    const foreignId = item?.machine_id;

    return (
        <TableRow key={`machine-${item?.id ?? foreignId ?? index}`} hover>
            <TableCell>{item?.id ?? '—'}</TableCell>
            <TableCell>{foreignId ?? '—'}</TableCell>
            <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                    <MemoryIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>
                        {details?.name ?? '—'}
                    </Typography>
                </Stack>
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <ActiveChip active={details?.is_active} />

                    {isTruthyFlag(details?.is_operational) ? (
                        <Chip
                            size="small"
                            color="success"
                            variant="outlined"
                            icon={<PowerIcon />}
                            label="Operacyjna"
                        />
                    ) : (
                        <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            icon={<PowerOffIcon />}
                            label="Przestój"
                        />
                    )}
                </Stack>
            </TableCell>
        </TableRow>
    );
}

function MaterialRow({ item, index }) {
    const details = item?.details ?? {};
    const foreignId = item?.material_id;

    return (
        <TableRow key={`material-${item?.id ?? foreignId ?? index}`} hover>
            <TableCell>{item?.id ?? '—'}</TableCell>
            <TableCell>{foreignId ?? '—'}</TableCell>
            <TableCell>
                <Stack spacing={0.25}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <InventoryIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                            {details?.name ?? '—'}
                        </Typography>
                    </Stack>

                    {details?.code ? (
                        <Typography variant="caption" color="text.secondary">
                            {details.code}
                        </Typography>
                    ) : null}
                </Stack>
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
                    <ActiveChip active={details?.is_active} />

                    {details?.unit ? (
                        <Chip
                            size="small"
                            color="info"
                            variant="outlined"
                            icon={<StraightenIcon />}
                            label={`Jednostka: ${details.unit}`}
                        />
                    ) : null}

                    {details?.category ? (
                        <Chip
                            size="small"
                            color="secondary"
                            variant="outlined"
                            icon={<TagIcon />}
                            label={details.category}
                        />
                    ) : null}
                </Stack>

                <Stack spacing={0.25}>
                    {details?.description ? (
                        <Typography variant="body2" color="text.secondary">
                            {details.description}
                        </Typography>
                    ) : null}

                    {details?.unit_weight && Number(details.unit_weight) > 0 ? (
                        <Typography variant="caption" color="text.secondary">
                            Waga j.: {details.unit_weight}
                        </Typography>
                    ) : null}
                </Stack>
            </TableCell>
        </TableRow>
    );
}

function ProcessFlags({ process }) {
    const chips = [];

    chips.push({
        key: 'active',
        label: isTruthyFlag(process?.is_active) ? 'Aktywny' : 'Nieaktywny',
        color: isTruthyFlag(process?.is_active) ? 'success' : 'default',
        icon: isTruthyFlag(process?.is_active)
            ? <ToggleOnIcon />
            : <ToggleOffIcon />,
    });

    if (isTruthyFlag(process?.is_setup)) {
        chips.push({
            key: 'setup',
            label: 'Setup',
            color: 'warning',
            icon: <BuildIcon />,
        });
    }

    if (isTruthyFlag(process?.is_design)) {
        chips.push({
            key: 'design',
            label: 'Design',
            color: 'secondary',
            icon: <DesignServicesIcon />,
        });
    }

    if (isTruthyFlag(process?.is_task)) {
        chips.push({
            key: 'task',
            label: 'Task',
            color: 'success',
            icon: <FlagIcon />,
        });
    }




    if (isTruthyFlag(process?.is_outsource)) {
        chips.push({
            key: 'outsource',
            label: 'Outsource',
            color: 'info',
            icon: <OutboundIcon />,
        });
    }

    if (isTruthyFlag(process?.requires_quantity)) {
        chips.push({
            key: 'requires_quantity',
            label: 'Wymaga ilości',
            color: 'warning',
            icon: <NumbersIcon />,
        });
    }

    if (isTruthyFlag(process?.requires_remarks)) {
        chips.push({
            key: 'requires_remarks',
            label: 'Wymaga uwag',
            color: 'secondary',
            icon: <NotesIcon />,
        });
    }

    if (isTruthyFlag(process?.is_task)) {
        const min = process?.min_persons ?? null;
        const max = process?.max_persons ?? null;

        if (min !== null || max !== null) {
            chips.push({
                key: 'persons_range',
                label: `Obsada: ${min ?? '—'}-${max ?? '—'}`,
                color: 'info',
                icon: <GroupsIcon />,
            });
        }
    }



    return (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {chips.map((chip) => (
                <Chip
                    key={chip.key}
                    size="small"
                    color={chip.color}
                    icon={chip.icon}
                    label={chip.label}
                    variant={chip.key === 'general' ? 'filled' : 'outlined'}
                />
            ))}
        </Stack>
    );
}

function TechItemsTable({ type, items }) {
    const normalizedItems = safeArray(items);
    const isMaterials = type === 'materials';

    return (
        <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                {isMaterials ? (
                    <Inventory2Icon fontSize="small" />
                ) : (
                    <PrecisionManufacturingIcon fontSize="small" />
                )}
                <Typography variant="subtitle2">
                    {isMaterials ? 'Materiały' : 'Maszyny'}
                </Typography>
                <Chip
                    size="small"
                    variant="outlined"
                    label={normalizedItems.length}
                />
            </Stack>

            {!normalizedItems.length ? (
                <Typography variant="body2" color="text.secondary">
                    Brak przypisanych elementów.
                </Typography>
            ) : (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 100 }}>ID relacji</TableCell>
                            <TableCell sx={{ width: 140 }}>
                                {isMaterials ? 'Material ID' : 'Machine ID'}
                            </TableCell>
                            <TableCell sx={{ width: 260 }}>
                                {isMaterials ? 'Materiał' : 'Maszyna'}
                            </TableCell>
                            <TableCell>
                                {isMaterials ? 'Parametry' : 'Status'}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {normalizedItems.map((item, index) =>
                            isMaterials ? (
                                <MaterialRow
                                    key={`material-${item?.id ?? item?.material_id ?? index}`}
                                    item={item}
                                    index={index}
                                />
                            ) : (
                                <MachineRow
                                    key={`machine-${item?.id ?? item?.machine_id ?? index}`}
                                    item={item}
                                    index={index}
                                />
                            )
                        )}
                    </TableBody>
                </Table>
            )}
        </Box>
    );
}

function ProcessRow({ row, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    const process = row?.details ?? {};
    const materials = safeArray(row?.materials);
    const machines = safeArray(row?.machines);

    return (
        <Fragment>
            <TableRow hover>
                <TableCell sx={{ width: 56 }}>
                    <IconButton
                        size="small"
                        onClick={() => setOpen((prev) => !prev)}
                        aria-label={open ? 'Zwiń proces' : 'Rozwiń proces'}
                    >
                        {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                    </IconButton>
                </TableCell>

                <TableCell sx={{ width: 150 }}>
                    <Chip
                        size="small"
                        color={processTypeColor(process)}
                        icon={processTypeIcon(process)}
                        label={processTypeLabel(process)}
                        variant="filled"
                    />
                </TableCell>

                <TableCell>
                    <Box>
                        <Typography variant="body2" fontWeight={700}>
                            {process?.name ?? 'Bez nazwy procesu'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {process?.structureName ?? 'Brak działu'}
                        </Typography>
                    </Box>
                </TableCell>

                <TableCell>
                    <Typography variant="caption" color="text.secondary">
                        {process?.description ?? 'Brak opisu'}
                    </Typography>
                </TableCell>

                <TableCell>
                    <ProcessFlags process={process} />
                </TableCell>

                <TableCell align="right" sx={{ width: 80 }}>
                    <Chip
                        size="small"
                        variant="outlined"
                        icon={<Inventory2Icon />}
                        label={materials.length}
                    />
                </TableCell>

                <TableCell align="right" sx={{ width: 80 }}>
                    <Chip
                        size="small"
                        variant="outlined"
                        icon={<PrecisionManufacturingIcon />}
                        label={machines.length}
                    />
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell colSpan={7} sx={{ py: 0, borderBottom: open ? 1 : 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 2, py: 2, bgcolor: 'action.hover' }}>
                            <TechItemsTable type="materials" items={materials} />
                            <TechItemsTable type="machines" items={machines} />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
}

function ProcessGroup({ title, rows, defaultExpanded }) {
    if (!rows.length) return null;

    return (
        <Fragment>
            <TableRow>
                <TableCell
                    colSpan={7}
                    sx={{
                        bgcolor: 'action.selected',
                        fontWeight: 700,
                        borderTop: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="subtitle2" fontWeight={700}>
                        {title} ({rows.length})
                    </Typography>
                </TableCell>
            </TableRow>

            {rows.map((row) => (
                <ProcessRow
                    key={row?.id ?? `${title}-${row?.process_id}`}
                    row={row}
                    defaultOpen={defaultExpanded}
                />
            ))}
        </Fragment>
    );
}

export default function UsersTechStack() {

    const { user } = useAuth();
    const data = user?.processes ?? [];
    const rows = safeArray(data);
    const defaultExpanded = rows.length <= 3;

    const grouped = useMemo(() => {
        const general = [];
        const production = [];

        for (const row of rows) {
            const process = row?.details ?? {};
            if (isTruthyFlag(process?.is_general)) {
                general.push(row);
            } else {
                production.push(row);
            }
        }

        return { general, production };
    }, [rows]);

    return (
        <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 3, overflow: 'hidden' }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 56 }} />
                        <TableCell sx={{ width: 150 }}>Rodzaj</TableCell>
                        <TableCell sx={{ width: 150 }}>Proces</TableCell>
                        <TableCell sx={{ width: 300 }}>Opis</TableCell>
                        <TableCell>Flagi</TableCell>
                        <TableCell align="right" sx={{ width: 120 }}>
                            Materiały
                        </TableCell>
                        <TableCell align="right" sx={{ width: 120 }}>
                            Maszyny
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {!rows.length ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Typography variant="body2" color="text.secondary">
                                    Brak przypisanych procesów.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            <ProcessGroup
                                title="Ogólne / gospodarcze"
                                rows={grouped.general}
                                defaultExpanded={defaultExpanded}
                            />
                            <ProcessGroup
                                title="Projektowe produkcyjne"
                                rows={grouped.production}
                                defaultExpanded={defaultExpanded}
                            />
                        </>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}