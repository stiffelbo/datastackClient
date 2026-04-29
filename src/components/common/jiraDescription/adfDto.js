// src/components/common/jiraDescription/adfDto.js

export const ADF_EMPTY_DOC = {
  type: "doc",
  version: 1,
  content: [],
};

export const parseAdfDocument = (value) => {
  if (!value) return ADF_EMPTY_DOC;

  if (typeof value === "object") {
    return normalizeAdfRoot(value);
  }

  if (typeof value === "string") {
    try {
      return normalizeAdfRoot(JSON.parse(value));
    } catch {
      return {
        type: "plainText",
        content: value,
      };
    }
  }

  return {
    type: "plainText",
    content: String(value),
  };
};

export const normalizeAdfRoot = (doc) => {
  if (!doc || typeof doc !== "object") return ADF_EMPTY_DOC;

  if (doc.type !== "doc") {
    return {
      type: "doc",
      version: 1,
      content: [normalizeAdfNode(doc)],
    };
  }

  return {
    type: "doc",
    version: doc.version || 1,
    content: normalizeAdfContent(doc.content),
  };
};

export const normalizeAdfContent = (content) => {
  if (!Array.isArray(content)) return [];
  return content.map(normalizeAdfNode).filter(Boolean);
};

export const normalizeAdfNode = (node) => {
  if (!node || typeof node !== "object") return null;

  const base = {
    type: node.type || "unknown",
    attrs: node.attrs || {},
  };

  if (node.type === "text") {
    return {
      ...base,
      text: node.text || "",
      marks: normalizeAdfMarks(node.marks),
    };
  }

  return {
    ...base,
    content: normalizeAdfContent(node.content),
  };
};

export const normalizeAdfMarks = (marks) => {
  if (!Array.isArray(marks)) return [];

  return marks
    .filter((mark) => mark && typeof mark === "object" && mark.type)
    .map((mark) => ({
      type: mark.type,
      attrs: mark.attrs || {},
    }));
};

export const hasMark = (marks = [], type) => {
  return marks.some((mark) => mark.type === type);
};

export const getMark = (marks = [], type) => {
  return marks.find((mark) => mark.type === type) || null;
};

export const getTextColor = (marks = []) => {
  const mark = getMark(marks, "textColor");
  return mark?.attrs?.color || null;
};

export const getLinkHref = (marks = []) => {
  const mark = getMark(marks, "link");
  return mark?.attrs?.href || null;
};