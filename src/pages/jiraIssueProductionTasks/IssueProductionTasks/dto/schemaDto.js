const MODES = ['reorder', 'numismatic', 'category'];

const normalizePerformance = (performance) => {
    return Object.fromEntries(
        MODES.map(mode => {
            const source = performance?.[mode];

            return [
                mode,
                {
                    mode,
                    norm: source?.norm != null ? Number(source.norm) : null,
                    samplesCount: Number(source?.samplesCount ?? 0),
                    totalTime: Number(source?.totalTime ?? 0),
                    totalQty: Number(source?.totalQty ?? 0),
                    neededTime: source?.neededTime != null
                        ? Number(source.neededTime)
                        : null,
                },
            ];
        })
    );
};

const calculateMarchrutePerformance = (tasks) => {
    return Object.fromEntries(
        MODES.map(mode => {
            let totalTime = 0;
            let estimatedCount = 0;

            for (const task of tasks) {
                const neededTime = task.performance?.[mode]?.neededTime;

                if (neededTime == null || !Number.isFinite(neededTime)) {
                    continue;
                }

                totalTime += neededTime;
                estimatedCount++;
            }

            const tasksCount = tasks.length;
            const missingCount = tasksCount - estimatedCount;
            const isComplete = tasksCount > 0 && missingCount === 0;

            return [
                mode,
                {
                    mode,
                    neededTime: isComplete
                        ? Number(totalTime.toFixed(2))
                        : null,
                    partialTime: estimatedCount > 0
                        ? Number(totalTime.toFixed(2))
                        : null,
                    tasksCount,
                    estimatedCount,
                    missingCount,
                    isComplete,
                },
            ];
        })
    );
};

const resolvePerformance = (performance) => {
    for (const mode of MODES) {
        const estimate = performance?.[mode];

        if (
            estimate?.neededTime != null &&
            Number.isFinite(estimate.neededTime) &&
            estimate.norm > 0 &&
            estimate.samplesCount > 0
        ) {
            return estimate;
        }
    }

    return null;
};

const calculateResolvedPerformance = (tasks) => {
    let totalTime = 0;
    let estimatedCount = 0;

    const sources = {
        reorder: 0,
        numismatic: 0,
        category: 0,
    };

    for (const task of tasks) {
        const estimate = task.resolvedPerformance;

        if (!estimate) continue;

        totalTime += estimate.neededTime;
        estimatedCount++;

        sources[estimate.mode]++;
    }

    const tasksCount = tasks.length;
    const missingCount = tasksCount - estimatedCount;
    const isComplete = tasksCount > 0 && missingCount === 0;

    return {
        neededTime: isComplete ? Number(totalTime.toFixed(2)) : null,
        partialTime: estimatedCount > 0 ? Number(totalTime.toFixed(2)) : null,
        tasksCount,
        estimatedCount,
        missingCount,
        isComplete,
        sources,
    };
};

export const schemaDto = ({ schema }) => {
    const context = schema?.context ?? null;

    const processes = (schema?.options?.process_id ?? []).map(process => {
        const params = process.params ?? {};

        const performance = params.performance != null
            ? normalizePerformance(params.performance)
            : null;

        return {
            ...process,
            value: Number(process.value),
            params: {
                ...params,
                performance,
                resolvedPerformance: resolvePerformance(performance),
            },
        };
    });

    // Słownik procesów
    const processesMap = Object.fromEntries(
        processes.map(process => [
            process.value,
            process,
        ])
    );

    // Słownik performance
    const performancesMap = Object.fromEntries(
        processes.map(process => [
            process.value,
            process.params.performance,
        ])
    );

    // Normalizacja marszrut
    const marchrutes = (schema?.history?.marchrutes ?? []).map(marchrute => {
        const tasks = (marchrute.tasks ?? []).map(task => {
            const processId = Number(task.processId);
            const process = processesMap[processId] ?? null;
            const performance = process?.params?.performance ?? null;

            return {
                ...task,
                taskId: Number(task.taskId),
                processId,
                sequenceNo: Number(task.sequenceNo),

                processName: process?.label ?? task.processName,
                isAvailable: process !== null,

                performance,
                hasPerformance: process?.params?.hasPerformance ?? false,
                resolvedPerformance: process?.params?.resolvedPerformance ?? null,
            };
        });

        return {
            ...marchrute,
            tasks,
            performance: calculateMarchrutePerformance(tasks),
            resolvedPerformance: calculateResolvedPerformance(tasks),
            isAvailable: tasks.length > 0 && tasks.every(task => task.isAvailable),
        };
    });

    // Słownik marszrut według sygnatury
    const marchrutesMap = Object.fromEntries(
        marchrutes.map(marchrute => [
            marchrute.signature,
            marchrute,
        ])
    );

    return {
        context,

        processes,
        processesMap,
        performancesMap,

        marchrutes,
        marchrutesMap,
    };
};