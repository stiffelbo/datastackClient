import BaseCostsParser from './BaseCostsParser';

import {
    cleanText,
    extractJiraTask,
    normalizeRow,
    normalizeText,
    parseNumber,
    parsePercent,
    roundNumber,
    rowToNormalizedText,
} from './parserHelpers';

/**
 * Parser pierwszej wersji historycznych kart kosztów.
 *
 * Zakładany układ kosztów:
 *
 * 0 Materiał / usługa
 * 1 Marża / oznaczenie
 * 2 Ilość planowana
 * 3 Jm planowana
 * 4 Koszt planowany
 * 5 Faktura
 * 6 Ilość rzeczywista
 * 7 Jm rzeczywista
 * 8 Cena jednostkowa
 * 9 Koszt rzeczywisty
 *
 * Zakładany układ sprzedaży:
 *
 * 0 Produkt / usługa
 * 1 pole pomocnicze
 * 2 Ilość
 * 3 Jm
 * 4 Cena sprzedaży
 * 5 Wartość sprzedaży w walucie
 * 6 Wartość sprzedaży PLN
 * 7 Koszty
 * 8 Zysk / strata
 * 9 Marża %
 */
class CostsParserV1 extends BaseCostsParser {
    /**
     * Identyfikator wersji parsera.
     */
    get id() {
        return 'v1';
    }

    /**
     * Nazwa wersji wyświetlana użytkownikowi.
     */
    get label() {
        return 'Karty kosztów – wersja 1';
    }

    /**
     * Parsuje jeden arkusz.
     *
     * Najpierw rozpoznaje projekt,
     * następnie niezależnie parsuje:
     * - sekcję kosztów,
     * - sekcję sprzedaży.
     *
     * @param {Object} params
     * @returns {{costs: Array, saleItems: Array}}
     */
    parseSheet({
        matrix,
        sourceFile,
        sourceSheet,
    }) {
        if (
            !Array.isArray(matrix) ||
            matrix.length === 0
        ) {
            return {
                costs: [],
                saleItems: [],
            };
        }

        const project = this.findProjectInfo(
            matrix,
            sourceFile
        );

        return {
            costs: this.parseCosts({
                matrix,
                project,
                sourceFile,
                sourceSheet,
            }),

            saleItems: this.parseSaleItems({
                matrix,
                project,
                sourceFile,
                sourceSheet,
            }),
        };
    }

    /**
     * Wyszukuje sygnaturę i nazwę projektu
     * w początkowej części arkusza.
     *
     * Obsługuje również task zapisany w dwóch komórkach,
     * np. HIM + 11087.
     *
     * Jeśli task nie zostanie znaleziony w arkuszu,
     * parser próbuje odczytać go z nazwy pliku.
     *
     * @param {Array} matrix
     * @param {string} sourceFile
     * @returns {{task: string|null, taskName: string|null}}
     */
    findProjectInfo(matrix, sourceFile) {
        let task = null;
        let taskName = null;

        const headerRows = matrix.slice(0, 25);

        for (const sourceRow of headerRows) {
            const row = normalizeRow(sourceRow);
            const label = normalizeText(row[0]);

            if (
                label.includes('NR PROJEKTU') ||
                label.includes('NUMER PROJEKTU')
            ) {
                const firstPart = cleanText(row[1]);
                const secondPart = cleanText(row[2]);

                if (
                    firstPart &&
                    secondPart &&
                    /^\d+$/.test(secondPart)
                ) {
                    task = `${firstPart}-${secondPart}`
                        .toUpperCase();
                } else {
                    task = extractJiraTask(
                        row.join(' ')
                    );
                }
            }

            if (label.includes('NAZWA PROJEKTU')) {
                taskName =
                    cleanText(row[1]) ??
                    cleanText(row[2]) ??
                    cleanText(row[3]) ??
                    null;
            }
        }

        if (!task) {
            const headerText = headerRows
                .flat()
                .map(cleanText)
                .filter(Boolean)
                .join(' ');

            task = extractJiraTask(headerText);
        }

        if (!task) {
            task = extractJiraTask(sourceFile);
        }

        return {
            task,
            taskName,
        };
    }

