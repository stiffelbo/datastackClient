import * as XLSX from 'xlsx';

/**
 * Bazowa klasa parsera kart kosztowych.
 *
 * Odpowiada za:
 * - odczyt plików XLS/XLSX/ODS,
 * - przechodzenie po arkuszach,
 * - łączenie wyników,
 * - obsługę błędów,
 * - budowanie zbiorczej listy projektów.
 *
 * Konkretna wersja parsera implementuje parseSheet().
 */
class BaseCostsParser {
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * Techniczny identyfikator wersji parsera.
     *
     * @returns {string}
     */
    get id() {
        throw new Error('Parser musi definiować identyfikator id.');
    }

    /**
     * Nazwa parsera wyświetlana w UI.
     *
     * @returns {string}
     */
    get label() {
        return this.id;
    }

    /**
     * Parsuje wiele plików i scala wyniki.
     *
     * Każdy plik jest przetwarzany niezależnie.
     * Błąd jednego pliku nie zatrzymuje pozostałych.
     *
     * @param {File[]} files
     * @returns {Promise<{
     *   costs: Array,
     *   saleItems: Array,
     *   issues: Array,
     *   errors: Array,
     *   stats: Object
     * }>}
     */
    async parseFiles(files) {
        const costs = [];
        const saleItems = [];
        const errors = [];

        for (const file of files) {
            try {
                const fileResult = await this.parseFile(file);

                costs.push(...fileResult.costs);
                saleItems.push(...fileResult.saleItems);
            } catch (error) {
                console.error(
                    `Błąd parsowania pliku ${file.name}`,
                    error
                );

                errors.push({
                    source_file: file.name,
                    parser_version: this.id,
                    message:
                        error instanceof Error
                            ? error.message
                            : String(error),
                });
            }
        }

        const issues = this.buildIssues(
            costs,
            saleItems
        );

        return {
            costs,
            saleItems,
            issues,
            errors,

            stats: {
                files_count: files.length,
                costs_count: costs.length,
                sale_items_count: saleItems.length,
                issues_count: issues.length,
                errors_count: errors.length,

                total_costs: this.sumField(
                    costs,
                    'total_price'
                ),

                total_sales: this.sumField(
                    saleItems,
                    'sale_value_pln'
                ),

                total_profit: this.sumField(
                    saleItems,
                    'profit_loss'
                ),
            },
        };
    }

    /**
     * Odczytuje pojedynczy plik i przekazuje workbook
     * do dalszego parsowania.
     *
     * @param {File} file
     * @returns {Promise<{costs: Array, saleItems: Array}>}
     */
    async parseFile(file) {
        const buffer = await file.arrayBuffer();

        const workbook = XLSX.read(buffer, {
            type: 'array',
            raw: true,
            cellDates: true,
            cellFormula: true,
        });

        return this.parseWorkbook(
            workbook,
            file
        );
    }

    /**
     * Przechodzi po wszystkich arkuszach pliku.
     *
     * Każdy arkusz zamieniany jest na tablicę tablic,
     * a następnie przekazywany do parseSheet().
     *
     * @param {Object} workbook
     * @param {File} file
     * @returns {{costs: Array, saleItems: Array}}
     */
    parseWorkbook(workbook, file) {
        const costs = [];
        const saleItems = [];

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];

            if (!worksheet) {
                continue;
            }

            const matrix = XLSX.utils.sheet_to_json(
                worksheet,
                {
                    header: 1,
                    raw: true,
                    defval: null,
                    blankrows: false,
                }
            );

            const result = this.parseSheet({
                matrix,
                sourceFile: file.name,
                sourceSheet: sheetName,
            });

