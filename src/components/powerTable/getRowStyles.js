
/**
 * PowerTable - Row Styles
 * Centralna definicja kolorów, akcentów i stanów wierszy.
 */

const palette = {
    error: {
        background: 'rgba(211, 47, 47, 0.045)',
        hover: 'rgba(211, 47, 47, 0.09)',
        border: 'rgba(211, 47, 47, 0.45)',
    },
    success: {
        background: 'rgba(46, 125, 50, 0.045)',
        hover: 'rgba(46, 125, 50, 0.09)',
        border: 'rgba(46, 125, 50, 0.45)',
    },
    warning: {
        background: 'rgba(237, 108, 2, 0.045)',
        hover: 'rgba(237, 108, 2, 0.09)',
        border: 'rgba(237, 108, 2, 0.45)',
    },
    info: {
        background: 'rgba(2, 136, 209, 0.045)',
        hover: 'rgba(2, 136, 209, 0.09)',
        border: 'rgba(2, 136, 209, 0.45)',
    },
    neutral: {
        background: 'rgba(100, 116, 139, 0.045)',
        hover: 'rgba(100, 116, 139, 0.09)',
        border: 'rgba(100, 116, 139, 0.35)',
    },
};

const createTint = (color) => ({
    backgroundColor: color.background,
    '&:hover': { backgroundColor: color.hover },
});

const createAccent = (color) => ({
    borderLeft: `3px solid ${color.border}`,
});

const createStatus = (color) => ({
    ...createTint(color),
    ...createAccent(color),
});

/**
 * Gotowe fragmenty sx.
 */
export const rowStyles = Object.freeze({
    error: createStatus(palette.error),
    success: createStatus(palette.success),
    warning: createStatus(palette.warning),
    info: createStatus(palette.info),
    neutral: createStatus(palette.neutral),

    // Same tła
    errorTint: createTint(palette.error),
    successTint: createTint(palette.success),
    warningTint: createTint(palette.warning),
    infoTint: createTint(palette.info),

    // Same akcenty
    errorAccent: createAccent(palette.error),
    successAccent: createAccent(palette.success),
    warningAccent: createAccent(palette.warning),
    infoAccent: createAccent(palette.info),

    // Style niezależne od statusu
    muted: {
        opacity: 0.5,
    },
    disabled: {
        opacity: 0.4,
        filter: 'grayscale(0.5)',
    },
    bold: {
        fontWeight: 600,
        '& > td': { fontWeight: 600 },
    },
});

/**
 * Łączenie fragmentów sx.
 * Obsługuje również zagnieżdżone selektory.
 */
export const mergeRowStyles = (...styles) => {
    return styles.filter(Boolean).reduce((result, style) => {
        for (const [key, value] of Object.entries(style)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = { ...(result[key] || {}), ...value };
            } else {
                result[key] = value;
            }
        }
        return result;
    }, {});
};

/**
 * Fabryka callbacku PowerTable.
 *
 * rules: tablica reguł [predicate, style]
 * Pierwsza pasująca reguła wygrywa.
 */
export const createGetRowStyles = (rules = []) => {
    return (row) => {
        for (const [predicate, style] of rules) {
            if (predicate(row)) {
                return typeof style === 'function' ? style(row) : style;
            }
        }
        return {};
    };
};