    /**
     * Parsuje wszystkie niezerowe pozycje kosztowe.
     *
     * Parser:
     * - znajduje nagłówek kosztów,
     * - śledzi aktualną sekcję i grupę,
     * - pomija sumy i nagłówki,
     * - kończy przed sekcją sprzedażową.
     *
     * @returns {Array}
     */
    parseCosts({
        matrix,
        project,
        sourceFile,
        sourceSheet,
    }) {
        const headerRowIndex =
            this.findCostsHeader(matrix);

        if (headerRowIndex < 0) {
            return [];
        }

        const result = [];

        let currentSection = null;
        let currentGroup = null;

        for (
            let rowIndex = headerRowIndex + 1;
            rowIndex < matrix.length;
            rowIndex += 1
        ) {
            const row = normalizeRow(
                matrix[rowIndex]
            );

            const firstCell = cleanText(row[0]);
            const normalizedFirstCell =
                normalizeText(firstCell);

            if (this.isSalesHeaderRow(row)) {
                break;
            }

            if (
                this.isMainCostSection(
                    normalizedFirstCell
                )
            ) {
                currentSection = firstCell;
                currentGroup = null;
                continue;
            }

            if (this.isCostSummaryRow(row)) {
                continue;
            }

            if (this.isCostGroupRow(row)) {
                currentGroup = firstCell;
                continue;
            }

            const cost = this.parseCostRow({
                row,
                rowIndex,
                project,
                currentSection,
                currentGroup,
                sourceFile,
                sourceSheet,
            });

            if (cost !== null) {
                result.push(cost);
            }
        }

        return result;
    }

    /**
     * Parsuje wszystkie pozycje sprzedażowe.
     *
     * Parser:
     * - znajduje nagłówek sprzedaży,
     * - rozpoznaje grupy sprzedażowe,
     * - pomija podsumowania,
     * - zachowuje tylko wiersze zawierające dane liczbowe.
     *
     * @returns {Array}
     */
    parseSaleItems({
        matrix,
        project,
        sourceFile,
        sourceSheet,
    }) {
        const headerRowIndex =
            this.findSalesHeader(matrix);

        if (headerRowIndex < 0) {
            return [];
        }

        const result = [];

        let currentGroup = null;

        for (
            let rowIndex = headerRowIndex + 1;
            rowIndex < matrix.length;
            rowIndex += 1
        ) {
            const row = normalizeRow(
                matrix[rowIndex]
            );

            const itemName = cleanText(row[0]);

            if (!itemName) {
                continue;
            }

            if (this.isSalesSummaryRow(row)) {
                continue;
            }

            if (this.isSaleGroupRow(row)) {
                currentGroup = itemName;
                continue;
            }

            const saleItem = this.parseSaleItemRow({
                row,
                rowIndex,
                project,
                currentGroup,
                sourceFile,
                sourceSheet,
            });

            if (saleItem !== null) {
                result.push(saleItem);
            }
        }

        return result;
    }

    /**
     * Znajduje wiersz nagłówka głównej tabeli kosztów.
     *
     * @param {Array} matrix
     * @returns {number}
     */
    findCostsHeader(matrix) {
        return matrix.findIndex((row) => {
            const text = rowToNormalizedText(row);

            return (
                (
                    text.includes('MATERIAŁ/USŁUGA') ||
                    text.includes('MATERIAL/USLUGA') ||
                    text.includes('MATERIAŁ USŁUGA')
                ) &&
                (
                    text.includes('KOSZTY RZECZYWISTE') ||
                    text.includes('KOSZT RZECZYWISTY')
                )
            );
        });
    }

