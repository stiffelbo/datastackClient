// src/components/common/jiraDescription/JiraDescription.jsx

import React from "react";
import { Box, Typography, Link, Divider } from "@mui/material";

import {
    parseAdfDocument,
    hasMark,
    getTextColor,
    getLinkHref,
} from "./adfDto";

const panelColorByType = {
  info: {
    borderColor: "info.main",
    bgcolor: "info.50",
  },
  note: {
    borderColor: "primary.main",
    bgcolor: "action.hover",
  },
  warning: {
    borderColor: "warning.main",
    bgcolor: "warning.50",
  },
  error: {
    borderColor: "error.main",
    bgcolor: "error.50",
  },
  success: {
    borderColor: "success.main",
    bgcolor: "success.50",
  },
};

const EmptyDescription = ({ emptyText }) => {
    return (
        <Typography variant="body2" color="text.secondary">
            {emptyText}
        </Typography>
    );
};

const PlainTextDescription = ({ value }) => {
    return (
        <Typography
            component="pre"
            variant="body2"
            sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                m: 0,
            }}
        >
            {value}
        </Typography>
    );
};

const AdfPanel = ({ node }) => {
  const panelType = node?.attrs?.panelType || "info";
  const palette = panelColorByType[panelType] || panelColorByType.info;

  return (
    <Box
      sx={{
        my: 1,
        p: 1.25,
        borderLeft: 4,
        borderRadius: 1,
        borderColor: palette.borderColor,
        bgcolor: palette.bgcolor,
      }}
    >
      {node.content.map((child, index) => (
        <AdfBlockNode key={index} node={child} />
      ))}
    </Box>
  );
};

const AdfText = ({ node }) => {
    const marks = node.marks || [];
    const href = getLinkHref(marks);
    const color = getTextColor(marks);

    const sx = {
        fontWeight: hasMark(marks, "strong") ? 700 : undefined,
        fontStyle: hasMark(marks, "em") ? "italic" : undefined,
        textDecoration: [
            hasMark(marks, "underline") ? "underline" : null,
            hasMark(marks, "strike") ? "line-through" : null,
        ]
            .filter(Boolean)
            .join(" "),
        color: color || undefined,
        fontFamily: hasMark(marks, "code") ? "monospace" : undefined,
        bgcolor: hasMark(marks, "code") ? "action.hover" : undefined,
        px: hasMark(marks, "code") ? 0.5 : undefined,
        borderRadius: hasMark(marks, "code") ? 0.5 : undefined,
    };

    if (href) {
        return (
            <Link href={href} target="_blank" rel="noreferrer" sx={sx}>
                {node.text}
            </Link>
        );
    }

    return (
        <Box component="span" sx={sx}>
            {node.text}
        </Box>
    );
};

const AdfHardBreak = () => {
    return <br />;
};

const AdfInlineNode = ({ node }) => {
    if (!node) return null;

    if (node.type === "text") {
        return <AdfText node={node} />;
    }

    if (node.type === "hardBreak") {
        return <AdfHardBreak />;
    }

    return null;
};

const AdfInlineContent = ({ content = [] }) => {
    return (
        <>
            {content.map((node, index) => (
                <AdfInlineNode key={index} node={node} />
            ))}
        </>
    );
};

const AdfParagraph = ({ node }) => {
    return (
        <Typography
            component="p"
            variant="body2"
            sx={{
                my: 0.75,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
            }}
        >
            <AdfInlineContent content={node.content} />
        </Typography>
    );
};

const AdfHeading = ({ node }) => {
    const level = node?.attrs?.level || 3;

    const variantByLevel = {
        1: "h6",
        2: "subtitle1",
        3: "subtitle2",
        4: "body1",
        5: "body2",
        6: "caption",
    };

    return (
        <Typography
            variant={variantByLevel[level] || "subtitle2"}
            fontWeight={700}
            sx={{ mt: 1.5, mb: 0.75 }}
        >
            <AdfInlineContent content={node.content} />
        </Typography>
    );
};

const AdfBulletList = ({ node }) => {
    return (
        <Box component="ul" sx={{ my: 0.75, pl: 3 }}>
            {node.content.map((child, index) => (
                <AdfListItem key={index} node={child} />
            ))}
        </Box>
    );
};

