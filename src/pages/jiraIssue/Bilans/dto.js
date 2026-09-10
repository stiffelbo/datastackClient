import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";


const STATUS_CONFIG = {
    success: {
        label: "Bilans poprawny",
        color: "success",
        icon: CheckCircleRoundedIcon,
    },
    warning: {
        label: "Wymaga uwagi",
        color: "warning",
        icon: WarningAmberRoundedIcon,
    },
    error: {
        label: "Bilans niekompletny",
        color: "error",
        icon: ErrorRoundedIcon,
    },
};


const REVENUE_SOURCE_LABELS = {
    calculated_from_pricing: "Wyliczenie z cennika",
    planned_revenue: "Przychód planowany",
    invoiced_revenue: "Przychód zafakturowany",
    cash_received: "Otrzymana płatność",
};


export const isMissing = (value) => {
    return value === null
        || value === undefined
        || value === "";
};


const firstValue = (...values) => {
    return values.find((value) => !isMissing(value)) ?? null;
};


const toNumber = (value) => {
    if (isMissing(value)) {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : null;
};


export const formatNumber = (
    value,
    maximumFractionDigits = 2
) => {
    const number = toNumber(value);

    if (number === null) {
        return null;
    }

    return new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 0,
        maximumFractionDigits,
    }).format(number);
};


export const formatCurrency = (
    value,
    currency = "PLN"
) => {
    const number = toNumber(value);

    if (number === null) {
        return null;
    }

    return new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(number);
};


export const formatDate = (value) => {
    if (isMissing(value)) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("pl-PL").format(date);
};

const groupCostsByMargin = (costs = []) => {
    const grouped = {};

    [1,2,3,4,5,6].map(item => {
        grouped[item] = {
                key: `m${item}`,
                label: `Marża ${item}`,
                value: 0,
                secondary: 0,
            }
    });

    costs.forEach(item => {
        if(grouped[item.margin]){
            grouped[item.margin]['value'] += +item.total;
        }else{
            grouped[item.margin] = {
                key: `m${item.margin}`,
                label: `Marża ${item.margin}`,
                value: +item.total,
                secondary: null,
            }
        }
    });

    
    const result = Object.keys(grouped).sort((a,b) => a.key - b.key).map(key => grouped[key]);

    return result;
}

const prepareProjectSection = ({
    info,
    project,
    revenue,
}) => {
    const number = firstValue(
        project.project_number,
    );

    const name = firstValue(
        info?.project?.name
    );

    const contractor = firstValue(
        info?.project?.contractor?.name
    );

    const structureName = firstValue(
        info?.structure?.name
    );

    return {
        heading: {
            number,
            name,
            title: [
                number || "Brak numeru",
                name || "Projekt bez nazwy",
            ].join(" – "),
            contractor,
            projectStatus: firstValue(
                project.status,
                info?.project?.status
            ),
            productGroup: firstValue(
                project.issue_group?.name,
                info?.project.issue_group?.name
            ),
            structure: structureName,
            active: isMissing(
                firstValue(
                    project.is_active,
                    info?.project.is_active
                )
            )
                ? null
                : firstValue(
                    project.is_active,
                    info?.project.is_active
                )
                    ? "Aktywny"
                    : "Nieaktywny",
        },
    };
};

const prepareQuantities = ({ info }) => {
    const quantities = info?.quantities ?? {};
    const project = info?.project ?? {};

    const ordered = firstValue(
        quantities.ordered
    );

    const toDo = firstValue(
        quantities.to_do
    );

    const done = firstValue(
        quantities.done
    );

    const dispatched = firstValue(
        quantities.dispatched
    );

    const invoiced = firstValue(
        quantities.invoiced
    );

    const isOrder = firstValue(
        project.is_order
    );

    return {
        isOrder,

        orderLabel: isMissing(isOrder)
            ? null
            : isOrder
                ? "Zamówienie"
                : "Projekt",

        fields: [
            {
                key: "ordered",
                label: "Zamówiono",
                value: ordered,
                formatter: formatNumber,
            },
            {
                key: "toDo",
                label: "Do wykonania",
                value: toDo,
                formatter: formatNumber,
            },
            {
                key: "done",
                label: "Wykonano",
                value: done,
                formatter: formatNumber,
            },
            {
                key: "dispatched",
                label: "Wysłano",
                value: dispatched,
                formatter: formatNumber,
            },
            {
                key: "invoiced",
                label: "Zafakturowano",
                value: invoiced,
                formatter: formatNumber,
            },
        ],
    };
};

