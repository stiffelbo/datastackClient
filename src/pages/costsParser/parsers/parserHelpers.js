/**
 * Zamienia dowolną wartość na oczyszczony tekst.
 *
 * Usuwa:
 * - twarde spacje,
 * - nadmiarowe białe znaki,
 * - spacje na początku i końcu.
 *
 * @param {*} value
 * @returns {string|null}
 */
export function cleanText(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const text = String(value)
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return text === '' ? null : text;
}

/**
 * Normalizuje tekst do wielkich liter.
 *
 * Funkcja jest używana przy porównywaniu nagłówków,
 * nazw sekcji i wyszukiwaniu sygnatur Jira.
 *
 * @param {*} value
 * @returns {string}
 */
export function normalizeText(value) {
    return cleanText(value)?.toLocaleUpperCase('pl-PL') ?? '';
}

/**
 * Zapewnia, że wiersz arkusza jest tablicą.
 *
 * @param {*} row
 * @returns {Array}
 */
export function normalizeRow(row) {
    return Array.isArray(row) ? row : [];
}

/**
 * Zamienia wartość z arkusza na liczbę.
 *
 * Obsługuje między innymi:
 * - wartości liczbowe Excela,
 * - "1 234,56",
 * - "1 234.56",
 * - "2,95 zł",
 * - "37,25%".
 *
 * @param {*} value
 * @returns {number|null}
 */
export function parseNumber(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    let normalized = String(value)
        .replace(/\u00A0/g, '')
        .replace(/\s/g, '')
        .replace(/[A-Za-zł€$%]/gi, '')
        .trim();

    if (
        normalized === '' ||
        normalized === '-' ||
        normalized.startsWith('#')
    ) {
        return null;
    }

    /*
     * Gdy tekst ma jednocześnie przecinek i kropkę,
     * ostatni separator traktujemy jako separator dziesiętny.
     *
     * Przykłady:
     * 1.234,56
     * 1,234.56
     */
    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');

    if (lastComma >= 0 && lastDot >= 0) {
        if (lastComma > lastDot) {
            normalized = normalized
                .replace(/\./g, '')
                .replace(',', '.');
        } else {
            normalized = normalized.replace(/,/g, '');
        }
    } else if (lastComma >= 0) {
        normalized = normalized.replace(',', '.');
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed)
        ? parsed
        : null;
}

/**
 * Parsuje procent zapisany w Excelu.
 *
 * Excel może zwrócić:
 * - 0.3725 dla komórki 37,25%,
 * - 37.25 dla zwykłej liczby,
 * - "37,25%".
 *
 * Wynik funkcji zawsze jest wartością procentową,
 * np. 37.25.
 *
 * @param {*} value
 * @returns {number|null}
 */
export function parsePercent(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            return null;
        }

        return Math.abs(value) <= 1
            ? value * 100
            : value;
    }

    const hasPercentSign = String(value).includes('%');
    const parsed = parseNumber(value);

    if (parsed === null) {
        return null;
    }

    if (hasPercentSign) {
        return parsed;
    }

    return Math.abs(parsed) <= 1
        ? parsed * 100
        : parsed;
}

/**
 * Zaokrągla liczbę do wskazanej liczby miejsc.
 *
 * Null pozostaje nullem.
 *
 * @param {number|null} value
 * @param {number} precision
 * @returns {number|null}
 */
export function roundNumber(value, precision = 4) {
    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
    ) {
        return null;
    }

    const factor = 10 ** precision;

    return Math.round(Number(value) * factor) / factor;
}

/**
 * Próbuje znaleźć sygnaturę Jira w podanym tekście.
 *
 * Obsługiwane przykłady:
 * - HIM-11087
 * - KON-16527
 * - ZP-1201
 * - PROC-2275
 *
 * @param {*} value
 * @returns {string|null}
 */
export function extractJiraTask(value) {
    const normalized = normalizeText(value);

    const match = normalized.match(
        /\b[A-Z][A-Z0-9]*-\d+\b/
    );

    return match?.[0] ?? null;
}

/**
 * Łączy wszystkie niepuste wartości wiersza w jeden tekst.
 *
 * Przydatne przy wykrywaniu nagłówków i sekcji arkusza.
 *
 * @param {Array} row
 * @returns {string}
 */
export function rowToNormalizedText(row) {
    return normalizeText(
        normalizeRow(row)
            .map(cleanText)
            .filter(Boolean)
            .join(' ')
    );
}