
// Pola z prefiksem _ są wyliczane i nie powinny być zapisywane do bazy.
// Czas wyrażony w godzinach.
// reported_time jest sumą zaraportowanych roboczogodzin.

// ============================================================
// HELPERS
// ============================================================

const numeric = (value, fallback = 0) =>
    value == null || value === '' ? fallback : Number(value);

const nullableNumber = value =>
    value == null || value === '' ? null : Number(value);

const flag = value =>
    value === true || value === 1 || value === '1';

const percent = (a, b) =>
    b > 0 ? a / b * 100 : null;

const round = value =>
    Math.round((value + Number.EPSILON) * 100) / 100;


// ============================================================
// DATY I DNI ROBOCZE
// ============================================================

const dateOnly = value => {
    if (!value) return null;

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;

    const [, year, month, day] = match.map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year
        && date.getMonth() === month - 1
        && date.getDate() === day
        ? date
        : null;
};

// Poniedziałek–piątek, bez dnia dzisiejszego.
// Nie uwzględnia świąt ustawowych.
// Wynik ujemny oznacza przekroczenie terminu.

const remainingWorkDays = (deadline, today = new Date()) => {
    const end = dateOnly(deadline);
    if (!end) return null;

    const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const endUtc = Date.UTC(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
    );

    const startUtc = Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
    );

    if (endUtc === startUtc) return 0;

    const sign = endUtc > startUtc ? 1 : -1;
    let count = 0;

    for (
        let ms = startUtc + sign * 86400000;
        sign * ms <= sign * endUtc;
        ms += sign * 86400000
    ) {
        const weekday = new Date(ms).getUTCDay();

        if (weekday !== 0 && weekday !== 6) {
            count++;
        }
    }

    return sign * count;
};


// ============================================================
// PROGRAMATYCZNY STATUS I TEMPO
// ============================================================

const paceLabel = pct => {
    if (pct == null || !Number.isFinite(pct) || pct <= 0) {
        return '⚠️ Brak danych';
    }

    if (pct > 200) return '😈 Coś za szybko (oszczędność >100%)';
    if (pct > 130) return '🚀 Bardzo szybko (oszczędność >30%)';
    if (pct > 105) return '🏎️ Szybciej (oszczędność 5–30%)';
    if (pct >= 95) return '✅ W tempie (±5%)';
    if (pct >= 80) return '🐢 Wolniej (opóźnienie 5–20%)';
    if (pct >= 60) return '🐌 Wyraźnie wolniej (opóźnienie 20–40%)';
    if (pct >= 40) return '😱 Znacznie wolniej (opóźnienie 40–60%)';

    return '💀 Drastycznie wolniej (opóźnienie >60%)';
};

const progressStatus = task => {
    if (task.is_done) return 'Zakończone';

    if (task.target_qty <= 0) {
        return task.reported_time > 0
            ? 'W realizacji'
            : 'Bez nakładu';
    }

    if (task.current_qty >= task.target_qty) {
        return 'Zrealizowane';
    }

    if (task.current_qty > 0 || task.reported_time > 0) {
        return 'W realizacji';
    }

    return 'Nie rozpoczęte';
};


// ============================================================
// NORMALIZACJA ZADANIA
// ============================================================