    /**
     * Znajduje wiersz nagłówka tabeli sprzedażowej.
     *
     * @param {Array} matrix
     * @returns {number}
     */
    findSalesHeader(matrix) {
        return matrix.findIndex((row) =>
            this.isSalesHeaderRow(row)
        );
    }

    /**
     * Sprawdza, czy wiersz jest nagłówkiem sprzedaży.
     *
     * @param {Array} row
     * @returns {boolean}
     */
    isSalesHeaderRow(row) {
        const text = rowToNormalizedText(row);

        return (
            (
                text.includes('PRODUKT/USŁUGA') ||
                text.includes('PRODUKT/USLUGA') ||
                text.includes('PRODUKT USŁUGA')
            ) &&
            text.includes('ILOŚĆ') &&
            (
                text.includes('WARTOŚĆ SPRZEDAŻY') ||
                text.includes('WARTOSC SPRZEDAZY')
            ) &&
            (
                text.includes('ZYSK/STRATA') ||
                text.includes('ZYSK STRATA')
            )
        );
    }

    /**
     * Rozpoznaje główną sekcję kosztową,
     * np. I KOSZTY PRODUKCJI BEZPOŚREDNIEJ.
     *
     * @param {string} value
     * @returns {boolean}
     */
    isMainCostSection(value) {
        if (!value) {
            return false;
        }

        return (
            /^[IVX]+\s+KOSZTY\b/.test(value) ||
            value.includes(
                'KOSZTY PRODUKCJI BEZPOŚREDNIEJ'
            ) ||
            value.includes(
                'KOSZTY PRODUKCJI POSREDNIEJ'
            ) ||
            value.includes(
                'KOSZTY PRODUKCJI POŚREDNIEJ'
            ) ||
            value.includes('KOSZTY SPRZEDAŻY') ||
            value.includes('KOSZTY SPRZEDAZY')
        );
    }

    /**
     * Rozpoznaje wiersze będące sumami
     * lub podsumowaniami kosztów.
     *
     * @param {Array} row
     * @returns {boolean}
     */
    isCostSummaryRow(row) {
        const text = rowToNormalizedText(row);

        return (
            text.includes('SUMA KOSZTÓW') ||
            text.includes('SUMA KOSZTOW') ||
            text.includes('RAZEM KOSZTY') ||
            text.includes('KOSZT JEDNOSTKOWY')
        );
    }

    /**
     * Rozpoznaje wiersz będący nazwą grupy kosztowej.
     *
     * Grupa ma nazwę w pierwszej kolumnie,
     * ale nie ma danych rzeczywistych:
     * ilości, jednostki, ceny ani kosztu.
     *
     * @param {Array} row
     * @returns {boolean}
     */
    isCostGroupRow(row) {
        const name = cleanText(row[0]);

        if (!name) {
            return false;
        }

        if (
            this.isMainCostSection(
                normalizeText(name)
            ) ||
            this.isCostSummaryRow(row) ||
            this.isSalesHeaderRow(row)
        ) {
            return false;
        }

        const actualQty = parseNumber(row[6]);
        const actualUnit = cleanText(row[7]);
        const unitPrice = parseNumber(row[8]);
        const totalPrice = parseNumber(row[9]);

        return (
            actualQty === null &&
            actualUnit === null &&
            unitPrice === null &&
            totalPrice === null
        );
    }

    /**
     * Zamienia pojedynczy wiersz kosztowy
     * na ujednolicony rekord wynikowy.
     *
     * Wiersze bez niezerowego kosztu rzeczywistego
     * są pomijane.
     *
     * @returns {Object|null}
     */
    parseCostRow({
        row,
        rowIndex,
        project,
        currentSection,
        currentGroup,
        sourceFile,
        sourceSheet,
    }) {
        const costName = cleanText(row[0]);
        const totalPrice = parseNumber(row[9]);

        if (
            !costName ||
            totalPrice === null ||
            totalPrice === 0
        ) {
            return null;
        }

        return {
            task: project.task,
            task_name: project.taskName,

            cost_name: costName,
            cost_group: currentGroup,
            cost_section: currentSection,

            margin: cleanText(row[1]),

            unit_measure:
                cleanText(row[7]) ??
                cleanText(row[3]),

            qty: roundNumber(
                parseNumber(row[6])
            ),

            unit_price: roundNumber(
                parseNumber(row[8])
            ),

            total_price: roundNumber(
                totalPrice,
                2
            ),

            source_file: sourceFile,
            source_sheet: sourceSheet,
            source_row: rowIndex + 1,
        };
    }