const AdfOrderedList = ({ node }) => {
    return (
        <Box component="ol" sx={{ my: 0.75, pl: 3 }}>
            {node.content.map((child, index) => (
                <AdfListItem key={index} node={child} />
            ))}
        </Box>
    );
};

const AdfListItem = ({ node }) => {
    return (
        <Box component="li" sx={{ mb: 0.25 }}>
            {node.content.map((child, index) => (
                <AdfBlockNode key={index} node={child} compact />
            ))}
        </Box>
    );
};

const AdfBlockquote = ({ node }) => {
    return (
        <Box
            sx={{
                borderLeft: 3,
                borderColor: "divider",
                pl: 2,
                my: 1,
                color: "text.secondary",
            }}
        >
            {node.content.map((child, index) => (
                <AdfBlockNode key={index} node={child} />
            ))}
        </Box>
    );
};

const AdfRule = () => {
    return <Divider sx={{ my: 1.5 }} />;
};

const UnsupportedAdfNode = ({ node }) => {
    return (
        <Typography variant="caption" color="text.secondary">
            [{node.type}]
        </Typography>
    );
};

const AdfBlockNode = ({ node }) => {
    if (!node) return null;

    if (node.type === "paragraph") {
        return <AdfParagraph node={node} />;
    }

    if (node.type === "heading") {
        return <AdfHeading node={node} />;
    }

    if (node.type === "bulletList") {
        return <AdfBulletList node={node} />;
    }

    if (node.type === "orderedList") {
        return <AdfOrderedList node={node} />;
    }

    if (node.type === "blockquote") {
        return <AdfBlockquote node={node} />;
    }

    if (node.type === "rule") {
        return <AdfRule />;
    }
    if (node.type === "table") {
        return <AdfTable node={node} />;
    }

    if (node.type === "tableRow") {
        return null; // obsługiwane wyżej
    }

    if (node.type === "tableCell" || node.type === "tableHeader") {
        return null;
    }

    if (node.type === "panel") {
        return <AdfPanel node={node} />;
    }

    return <UnsupportedAdfNode node={node} />;
};

const AdfDocument = ({ doc }) => {
    if (!doc.content || doc.content.length === 0) {
        return null;
    }

    return (
        <>
            {doc.content.map((node, index) => (
                <AdfBlockNode key={index} node={node} />
            ))}
        </>
    );
};

const AdfTable = ({ node }) => {
    return (
        <Box
            component="table"
            sx={{
                width: "100%",
                borderCollapse: "collapse",
                my: 1,
                fontSize: "0.85rem",
            }}
        >
            <tbody>
                {node.content.map((row, i) => (
                    <AdfTableRow key={i} node={row} />
                ))}
            </tbody>
        </Box>
    );
};

const AdfTableRow = ({ node }) => {
    return (
        <Box component="tr">
            {node.content.map((cell, i) => (
                <AdfTableCell key={i} node={cell} />
            ))}
        </Box>
    );
};

const AdfTableCell = ({ node }) => {
    const isHeader = node.type === "tableHeader";

    return (
        <Box
            component={isHeader ? "th" : "td"}
            sx={{
                border: "1px solid",
                borderColor: "divider",
                padding: "6px 8px",
                verticalAlign: "top",
                fontWeight: isHeader ? 600 : 400,
                bgcolor: isHeader ? "action.hover" : "transparent",
            }}
        >
            {node.content.map((child, i) => (
                <AdfBlockNode key={i} node={child} />
            ))}
        </Box>
    );
};

const JiraDescription = ({
    value,
    emptyText = "Brak opisu",
    sx = {},
}) => {
    const doc = parseAdfDocument(value);

    if (doc.type === "plainText") {
        return (
            <Box sx={sx}>
                <PlainTextDescription value={doc.content} />
            </Box>
        );
    }

    if (!doc.content || doc.content.length === 0) {
        return (
            <Box sx={sx}>
                <EmptyDescription emptyText={emptyText} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                fontSize: "0.875rem",
                "& p:first-of-type": { mt: 0 },
                "& p:last-of-type": { mb: 0 },
                ...sx,
            }}
        >
            <AdfDocument doc={doc} />
        </Box>
    );
};

export default JiraDescription;