const normalizeTask = task => ({
    // Identyfikacja
    id: numeric(task.id, null),
    issue_id: nullableNumber(task.issue_id),
    product_order_id: nullableNumber(task.product_order_id),
    issue_key: task.issue_key ?? null,
    product_order_slug: task.product_order_slug ?? null,
    product_id: nullableNumber(task.product_id),

    // Proces i marszruta
    process_id: nullableNumber(task.process_id),
    processName: task.processName ?? '',
    structureName: task.structureName ?? '',
    name: task.name ?? '',
    description: task.description ?? '',
    sequence_no: numeric(task.sequence_no),
    status: task.status ?? 'draft',
    category: task.category ?? null,
    code: task.code ?? null, //tutaj zapiszemy zależnośći DAG miedzy taskami

    // Ilości
    target_qty: numeric(task.target_qty),
    current_qty: numeric(task.current_qty),
    available_qty: numeric(task.available_qty),
    consumed_qty: numeric(task.consumed_qty),

    // Normy i raportowanie [h]
    norm_time_fixed: nullableNumber(task.norm_time_fixed),
    norm_time_calculated: nullableNumber(task.norm_time_calculated),
    reported_time: numeric(task.reported_time),
    reported_correction_time: numeric(task.reported_correction_time),

    // Zasoby i priorytety
    // persons = maksymalna obsada zadania dla APS
    persons: numeric(task.persons, 1),
    structure_id: nullableNumber(task.structure_id),
    user_id: nullableNumber(task.user_id),
    priority: flag(task.priority),

    // Flagi
    is_done: flag(task.is_done),
    //is_semi_product: flag(task.is_semi_product),
    is_outsourced: flag(task.is_outsourced),
    //is_manual_progress: flag(task.is_manual_progress),
    //is_correction: flag(task.is_correction),
    //is_estimated: flag(task.is_estimated),
    //is_critical: flag(task.is_critical),
    is_active: flag(task.is_active),
    //is_archived: flag(task.is_archived),

    // Harmonogram
    planned_start_at: task.planned_start_at ?? null,
    planned_end_at: task.planned_end_at ?? null,
    deadline_at: task.deadline_at ?? null,
    started_at: task.started_at ?? null,
    completed_at: task.completed_at ?? null,

    // Metadane
    //attrs: task.attrs ?? null,
    created_at: task.created_at ?? null,
    created_by: nullableNumber(task.created_by),
    updated_at: task.updated_at ?? null,
    updated_by: nullableNumber(task.updated_by),
});


// ============================================================
// KPI POJEDYNCZEGO ZADANIA
// ============================================================

const calculateTaskKpi = dto => {
    const target = dto.target_qty;
    const current = dto.current_qty;
    const reported = dto.reported_time;

    const fixed = dto.norm_time_fixed;
    const calculated = dto.norm_time_calculated;

    // Norma obowiązująca: stała ma pierwszeństwo
    const effective = fixed != null && fixed > 0
        ? fixed
        : calculated;

    // Pozostała ilość
    const remainingQty = Math.max(0, target - current);

    // Czas jednostkowy [h/szt.]
    const realUnit = current > 0 && reported > 0
        ? reported / current
        : null;

    const normUnit = effective != null && target > 0
        ? effective / target
        : null;

    // Czas pozostały według normy
    const remainingNorm = normUnit != null
        ? remainingQty * normUnit
        : null;

    // Czas pozostały według rzeczywistej wydajności
    const remainingReal = realUnit != null
        ? remainingQty * realUnit
        : null;

    // Efektywny czas pozostały:
    // - zadanie zakończone: 0
    // - rozpoczęte: prognoza rzeczywista
    // - nierozpoczęte: norma
    const remainingEffective = remainingQty === 0
        ? 0
        : remainingReal ?? remainingNorm;

    // Prognoza całkowitego czasu zadania
    const estimatedTotal = remainingEffective != null
        ? reported + remainingEffective
        : null;

    // Tempo względem norm [%]
    const paceFixed = fixed > 0 && estimatedTotal > 0
        ? percent(fixed, estimatedTotal)
        : null;

    const paceCalculated = calculated > 0 && estimatedTotal > 0
        ? percent(calculated, estimatedTotal)
        : null;

    const paceEffective = effective > 0 && estimatedTotal > 0
        ? percent(effective, estimatedTotal)
        : null;

    // Termin
    const workDays = remainingWorkDays(dto.deadline_at);

    return {
        ...dto,

        // ----------------------------------------
        // Normy
        // ----------------------------------------

        _norm_effective: effective,
        _norm_per_unit: normUnit,
        _norm_real: realUnit,

        // ----------------------------------------
        // Wydajność [szt./h]
        // ----------------------------------------

        _qty_per_hour_fixed: fixed > 0
            ? target / fixed
            : null,

        _qty_per_hour_calculated: calculated > 0
            ? target / calculated
            : null,

        _qty_per_hour_real: reported > 0
            ? current / reported
            : null,

        // ----------------------------------------
        // Realizacja ilościowa
        // ----------------------------------------

        _remaining_qty: remainingQty,
        _progress_pct: percent(current, target),
        _progress_status: progressStatus(dto),

        // ----------------------------------------
        // Czas [h]
        // ----------------------------------------

        _remaining_time_norm: remainingNorm,
        _remaining_time_real: remainingReal,
        _remaining_time: remainingEffective,
        _estimated_total_time: estimatedTotal,

        // ----------------------------------------
        // Tempo
        // ----------------------------------------

        _pace_pct: paceEffective,
        _pace_label: paceLabel(paceEffective),

        _pace_fixed_pct: paceFixed,
        _pace_fixed_label: paceLabel(paceFixed),

        _pace_calculated_pct: paceCalculated,
        _pace_calculated_label: paceLabel(paceCalculated),

        // ----------------------------------------
        // Poprawki i odchylenia
        // ----------------------------------------

        _correction_pct: percent(
            dto.reported_correction_time,
            reported
        ),

        _time_deviation_pct: effective > 0 && estimatedTotal != null
            ? (estimatedTotal - effective) / effective * 100
            : null,

        // ----------------------------------------
        // Harmonogram
        // ----------------------------------------

        _remaining_work_days: workDays,
        _is_overdue: workDays != null && workDays < 0,
    };
};