    /**
     * Rozpoznaje wiersze podsumowania sprzedaży.
     *
     * @param {Array} row
     * @returns {boolean}
     */
    isSalesSummaryRow(row) {
        const text = rowToNormalizedText(row);

        return (
            text.includes('SUMA SPRZEDAŻY') ||
            text.includes('SUMA SPRZEDAZY') ||
            text.includes('SPRZEDAŻ RAZEM') ||
            text.includes('SPRZEDAZ RAZEM') ||
            text.startsWith('RAZEM') ||
            text.includes('PODSUMOWANIE')
        );
    }

    /**
     * Rozpoznaje nazwę grupy sprzedażowej.
     *
     * Przykład:
     * Blisterpack
     *
     * Wiersz grupy nie zawiera ilości, jednostki,
     * ceny, wartości sprzedaży ani kosztów.
     *
     * @param {Array} row
     * @returns {boolean}
     */
    isSaleGroupRow(row) {
        const name = cleanText(row[0]);

        if (!name) {
            return false;
        }

        const qty = parseNumber(row[2]);
        const unit = cleanText(row[3]);
        const unitPrice = parseNumber(row[4]);
        const saleValue = parseNumber(row[6]);
        const totalCost = parseNumber(row[7]);
        const profitLoss = parseNumber(row[8]);

        return (
            qty === null &&
            unit === null &&
            unitPrice === null &&
            saleValue === null &&
            totalCost === null &&
            profitLoss === null
        );
    }

    /**
     * Zamienia pojedynczy wiersz sprzedażowy
     * na ujednolicony rekord wynikowy.
     *
     * Wiersze bez wartości liczbowych są pomijane.
     *
     * @returns {Object|null}
     */
    parseSaleItemRow({
        row,
        rowIndex,
        project,
        currentGroup,
        sourceFile,
        sourceSheet,
    }) {
        const saleName = cleanText(row[0]);

        if (!saleName) {
            return null;
        }

        const qty = parseNumber(row[2]);
        const unitPrice = parseNumber(row[4]);
        const saleValueCurrency =
            parseNumber(row[5]);
        const saleValuePln =
            parseNumber(row[6]);
        const totalCost =
            parseNumber(row[7]);
        const profitLoss =
            parseNumber(row[8]);
        const marginPercent =
            parsePercent(row[9]);

        const hasAnyValue = [
            qty,
            unitPrice,
            saleValueCurrency,
            saleValuePln,
            totalCost,
            profitLoss,
            marginPercent,
        ].some(
            (value) =>
                value !== null &&
                value !== 0
        );

        if (!hasAnyValue) {
            return null;
        }

        return {
            task: project.task,
            task_name: project.taskName,

            sale_group: currentGroup,
            sale_name: saleName,

            unit_measure: cleanText(row[3]),

            qty: roundNumber(qty),

            unit_price: roundNumber(
                unitPrice
            ),

            sale_value_currency: roundNumber(
                saleValueCurrency,
                2
            ),

            sale_value_pln: roundNumber(
                saleValuePln,
                2
            ),

            total_cost: roundNumber(
                totalCost,
                2
            ),

            profit_loss: roundNumber(
                profitLoss,
                2
            ),

            margin_percent: roundNumber(
                marginPercent,
                2
            ),

            source_file: sourceFile,
            source_sheet: sourceSheet,
            source_row: rowIndex + 1,
        };
    }
}

export default CostsParserV1;