            costs.push(...(result.costs ?? []));
            saleItems.push(...(result.saleItems ?? []));
        }

        return {
            costs,
            saleItems,
        };
    }

    /**
     * Parsuje pojedynczy arkusz.
     *
     * Metoda musi zostać zaimplementowana
     * w konkretnej wersji parsera.
     *
     * @returns {{costs: Array, saleItems: Array}}
     */
    parseSheet() {
        throw new Error(
            'Metoda parseSheet() nie została zaimplementowana.'
        );
    }

    /**
     * Buduje zbiorczą listę projektów.
     *
     * Lista issue zawiera:
     * - task,
     * - nazwę projektu,
     * - liczbę pozycji kosztowych,
     * - liczbę pozycji sprzedażowych,
     * - sumę kosztów,
     * - sumę sprzedaży,
     * - wynik projektu.
     *
     * @param {Array} costs
     * @param {Array} saleItems
     * @returns {Array}
     */
    /**
 * Buduje zbiorczą listę projektów na podstawie kosztów
 * i pozycji sprzedażowych.
 *
 * Dla każdego projektu wylicza:
 * - liczbę pozycji kosztowych,
 * - liczbę pozycji sprzedażowych,
 * - sumę kosztów,
 * - sumę sprzedaży,
 * - zysk lub stratę,
 * - marżę procentową,
 * - ilość sprzedażową,
 * - jednostkę miary,
 * - cenę jednostkową.
 *
 * Ilość jest sumowana tylko wtedy, gdy wszystkie pozycje
 * sprzedażowe projektu używają tej samej jednostki miary.
 *
 * Cena jednostkowa jest zwracana tylko wtedy, gdy wszystkie
 * pozycje sprzedażowe mają tę samą cenę.
 *
 * @param {Array} costs
 * @param {Array} saleItems
 * @returns {Array}
 */
    buildIssues(costs, saleItems) {
        const issuesMap = new Map();

        /**
         * Buduje stabilny klucz projektu.
         */
        const getIssueKey = (row) => {
            if (row.task) {
                return `TASK:${row.task}`;
            }

            if (row.task_name) {
                return `NAME:${row.task_name}`;
            }

            return `FILE:${row.source_file ?? 'unknown'}`;
        };

        /**
         * Tworzy wpis projektu, jeżeli jeszcze nie istnieje.
         */
        const ensureIssue = (row) => {
            const key = getIssueKey(row);

            if (!issuesMap.has(key)) {
                issuesMap.set(key, {
                    task: row.task ?? null,
                    task_name: row.task_name ?? null,

                    costs_count: 0,
                    sale_items_count: 0,

                    total_costs: 0,
                    total_sales: 0,

                    sale_items: [],
                    source_files: new Set(),
                });
            }

            return issuesMap.get(key);
        };

        /*
         * Koszty projektu.
         */
        for (const cost of costs) {
            const issue = ensureIssue(cost);

            issue.costs_count += 1;
            issue.total_costs +=
                Number(cost.total_price) || 0;

            if (cost.source_file) {
                issue.source_files.add(cost.source_file);
            }
        }

        /*
         * Pozycje sprzedażowe projektu.
         */
        for (const saleItem of saleItems) {
            const issue = ensureIssue(saleItem);

            issue.sale_items_count += 1;
            issue.total_sales +=
                Number(saleItem.sale_value_pln) || 0;

            issue.sale_items.push(saleItem);

            if (saleItem.source_file) {
                issue.source_files.add(
                    saleItem.source_file
                );
            }
        }

        return Array.from(issuesMap.values()).map((issue) => {
            const profitLoss =
                issue.total_sales -
                issue.total_costs;

            const marginPercent =
                issue.total_sales !== 0
                    ? (
                        profitLoss /
                        issue.total_sales
                    ) * 100
                    : null;

            /*
             * Unikatowe jednostki miary.
             */
            const units = Array.from(
                new Set(
                    issue.sale_items
                        .map((item) => item.unit_measure)
                        .filter(Boolean)
                )
            );

            /*
             * Unikatowe ceny jednostkowe.
             */
            const unitPrices = Array.from(
                new Set(
                    issue.sale_items
                        .map((item) => item.unit_price)
                        .filter(
                            (value) =>
                                value !== null &&
                                value !== undefined
                        )
                        .map((value) => Number(value))
                )
            );

            /*
             * Ilość sumujemy tylko przy jednej wspólnej jednostce.
             *
             * Nie sumujemy np. sztuk i kilogramów.
             */
            const qty =
                units.length <= 1
                    ? issue.sale_items.reduce(
                        (sum, item) =>
                            sum +
                            (Number(item.qty) || 0),
                        0
                    )
                    : null;

            /*
             * Jedna cena jest zwracana tylko wtedy,
             * gdy wszystkie pozycje mają tę samą cenę.
             */
            const unitPrice =
                unitPrices.length === 1
                    ? unitPrices[0]
                    : null;

            return {
                task: issue.task,
                task_name: issue.task_name,

                qty:
                    qty === null
                        ? null
                        : Math.round(qty * 10000) / 10000,

                unit_measure:
                    units.length === 0
                        ? null
                        : units.join(', '),

                unit_price:
                    unitPrice === null
                        ? null
                        : Math.round(
                            unitPrice * 10000
                        ) / 10000,

                costs_count: issue.costs_count,
                sale_items_count:
                    issue.sale_items_count,

                total_costs:
                    Math.round(
                        issue.total_costs * 100
                    ) / 100,

                total_sales:
                    Math.round(
                        issue.total_sales * 100
                    ) / 100,

                profit_loss:
                    Math.round(
                        profitLoss * 100
                    ) / 100,

                margin_percent:
                    marginPercent === null
                        ? null
                        : Math.round(
                            marginPercent * 100
                        ) / 100,

                source_files: Array.from(
                    issue.source_files
                ).join(', '),
            };
        });
    }

    /**
     * Sumuje wskazane pole numeryczne w tablicy.
     *
     * @param {Array} rows
     * @param {string} field
     * @returns {number}
     */
    sumField(rows, field) {
        const result = rows.reduce(
            (sum, row) =>
                sum + (Number(row[field]) || 0),
            0
        );

        return Math.round(result * 100) / 100;
    }
}

export default BaseCostsParser;