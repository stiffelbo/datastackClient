import React from "react";
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Link,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";

const DocRenderer = ({ data }) => {
    if (!data) return null;

    function renderChildren(node) {
        return (node.children ?? []).map((child, index) =>
            renderNode(child, `${node.type}-${index}`)
        );
    }

    function renderTextOrChildren(node) {
        if (node.text) return node.text;
        return renderChildren(node);
    }

    function renderNode(node, key) {
        if (!node?.type) return null;

        const commonProps = {
            id: node.id,
            sx: node.sx,
            ...node.props,
        };

        switch (node.type) {
            case "Typography":
                return (
                    <Typography
                        key={key}
                        variant={node.variant || "body1"}
                        color={node.color}
                        align={node.align}
                        {...commonProps}
                    >
                        {renderTextOrChildren(node)}
                    </Typography>
                );

            case "Alert":
                return (
                    <Alert
                        key={key}
                        severity={node.severity || "info"}
                        variant={node.variant}
                        {...commonProps}
                    >
                        {renderTextOrChildren(node)}
                    </Alert>
                );

            case "Box":
                return (
                    <Box key={key} {...commonProps}>
                        {renderChildren(node)}
                    </Box>
                );

            case "Stack":
                return (
                    <Stack
                        key={key}
                        direction={node.direction || "column"}
                        spacing={node.spacing ?? 2}
                        {...commonProps}
                    >
                        {renderChildren(node)}
                    </Stack>
                );

            case "Card":
                return (
                    <Card key={key} variant={node.variant} {...commonProps}>
                        {renderChildren(node)}
                    </Card>
                );

            case "CardContent":
                return (
                    <CardContent key={key} {...commonProps}>
                        {renderChildren(node)}
                    </CardContent>
                );

            case "Divider":
                return <Divider key={key} {...commonProps} />;

            case "List":
                return (
                    <List
                        key={key}
                        dense={!!node.dense}
                        disablePadding={node.props?.disablePadding}
                        {...commonProps}
                    >
                        {renderChildren(node)}
                    </List>
                );

            case "ListItem":
                return (
                    <ListItem
                        key={key}
                        disabled={!!node.disabled}
                        divider={!!node.divider}
                        {...commonProps}
                    >
                        <ListItemText primary={node.text} />
                    </ListItem>
                );

            case "Chip":
                return (
                    <Chip
                        key={key}
                        label={node.text}
                        color={node.color}
                        size={node.size || "small"}
                        variant={node.variant || "outlined"}
                        {...commonProps}
                    />
                );

            case "Link":
                return (
                    <Link
                        key={key}
                        href={node.href}
                        color={node.color}
                        underline={node.props?.underline || "hover"}
                        {...commonProps}
                    >
                        {renderTextOrChildren(node)}
                    </Link>
                );

            default:
                return null;
        }
    }

    return (
        <Box>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        {data.title}
                    </Typography>

                    {data.subtitle && (
                        <Typography variant="subtitle2" color="text.secondary">
                            {data.subtitle}
                        </Typography>
                    )}

                    {data.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {data.description}
                        </Typography>
                    )}
                </Box>

                <Divider />

                {(data.nodes ?? []).map((node, index) =>
                    renderNode(node, `root-${index}`)
                )}
            </Stack>
        </Box>
    );
};

export default DocRenderer;