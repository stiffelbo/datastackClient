import { operationLogDto } from "./operationLogDto";
import { machineLogDto } from "./machineLogDto";
import { materialLogDto } from "./materialLogDto";
import { outputLogDto } from "./outputLogDto";

import { normalizeTimeValue } from "../utils";
import { safeArray, round2, round4, getTaskQuantity, getTaskQuantityGood, getTaskQuantityScrap, getTaskRemarks, getTaskIsRework, getTimeDuration, getTaskAllocations, roundToStepDown, allocateAmountByRatioWithStep, allocateAmountAcrossPeopleWithStep, allocateIntegerAcrossPeople, splitDurationByRatio, splitAmountByRatio, buildPreview, buildValidation, getOutputWorkDate, splitTimeSequentially, splitAmountPreservingTotal } from "./logDraftVoUtils";
import { splitProductionTimeSequentially, getProductionTaskAllocations, getGoodScrapRatios } from './productionAlocations';

function uniqueErrors(errors = []) {
    return [...new Set(errors.filter(Boolean))];
}

export function logDraftVo({
    tasksState = [],
    brigadesState = [],
    processesState = {},
    nonTaskRemarks = 'test'
}) {
    const selectedTasks = safeArray(tasksState);
    const selectedEmployees = safeArray(brigadesState).filter((item) => item.isSelected);

    const selectedProcess = processesState?.selectedProcess ?? null;

    const selectedMachine = processesState?.selectedMachine ?? null;
    const machineTime = normalizeTimeValue(processesState?.machineTime ?? null);
    const materialsReport = processesState?.materialsReport ?? {};
    const materials = safeArray(processesState?.materials);
    const isRework = Boolean(processesState?.isRework);

    const isProduction = Boolean(selectedProcess?.is_production);
    const requiresTasks = !Boolean(selectedProcess?.is_general);
    const requiresQuantity = Boolean(selectedProcess?.requires_quantity);
    const requiresRemarks = Boolean(selectedProcess?.requires_remarks);
    const requiresMaterial = Boolean(selectedProcess?.requires_material);

    const allocations = isProduction
        ? getProductionTaskAllocations(selectedTasks)
        : getTaskAllocations(selectedTasks, { requiresQuantity });

    const validation = buildValidation({
        selectedTasks,
        selectedEmployees,
        selectedProcess,
        selectedMachine,
        materials,
        materialsReport,
        requiresTasks,
        requiresQuantity,
        requiresRemarks,
        allocations
    });

    const operationLogs = [];
    const machineLogs = [];
    const materialLogs = [];
    const outputLogs = [];

    const outputWorkDate = getOutputWorkDate(selectedEmployees, machineTime);

    const hasSelectedEmployees = selectedEmployees.length > 0;

    // TRYB TASKOWY
    if (selectedTasks.length) {
        // 1. OPERATIONS

        selectedEmployees.forEach((employee) => {
            const employeeTime = normalizeTimeValue(employee.time);

            const employeeTaskTimes = isProduction
                ? splitProductionTimeSequentially(employeeTime, allocations)
                : splitTimeSequentially(employeeTime, allocations);

            employeeTaskTimes.forEach(({ allocation, time: taskTime }) => {
                const employeeQtyAllocations = allocateIntegerAcrossPeople(
                    allocation.quantity,
                    [employee]
                );

                const employeeAllocation = employeeQtyAllocations[0];
                operationLogs.push(
                    operationLogDto({
                        task: allocation.task,
                        employee,
                        process: selectedProcess,
                        time: taskTime,
                        structureId: processesState.structureId,
                        productionTaskId: null,
                        remarks: getTaskRemarks(allocation.task),
                        isRepair: isRework || getTaskIsRework(allocation.task),
                        qty: requiresQuantity
                            ? employeeAllocation?.allocatedInt ?? 0
                            : 1,
                    })
                );
            });
        });

        // 2. MACHINES
        if (selectedMachine) {
            const machineTaskTimes = isProduction
                ? splitProductionTimeSequentially(machineTime, allocations)
                : splitTimeSequentially(machineTime, allocations);

            machineTaskTimes.forEach(({ allocation, time: taskMachineTime }) => {

                machineLogs.push(
                    machineLogDto({
                        task: allocation.task,
                        employee: selectedEmployees[0] ?? null,
                        process: selectedProcess,
                        machine: selectedMachine,
                        time: taskMachineTime,
                        structureId: processesState.structureId,
                        productionTaskId: null,
                        isSetup: Boolean(selectedProcess?.is_setup),
                        isRepair: isRework || getTaskIsRework(allocation.task),
                        remarks: getTaskRemarks(allocation.task),
                        usageQty: 0,
                    })
                );
            });
        }

        // 3. MATERIALS
        materials.forEach((material) => {
            const row = materialsReport?.[material.id];

            if (!row) return;

            const materialStep = Number(
                material.step || row.step || 0.01
            );

            /*
             * divide NIE decyduje o podziale materiału na taski.
             *
             * Materiał ZAWSZE dzielimy pomiędzy taski.
             *
             * divide decyduje WYŁĄCZNIE o tym, czy ilość
             * przypisaną do konkretnego taska dzielimy dalej
             * na produkcja / brak.
             */
            const divideGoodScrap = Boolean(material.divide);

            /*
             * Materiałów nie dzielimy na pracowników.
             * Do logu podstawiamy pierwszego.
             */
            const materialEmployee =
                selectedEmployees[0] ?? null;

            const materialWorkDate =
                materialEmployee?.time?.date ??
                machineTime?.date ??
                null;

            /*
             * Mały lokalny helper, żeby nie duplikować
             * materialLogDto w każdym branchu.
             */
            const pushMaterialLog = ({
                task,
                movementType,
                qty,
            }) => {
                if (!qty) return;

                materialLogs.push(
                    materialLogDto({
                        task,
                        employee: materialEmployee,
                        process: selectedProcess,
                        material,

                        workDate: materialWorkDate,

                        structureId:
                            processesState.structureId,

                        productionTaskId: null,

                        isRepair:
                            isRework ||
                            getTaskIsRework(task),

                        isPlan: false,
                        isActive: true,

                        movementType,
                        qty,

                        remarks: getTaskRemarks(task),
                    })
                );
            };


            /*
             * ==========================================
             * PRODUKCJA
             * ==========================================
             */
            if (isProduction) {
                const productionQty =
                    Number(row.qty || 0);

                if (productionQty > 0) {
                    /*
                     * ETAP 1
                     *
                     * Cały raportowany materiał dzielimy
                     * pomiędzy taski według dividerFactor/ratio.
                     *
                     * divide NIE MA tutaj znaczenia.
                     *
                     * INVARIANT:
                     *
                     * SUM(allocatedAmount) === productionQty
                     */
                    const taskMaterialAllocations =
                        allocateAmountByRatioWithStep(
                            productionQty,
                            allocations,
                            materialStep
                        );

                    taskMaterialAllocations.forEach(
                        (taskAllocation) => {
                            const task = taskAllocation.task;
                            const taskMaterialQty =
                                taskAllocation.allocatedAmount;

                            if (!taskMaterialQty) {
                                return;
                            }

                            /*
                             * ==================================
                             * divide = FALSE
                             * ==================================
                             *
                             * Np. kartony.
                             *
                             * Nie interesuje nas good/scrap.
                             * Cały materiał przypisany do
                             * zamówienia idzie na produkcję.
                             */
                            if (!divideGoodScrap) {
                                pushMaterialLog({
                                    task,
                                    movementType: "produkcja",
                                    qty: taskMaterialQty,
                                });

                                return;
                            }


                            /*
                             * ==================================
                             * divide = TRUE
                             * ==================================
                             *
                             * Dopiero tutaj patrzymy na
                             * good/scrap danego zamówienia.
                             */
                            const {
                                goodRatio,
                                scrapRatio,
                            } = getGoodScrapRatios(task);

                            /*
                             * ETAP 2
                             *
                             * Ilość materiału JUŻ przypisaną
                             * do taska dzielimy good/scrap.
                             *
                             * Ten podział również respektuje
                             * materialStep i nie może zgubić
                             * ani jednej jednostki.
                             *
                             * INVARIANT:
                             *
                             * goodQty + scrapQty
                             * === taskMaterialQty
                             */
                            const [
                                goodQty,
                                scrapQty,
                            ] = splitAmountPreservingTotal(
                                taskMaterialQty,
                                [
                                    goodRatio,
                                    scrapRatio,
                                ],
                                materialStep
                            );

                            pushMaterialLog({
                                task,
                                movementType: "produkcja",
                                qty: goodQty,
                            });

                            pushMaterialLog({
                                task,
                                movementType: "brak",
                                qty: scrapQty,
                            });
                        }
                    );
                }


                /*
                 * ==========================================
                 * ODPAD MATERIAŁOWY
                 * ==========================================
                 *
                 * wasteQty jest niezależne od good/scrap.
                 *
                 * Zawsze tylko:
                 *
                 * wasteQty
                 *     ↓
                 * taski według allocations
                 *     ↓
                 * "odpad"
                 */
                const wasteQty =
                    Number(row.wasteQty || 0);

                if (wasteQty > 0) {
                    const wasteAllocations =
                        allocateAmountByRatioWithStep(
                            wasteQty,
                            allocations,
                            materialStep
                        );

                    wasteAllocations.forEach(
                        (taskAllocation) => {
                            pushMaterialLog({
                                task: taskAllocation.task,
                                movementType: "odpad",
                                qty:
                                    taskAllocation.allocatedAmount,
                            });
                        }
                    );
                }

                return;
            }


            /*
             * ==========================================
             * PROCES NIEPRODUKCYJNY
             * ==========================================
             *
             * Tutaj nie mamy good/scrap.
             *
             * Nadal:
             *
             * - dzielimy materiał pomiędzy taski,
             * - respektujemy step,
             * - nie dzielimy na pracowników.
             */
            const movements = [
                {
                    movementType: "produkcja",
                    qty: Number(row.qty || 0),
                },
                {
                    movementType: "odpad",
                    qty: Number(row.wasteQty || 0),
                },
            ];

            movements.forEach((movement) => {
                if (movement.qty <= 0) {
                    return;
                }

                const taskMaterialAllocations =
                    allocateAmountByRatioWithStep(
                        movement.qty,
                        allocations,
                        materialStep
                    );

                taskMaterialAllocations.forEach(
                    (taskAllocation) => {
                        pushMaterialLog({
                            task: taskAllocation.task,
                            movementType:
                                movement.movementType,
                            qty:
                                taskAllocation.allocatedAmount,
                        });
                    }
                );
            });
        });
        // 4. OUTPUTS
        selectedTasks.forEach((task) => {
            const quantityGood = Number(task?.report?.quantityGood || 0);
            const quantityScrap = Number(task?.report?.quantityScrap || 0);

            if (!quantityGood && !quantityScrap) return;

            const outputMovements = [
                {
                    movementType: "dobre",
                    qty: quantityGood,
                },
                {
                    movementType: "brak",
                    qty: quantityScrap,
                },
            ];

            outputMovements.forEach((movement) => {
                if (!movement.qty) return;

                const employeeAllocations = allocateAmountAcrossPeopleWithStep(
                    movement.qty,
                    selectedEmployees,
                    1
                );

                employeeAllocations.forEach((employeeAllocation) => {
                    if (!employeeAllocation.allocatedAmount) return;

                    outputLogs.push(
                        outputLogDto({
                            task,
                            employee: employeeAllocation.employee,
                            process: selectedProcess,

                            workDate:
                                employeeAllocation.employee?.time?.date ??
                                machineTime?.date ??
                                null,

                            structureId: processesState.structureId,
                            productionTaskId: null,

                            movementType: movement.movementType,
                            qty: employeeAllocation.allocatedAmount,

                            remarks: getTaskRemarks(task),
                            attrs: null,
                        })
                    );
                });
            });
        });
    }

    // TRYB OGÓLNY
    if (!selectedTasks.length) {
        selectedEmployees.forEach((employee) => {
            const employeeTime = normalizeTimeValue(employee.time);

            operationLogs.push(
                operationLogDto({
                    task: null,
                    employee,
                    process: selectedProcess,
                    time: employeeTime,
                    structureId: processesState.structureId,
                    productionTaskId: null,
                    remarks: nonTaskRemarks,
                    isRepair: isRework,
                    qty: 1,
                })
            );
        });
    }

    if (hasSelectedEmployees) {
        const preview = buildPreview({
            selectedProcess,
            selectedMachine,
            selectedEmployees,
            selectedTasks,
            materials,
            allocations,
            operationLogs,
            machineLogs,
            materialLogs,
            outputLogs,
            requiresTasks,
            requiresQuantity,
            requiresRemarks,
            isRework,
        });

        return {
            meta: {
                valid: false,
                errors:
                    validation.errors,
                requiresTasks,
                requiresQuantity,
                requiresRemarks,
                isRework,
            },

            preview,

            logs: {
                operationLogs,
                machineLogs,
                materialLogs,
                outputLogs,
            },
        };
    }
}