const prepareScheduleSection = ({
    info,
    project,
}) => {
    const dates = info?.dates ?? {};

    console.log(dates, project);

    const projectStart = firstValue(
        project.received
    );

    const projectEnd = firstValue(
        project.resolved,
    );

    const productionRequest = firstValue(
        project.production_requested,

    );

    const productionStart = firstValue(
        project.production_started,

    );

    const productionEnd = firstValue(
        project.production_ended,
    );

    return {
        project: {
            start: projectStart,
            end: projectEnd,
            durationDays: project.duration_days,
        },

        production: {
            request : productionRequest,
            start: productionStart,
            end: productionEnd,
            durationDays: project.production_days,
        },

        dates: [
            {
                key: "received",
                label: "Przyjęto",
                value: dates.received,
                formatter: formatDate,
            },
            {
                key: "productionRequested",
                label: "Produkcja od",
                value: firstValue(
                    project.production_requested,
                    dates.production_requested
                ),
                formatter: formatDate,
            },
            {
                key: "productionStarted",
                label: "Start produkcji",
                value: productionStart,
                formatter: formatDate,
            },
            {
                key: "productionEnded",
                label: "Koniec produkcji",
                value: productionEnd,
                formatter: formatDate,
            },
            {
                key: "resolved",
                label: "Zamknięto",
                value: firstValue(
                    project.resolved,
                    dates.resolved
                ),
                formatter: formatDate,
            },
        ],
    };
};

const prepareSummarySection = ({ summary, profitability, hours }) => ({
    values: [
        {
            key: "revenue",
            label: "Przychód",
            value: firstValue(
                summary.revenue_net_pln,
                profitability.revenue_net_pln
            ),
            formatter: formatCurrency,
        },
        {
            key: "costs",
            label: "Koszty",
            value: firstValue(
                summary.costs_net_pln,
                profitability.costs_net_pln
            ),
            formatter: formatCurrency,
        },
        {
            key: "profit",
            label: "Wynik",
            value: firstValue(
                summary.profit_net_pln,
                profitability.profit_net_pln
            ),
            formatter: formatCurrency,
            emphasize: true,
        },
        {
            key: "margin",
            label: "Marża",
            value: firstValue(
                summary.margin_pct,
                profitability.margin_pct
            ),
            formatter: (value) => {
                return `${formatNumber(value)}%`;
            },
            emphasize: true,
        },
        {
            key: "hours",
            label: "Roboczogodziny",
            value: hours.total,
            formatter: (value) => {
                return `${formatNumber(value)} h`;
            },
        },
    ],
});


const prepareRevenueSection = ({ revenue }) => {
    const currency = revenue.currency || "PLN";

    return {
        title: "Przychód",

        fields: [
            {
                key: "design",
                label: "Design",
                value: revenue.design_net,
                formatter: (value) => {
                    return formatCurrency(value, currency);
                },
            },
            {
                key: "setup",
                label: "Setup",
                value: revenue.setup_net,
                formatter: (value) => {
                    return formatCurrency(value, currency);
                },
            },
            {
                key: "unit",
                label: "Cena jednostkowa",
                value: revenue.unit_net,
                formatter: (value) => {
                    return formatCurrency(value, currency);
                },
            },
            {
                key: "quantity",
                label: "Zafakturowano",
                value: revenue.quantity,
                formatter: (value) => {
                    return formatNumber(value, 0);
                },
            },
            {
                key: "currency",
                label: "Waluta",
                value: currency,
                alertWhenMissing: false,
            },
            {
                key: "rate",
                label: "Kurs",
                value: revenue.conversion_rate,
                formatter: (value) => {
                    return formatNumber(value, 4);
                },
            },
        ],

        totals: [
            {
                key: "totalCurrency",
                label: `Przychód netto ${currency}`,
                value: revenue.total_currency,
                formatter: (value) => {
                    return formatCurrency(value, currency);
                },
            },
            {
                key: "totalPln",
                label: "Przychód netto PLN",
                value: revenue.total_pln,
                formatter: (value) => {
                    return formatCurrency(value, "PLN");
                },
            },
        ],
    };
};