// ============================================================
// AGREGACJA ZADAŃ W RAMACH ZAMÓWIENIA
// ============================================================

// Preferujemy product_order_id.
// Jeśli nie ma zlecenia, grupujemy po issue_id.
// Zadania bez obu identyfikatorów pozostają osobnymi grupami.

const orderKey = task => {
    if (task.product_order_id != null) {
        return `order:${task.product_order_id}`;
    }

    if (task.issue_id != null) {
        return `issue:${task.issue_id}`;
    }

    return `task:${task.id}`;
};


// ============================================================
// PILNOŚĆ ZAMÓWIENIA
// ============================================================

// Legacy:
// pilność = godziny pozostałe / max(1, dni robocze)
//
// Gdy do terminu zostało mniej niż 4 dni,
// dodajemy premię 10 - dni.
//
// Wynik jest wskaźnikiem porządkowym, nie liczbą godzin.

const calculateUrgency = (hours, days) => {
    if (days == null || hours <= 0) return 0;

    const base = round(hours / Math.max(1, days));

    const bonus = days < 4 && base > 0
        ? 10 - days
        : 0;

    return round(base + bonus);
};


// ============================================================
// PUBLIC API
// ============================================================

export const taskDto = ({ task = {} } = {}) =>
    calculateTaskKpi(normalizeTask(task));


export const tasksDto = ({ data = [] } = {}) => {
    if (!Array.isArray(data)) return [];

    // 1. Normalizacja i KPI poszczególnych zadań
    const tasks = data.map(task => taskDto({ task }));

    // 2. Grupowanie według zamówienia
    const groups = new Map();

    for (const task of tasks) {
        const key = orderKey(task);

        if (!groups.has(key)) {
            groups.set(key, {
                remaining: 0,
                reported: 0,
                fixed: 0,
                calculated: 0,
                deadline: null,
                missingEstimates: 0,
            });
        }

        const group = groups.get(key);

        // Suma pozostałych godzin
        group.remaining += task._remaining_time ?? 0;

        // Informacja o brakujących prognozach
        if (task._remaining_time == null) {
            group.missingEstimates++;
        }

        // Suma raportów i norm
        group.reported += task.reported_time;
        group.fixed += task.norm_time_fixed ?? 0;
        group.calculated += task.norm_time_calculated ?? 0;

        // Najwcześniejszy termin w grupie
        const deadline = dateOnly(task.deadline_at);

        if (deadline && (!group.deadline || deadline < group.deadline)) {
            group.deadline = deadline;
        }
    }

    // 3. Przypisanie KPI zamówienia do każdego zadania
    return tasks.map(task => {
        const group = groups.get(orderKey(task));

        const deadline = group.deadline
            ? [
                group.deadline.getFullYear(),
                String(group.deadline.getMonth() + 1).padStart(2, '0'),
                String(group.deadline.getDate()).padStart(2, '0'),
            ].join('-')
            : null;

        const days = remainingWorkDays(deadline);

        return {
            ...task,

            // Suma godzin w zamówieniu
            _order_remaining_hours: group.remaining,
            _order_reported_hours: group.reported,
            _order_norm_fixed_hours: group.fixed,
            _order_norm_calculated_hours: group.calculated,

            // Kompletność prognozy
            _order_missing_estimates: group.missingEstimates,
            _order_estimate_complete: group.missingEstimates === 0,

            // Termin zamówienia
            _order_deadline: deadline,
            _order_remaining_work_days: days,

            // Pilność całego zamówienia
            _urgency: calculateUrgency(group.remaining, days),
        };
    });
};


