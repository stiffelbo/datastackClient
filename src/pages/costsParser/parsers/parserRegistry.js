import CostsParserV1 from './CostsParserV1';

/**
 * Rejestr klas parserów.
 *
 * Klucz odpowiada wartości wybieranej w UI.
 * Dodanie nowej wersji wymaga jedynie:
 *
 * 1. utworzenia klasy CostsParserV2,
 * 2. zaimportowania jej tutaj,
 * 3. dopisania do parserClasses.
 */
const parserClasses = {
    v1: CostsParserV1,
};

/**
 * Lista dostępnych wersji parsera
 * przeznaczona do wyświetlenia w komponencie TopBar.
 */
export const parserVersions = Object
    .entries(parserClasses)
    .map(([id, ParserClass]) => {
        const parser = new ParserClass();

        return {
            id,
            label: parser.label,
        };
    });

/**
 * Tworzy instancję parsera dla wskazanej wersji.
 *
 * @param {string} version
 * @param {Object} options
 * @returns {BaseCostsParser}
 */
export function createCostsParser(
    version,
    options = {}
) {
    const ParserClass = parserClasses[version];

    if (!ParserClass) {
        throw new Error(
            `Nie znaleziono parsera dla wersji: ${version}`
        );
    }

    return new ParserClass(options);
}