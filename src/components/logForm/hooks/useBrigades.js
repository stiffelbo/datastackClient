import { useEffect, useRef, useState } from 'react';
import { normalizeTimeValue, isSameTime } from '../utils';

function mapEmployeesWithState(employees = [], initialTime = {}) {
    const normalizedInitialTime = normalizeTimeValue(initialTime);

    return employees.map((employee) => ({
        ...employee,
        isSelected: employee?.isSelected ?? false,
        time: employee?.time
            ? normalizeTimeValue(employee.time)
            : normalizedInitialTime,
    }));
}

function getEmployeesSignature(employees = []) {
    if (!Array.isArray(employees)) return '';

    return employees
        .map((employee) =>
            [
                employee?.id ?? '',
                employee?.brigadeId ?? '',
                employee?.active ?? '',
                employee?.fullName ?? '',
            ].join(':')
        )
        .join('|');
}

export default function useBrigades({
    initialTime = {},
    employees = [],
    onChange,
}) {
    const [brigades, setBrigades] = useState(() =>
        mapEmployeesWithState(employees, initialTime)
    );

    const employeesSignature = getEmployeesSignature(employees);
    const previousInitialTimeRef = useRef(normalizeTimeValue(initialTime));
    const isFirstInitialTimeEffectRef = useRef(true);

    useEffect(() => {
        setBrigades((prev) => {
            const prevMap = new Map(prev.map((item) => [item.id, item]));
            const normalizedInitialTime = normalizeTimeValue(initialTime);

            return employees.map((employee) => {
                const existing = prevMap.get(employee.id);

                if (!existing) {
                    return {
                        ...employee,
                        isSelected: employee?.isSelected ?? false,
                        time: employee?.time
                            ? normalizeTimeValue(employee.time)
                            : normalizedInitialTime,
                    };
                }

                return {
                    ...employee,
                    isSelected: existing.isSelected ?? false,
                    time: existing.time
                        ? normalizeTimeValue(existing.time)
                        : employee?.time
                            ? normalizeTimeValue(employee.time)
                            : normalizedInitialTime,
                };
            });
        });
    }, [employeesSignature]);

    useEffect(() => {
        const normalizedInitialTime = normalizeTimeValue(initialTime);
        const previousInitialTime = previousInitialTimeRef.current;

        // przy pierwszym renderze nic nie nadpisujemy,
        // bo chcemy zachować time z DTO
        if (isFirstInitialTimeEffectRef.current) {
            isFirstInitialTimeEffectRef.current = false;
            previousInitialTimeRef.current = normalizedInitialTime;
            return;
        }

        // jeśli initialTime logicznie się nie zmienił, nic nie rób
        if (isSameTime(previousInitialTime, normalizedInitialTime)) {
            return;
        }

        previousInitialTimeRef.current = normalizedInitialTime;

        // realna zmiana master time -> nadpisujemy wszystkim
        setBrigades((prev) =>
            prev.map((employee) => ({
                ...employee,
                time: normalizedInitialTime,
            }))
        );
    }, [
        initialTime?.date,
        initialTime?.start,
        initialTime?.end,
        initialTime?.duration,
    ]);

    useEffect(() => {
        if (typeof onChange === 'function') {
            onChange(brigades);
        }
    }, [brigades, onChange]);

    function toggleSelected(employeeId) {
        const normalizedInitialTime = normalizeTimeValue(initialTime);

        setBrigades((prev) =>
            prev.map((employee) => {
                if (employee.id !== employeeId) return employee;

                const nextSelected = !employee.isSelected;

                return {
                    ...employee,
                    isSelected: nextSelected,
                    time: nextSelected
                        ? (employee.time
                            ? normalizeTimeValue(employee.time)
                            : normalizedInitialTime)
                        : employee.time,
                };
            })
        );
    }

    function setEmployeeTime(employeeId, nextTime) {
        const normalizedNextTime = normalizeTimeValue(nextTime);

        setBrigades((prev) =>
            prev.map((employee) =>
                employee.id === employeeId
                    ? {
                          ...employee,
                          time: normalizedNextTime,
                      }
                    : employee
            )
        );
    }

    function selectAll() {
        const normalizedInitialTime = normalizeTimeValue(initialTime);

        setBrigades((prev) =>
            prev.map((employee) => ({
                ...employee,
                isSelected: true,
                time: employee.time
                    ? normalizeTimeValue(employee.time)
                    : normalizedInitialTime,
            }))
        );
    }

    function clearAll() {
        setBrigades((prev) =>
            prev.map((employee) => ({
                ...employee,
                isSelected: false,
            }))
        );
    }

    function replaceAll(nextEmployees = []) {
        setBrigades(mapEmployeesWithState(nextEmployees, initialTime));
    }

    const selectedEmployees = brigades.filter((employee) => employee.isSelected);
    const selectedIds = selectedEmployees.map((employee) => employee.id);
    const selectedCount = selectedEmployees.length;

    const employeeTimeMap = selectedEmployees.reduce((acc, employee) => {
        acc[employee.id] = normalizeTimeValue(employee.time);
        return acc;
    }, {});

    function getEmployeeById(employeeId) {
        return brigades.find((employee) => employee.id === employeeId) ?? null;
    }

    return {
        state: {
            brigades,
        },

        actions: {
            toggleSelected,
            setEmployeeTime,
            selectAll,
            clearAll,
            replaceAll,
        },

        getters: {
            getEmployeeById,
        },

        computed: {
            selectedEmployees,
            selectedIds,
            selectedCount,
            employeeTimeMap,
            hasSelected: selectedCount > 0,
        },
    };
}