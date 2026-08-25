// cellLayout.js

export const toCssSize = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return typeof value === "number"
    ? `${value}px`
    : value;
};


/**
 * Rozwiązuje wspólną geometrię komórki.
 */
export const resolveCellGeometry = ({
  column = {},
  settings = {},
  fallbackWidth,
}) => {
  const configuredRowHeight =
    settings.rowHeight;

  const isVirtual =
    !!settings.isVirtualized &&
    Number(configuredRowHeight) > 0;

  const virtualFlex =
    !!settings.virtualFlex;

  const rowHeight = isVirtual
    ? Number(configuredRowHeight)
    : undefined;

  const width =
    column.width ??
    column.minWidth ??
    fallbackWidth;

  const minWidth =
    column.minWidth ??
    width;

  const maxWidth =
    column.maxWidth ??
    width;

  return {
    isVirtual,
    virtualFlex,
    rowHeight,

    width: toCssSize(width),
    minWidth: toCssSize(minWidth),
    maxWidth: toCssSize(maxWidth),
  };
};


/**
 * Wspólna geometria TableCell.
 *
 * DisplayCell / EditCell / ActionCell
 * muszą dostać dokładnie ten sam model.
 */
export const getCellSx = ({
  column = {},
  settings = {},
  fallbackWidth,
  align,
  sx = {},
}) => {
  const geometry = resolveCellGeometry({
    column,
    settings,
    fallbackWidth,
  });

  const {
    isVirtual,
    virtualFlex,
    rowHeight,
    width,
    minWidth,
    maxWidth,
  } = geometry;

  const hasWidth =
    width !== undefined;

  return {
    fontSize: settings.fontSize,
    lineHeight: 1.3,
    verticalAlign: "middle",
    textAlign: align ?? column.align ?? "left",

    /*
     * Custom style przed geometrią.
     * Krytyczna geometria nie może zostać później nadpisana.
     */
    ...sx,

    /*
     * WIDTH
     */
    ...(virtualFlex && hasWidth
      ? {
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: width,

          width,
          minWidth,
          maxWidth,
        }
      : {
          width,
          minWidth,
          maxWidth,
        }),

    /*
     * HEIGHT
     */
    ...(isVirtual
      ? {
          height: `${rowHeight}px`,
          minHeight: `${rowHeight}px`,
          maxHeight: `${rowHeight}px`,

          padding: 0,

          boxSizing: "border-box",

          overflow: "hidden",
        }
      : {
          height: settings.rowHeight,
          maxHeight: settings.rowHeight,
        }),
  };
};


/**
 * Bazowy wrapper wewnątrz komórki.
 */
export const getCellInnerSx = ({
  settings = {},
  mode = "display",
}) => {
  const isVirtual =
    !!settings.isVirtualized &&
    Number(settings.rowHeight) > 0;

  const rowHeight = isVirtual
    ? Number(settings.rowHeight)
    : undefined;

  const px =
    settings.px ?? "6px";

  const py =
    settings.py ?? "6px";

  const common = {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",

    boxSizing: "border-box",
  };

  if (!isVirtual) {
    return {
      ...common,

      px,
      py,

      overflowWrap: "break-word",
      wordBreak: "break-word",
    };
  }

  const virtualBase = {
    ...common,

    height: `${rowHeight}px`,
    minHeight: 0,
    maxHeight: `${rowHeight}px`,

    overflow: "hidden",

    "& > *": {
      minWidth: 0,
      maxWidth: "100%",
      maxHeight: "100%",
      boxSizing: "border-box",
    },
  };

  if (mode === "action") {
    return {
      ...virtualBase,

      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  }

  if (mode === "edit") {
    return {
      ...virtualBase,

      px,
      py: 0,

      display: "flex",
      alignItems: "center",
    };
  }

  // display
  return {
    ...virtualBase,

    px,
    py: 0,

    display: "flex",
    alignItems: "center",

    whiteSpace: "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",

    fontSize: settings.fontSize,
    lineHeight: 1.3,
  };
};


/**
 * MUI input nie może rozepchnąć virtual row.
 */
export const getVirtualInputSx = (settings = {}) => {
  const isVirtual =
    !!settings.isVirtualized &&
    Number(settings.rowHeight) > 0;

  if (!isVirtual) {
    return {};
  }

  return {
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",

    height: "100%",
    maxHeight: "100%",

    boxSizing: "border-box",

    "& .MuiInputBase-root": {
      width: "100%",
      minWidth: 0,
      maxWidth: "100%",

      height: "100%",
      maxHeight: "100%",

      boxSizing: "border-box",
    },

    "& .MuiInputBase-input": {
      minWidth: 0,

      boxSizing: "border-box",

      paddingTop: 0,
      paddingBottom: 0,

      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    "& .MuiSelect-select": {
      minWidth: 0,

      height: "100%",

      boxSizing: "border-box",

      display: "flex",
      alignItems: "center",

      paddingTop: 0,
      paddingBottom: 0,

      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    "& .MuiFormHelperText-root": {
      display: "none",
    },
  };
};