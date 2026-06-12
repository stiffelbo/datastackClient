import {
    Box,
    Chip,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

function ProcessTooltipContent({ option }) {
    const meta = option.meta ?? {};

    return (
        <Box sx={{ maxWidth: 360, backgroundColor: "white", color: 'black' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {option.val}
            </Typography>

            {option.group && (
                <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                    🧩 Struktura: {option.group}
                </Typography>
            )}

            {meta.description && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                    📝 {meta.description}
                </Typography>
            )}

            <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                {meta.isGeneral && <Chip size="small" label="🌐 Ogólny" />}
                {meta.isProduction && <Chip size="small" label="🏭 Produkcja" />}
                {meta.isDesign && <Chip size="small" label="📐 Design" />}
                {meta.isSetup && <Chip size="small" label="🔧 Setup" />}
                {meta.isTask && <Chip size="small" label="🎯 Zadanie Produkcyjne" />}
                {meta.requiresQuantity && <Chip size="small" label="🔢 Wymaga ilości" />}
                {!meta.requiresQuantity && <Chip size="small" label="🚫 Nie wymaga ilości" />}
                {meta.requiresRemarks && <Chip size="small" label="💬 Wymaga uwag" />}
            </Stack>

            <Box sx={{ mt: 1 }}>
                <Typography variant="caption" display="block">
                    🛠 Maszyny: {meta.machinesCount}
                </Typography>
                <Typography variant="caption" display="block">
                    📦 Materiały: {meta.materialsCount}
                </Typography>
                {meta.finishedProduct && (
                    <Typography variant="caption" display="block">
                        ✅ Produkt: {meta.finishedProduct}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default ProcessTooltipContent;