const prepareCostsSection = ({ costs, hours, costsDetails }) => ({
    title: "Koszty",

    totals: [
        {
            key: "totalCosts",
            label: "Łączny koszt",
            value: firstValue(
                costs.total_net_pln,
                costs.total
            ),
            formatter: formatCurrency,
            strong: true,
        },
        {
            key: "totalHours",
            label: "Roboczogodziny",
            value: hours.total,
            formatter: (value) => {
                return `${formatNumber(value)} h`;
            },
            strong: true,
        },
    ],

    distributions: [
        {
            key: "costsByMargin",
            title: "Per Marża",
            valueFormatter: formatCurrency,
            items: groupCostsByMargin(costsDetails),
            cumulative: true
        },
        {
            key: "costStructure",
            title: "Struktura kosztów",
            valueFormatter: formatCurrency,
            items: [
                {
                    key: "work",
                    label: "Praca",
                    value: costs.work?.total_net_pln,
                    secondary: !isMissing(costs.work?.hours)
                        ? `${formatNumber(costs.work.hours)} h`
                        : null,
                },
                {
                    key: "materials",
                    label: "Materiały",
                    value: costs.materials?.total_net_pln,
                },
                {
                    key: "purchases",
                    label: "Zakupy",
                    value: costs.purchases?.total_net_pln,
                },
                {
                    key: "departments",
                    label: "Wydziałowe",
                    value: costs.departments?.total_net_pln,
                },
            ],
            cumulative : false
        },
        {
            key: "departments",
            title: "Koszt pracy według działów",
            valueFormatter: formatCurrency,
            items: (hours.by_department ?? []).map(
                (department, index) => ({
                    key:
                        department.department_id
                        ?? department.department_name
                        ?? index,
                    label:
                        department.department_name
                        || "Nieprzypisany dział",
                    value: department.cost_net_pln,
                    secondary: !isMissing(department.hours)
                        ? `${formatNumber(department.hours)} h`
                        : null,
                })
            ),
            cumulative : false
        },
    ],
});


const prepareRemarksSection = ({ remarks, status }) => ({
    count: remarks.length,
    items: remarks,
    severity: status.color,
    label: remarks.length === 1
        ? "Bilans zawiera 1 uwagę"
        : `Bilans zawiera ${remarks.length} uwagi`,
});


export const createBilansSummaryDto = (response) => {
    const info = response?.info ?? {};
    const bilans = response?.bilans ?? response ?? {};
    const costsDetails = response?.costs ?? [];

    const {
        summary = {},
        project = {},
        revenue = {},
        costs = {},
        hours = {},
        profitability = {},
        remarks_summary: remarks = [],
    } = bilans;

    const status =
        STATUS_CONFIG[summary.status]
        ?? STATUS_CONFIG.warning;

    return {
        status,

        project: prepareProjectSection({
            info,
            project,
            revenue,
        }),

        quantities: prepareQuantities({ info }),

        schedule: prepareScheduleSection({ info, project }),

        summary: prepareSummarySection({
            summary,
            profitability,
            hours,
        }),

        revenue: prepareRevenueSection({
            revenue,
        }),

        costs: prepareCostsSection({
            costs,
            hours,
            costsDetails
        }),

        remarks: prepareRemarksSection({
            remarks,
            status,
        }),
    };
};