const kpiSchemaMap = {
    // Normy
    _norm_effective: {
        headerName: 'Norma efektywna [h]',
        description: 'Norma stała, jeżeli jest dodatnia; w przeciwnym razie norma kalkulowana.',
        formatterKey: 'number4',
        aggregationFn: 'sum',
    },
    _norm_per_unit: {
        headerName: 'Norma [h/szt.]',
        description: 'Norma efektywna podzielona przez nakład zadania.',
        formatterKey: 'number4',
    },
    _norm_real: {
        headerName: 'Czas rzeczywisty [h/szt.]',
        description: 'Czas zaraportowany podzielony przez ilość wykonaną.',
        formatterKey: 'number4',
    },

    // Wydajność
    _qty_per_hour_fixed: {
        headerName: 'Wydajność stała [szt./h]',
        description: 'Nakład podzielony przez normę stałą.',
        formatterKey: 'number4',
    },
    _qty_per_hour_calculated: {
        headerName: 'Wydajność kalk. [szt./h]',
        description: 'Nakład podzielony przez normę kalkulowaną.',
        formatterKey: 'number4',
    },
    _qty_per_hour_real: {
        headerName: 'Wydajność rzeczywista [szt./h]',
        description: 'Ilość wykonana podzielona przez czas zaraportowany.',
        formatterKey: 'number4',
    },

    // Realizacja
    _remaining_qty: {
        headerName: 'Pozostało [szt.]',
        description: 'Nakład pomniejszony o ilość wykonaną, nie mniej niż zero.',
        aggregationFn: 'sum',
        formatterKey: 'number',
    },
    _progress_pct: {
        headerName: 'Postęp [%]',
        description: 'Udział ilości wykonanej w nakładzie.',
        formatterKey: 'percent',
    },
    _progress_status: {
        headerName: 'Status realizacji',
        description: 'Status wyliczony na podstawie wykonania, raportowania i zamknięcia zadania.',
        type: 'string',
        width: 150,
    },

    // Pozostały czas
    _remaining_time_norm: {
        headerName: 'Pozostało wg normy [h]',
        description: 'Pozostała ilość pomnożona przez normę jednostkową.',
        aggregationFn: 'sum',
        formatterKey: 'number4',
    },
    _remaining_time_real: {
        headerName: 'Pozostało wg wykonania [h]',
        description: 'Prognoza na podstawie rzeczywistego czasu jednostkowego.',
        aggregationFn: 'sum',
        formatterKey: 'number4',
    },
    _remaining_time: {
        headerName: 'Pozostało [h]',
        description: 'Prognoza według rzeczywistego tempa, a gdy go brak — według normy.',
        aggregationFn: 'sum',
        formatterKey: 'number4',
    },
    _estimated_total_time: {
        headerName: 'Prognoza całkowita [h]',
        description: 'Czas zaraportowany plus prognozowany czas pozostały.',
        aggregationFn: 'sum',
        formatterKey: 'number4',
    },

    // Tempo
    _pace_pct: {
        headerName: 'Tempo [%]',
        description: 'Stosunek normy efektywnej do prognozowanego całkowitego czasu zadania.',
        formatterKey: 'percent',
    },
    _pace_label: {
        headerName: 'Ocena tempa',
        description: 'Opisowa ocena tempa względem normy efektywnej.',
        type: 'string',
        width: 190,
    },
    _pace_fixed_pct: {
        headerName: 'Tempo wg normy stałej [%]',
        description: 'Norma stała podzielona przez prognozowany całkowity czas.',
        formatterKey: 'percent',
    },
    _pace_fixed_label: {
        headerName: 'Ocena wg normy stałej',
        description: 'Opisowa ocena tempa względem normy stałej.',
        type: 'string',
        width: 190,
    },
    _pace_calculated_pct: {
        headerName: 'Tempo wg normy kalk. [%]',
        description: 'Norma kalkulowana podzielona przez prognozowany całkowity czas.',
        formatterKey: 'percent',
    },
    _pace_calculated_label: {
        headerName: 'Ocena wg normy kalk.',
        description: 'Opisowa ocena tempa względem normy kalkulowanej.',
        type: 'string',
        width: 190,
    },

    // Odchylenia
    _correction_pct: {
        headerName: 'Udział poprawek [%]',
        description: 'Czas poprawek jako procent całego zaraportowanego czasu.',
        formatterKey: 'percent',
    },
    _time_deviation_pct: {
        headerName: 'Odchylenie czasu [%]',
        description: 'Procentowe przekroczenie lub oszczędność względem normy efektywnej.',
        formatterKey: 'percent',
    },

    // Harmonogram
    _remaining_work_days: {
        headerName: 'Pozostało dni roboczych',
        description: 'Dni robocze do terminu, bez świąt ustawowych i dnia bieżącego.',
        formatterKey: 'number',
    },
    _is_overdue: {
        headerName: 'Po terminie',
        description: 'Termin zadania został przekroczony.',
        type: 'boolean',
        width: 100,
    },

    // Agregaty zamówienia
    _order_remaining_hours: {
        headerName: 'Zamówienie: pozostało [h]',
        description: 'Łączna prognoza pozostałego czasu dla zadań zamówienia.',
        formatterKey: 'number2',
    },
    _order_reported_hours: {
        headerName: 'Zamówienie: raportowano [h]',
        description: 'Łączny czas zaraportowany dla zamówienia.',
        formatterKey: 'number2',
    },
    _order_norm_fixed_hours: {
        headerName: 'Zamówienie: norma stała [h]',
        description: 'Suma norm stałych zadań zamówienia.',
        formatterKey: 'number2',
    },
    _order_norm_calculated_hours: {
        headerName: 'Zamówienie: norma kalk. [h]',
        description: 'Suma norm kalkulowanych zadań zamówienia.',
        formatterKey: 'number2',
    },
    _order_missing_estimates: {
        headerName: 'Brak estymacji',
        description: 'Liczba zadań zamówienia bez prognozy pozostałego czasu.',
        formatterKey: 'number',
    },
    _order_estimate_complete: {
        headerName: 'Kompletna estymacja',
        description: 'Czy wszystkie zadania zamówienia posiadają prognozę czasu.',
        type: 'boolean',
    },
    _order_deadline: {
        headerName: 'Termin zamówienia',
        description: 'Najwcześniejszy termin spośród zadań zamówienia.',
        type: 'date',
        width: 130,
    },
    _order_remaining_work_days: {
        headerName: 'Dni do terminu zamówienia',
        description: 'Liczba dni roboczych do terminu zamówienia.',
        formatterKey: 'number',
    },
    _urgency: {
        headerName: 'Pilność',
        description: 'Wskaźnik pilności uwzględniający pozostałe godziny i dni robocze.',
        formatterKey: 'number2',
    },
};

export const kpiSchema = () =>
    Object.entries(kpiSchemaMap).map(([field, config], index) => ({
        field,
        fieldGroup: 'kpi',
        headerName: config.headerName,
        type: config.type ?? 'number',
        width: config.width ?? 130,
        aggregationFn: config.aggregationFn ?? null,
        formatterKey: config.formatterKey ?? '',
        description: config.description ?? '',
        order: 200 + index,
    }));


