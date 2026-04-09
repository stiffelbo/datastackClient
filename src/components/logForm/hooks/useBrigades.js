import { useEffect, useState } from 'react';

function normalizeTimeValue(value = null) {
    return {
        date: value?.date ?? '',
        start: value?.start ?? '',
        end: value?.end ?? '',
        duration: value?.duration ?? '',
    };
}

function isSameTime(a = {}, b = {}) {
    return (
        (a?.date ?? '') === (b?.date ?? '') &&
        (a?.start ?? '') === (b?.start ?? '') &&
        (a?.end ?? '') === (b?.end ?? '') &&
        String(a?.duration ?? '') === String(b?.duration ?? '')
    );
}

function mapEmployeesWithState(employees = [], initialTime = {}) {
    const normalizedInitialTime = normalizeTimeValue(initialTime);

    return employees.map((employee) => ({
        ...employee,
        isSelected: employee?.isSelected ?? false,
        time: employee?.time ? normalizeTimeValue(employee.time) : normalizedInitialTime,
    }));
}

function getEmployeesSignature(employees = []) {
    if (!Array.isArray(employees)) return '';

    return employees
        .map((employee) => [
            employee?.id ?? '',
            employee?.brigadeId ?? '',
            employee?.active ?? '',
            employee?.fullName ?? '',
        ].join(':'))
        .join('|');
}

export default function useBrigades({ initialTime = {}, employees = [], onChange }) {
    const [brigades, setBrigades] = useState(() =>
        mapEmployeesWithState(employees, initialTime)
    );

    const employeesSignature = getEmployeesSignature(employees);

    useEffect(() => {
        //we need to effect only if empoyees as props changed only. still new object with same date may appera that will trigger effect
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
                        : normalizedInitialTime,
                };
            });
        });
    }, [employeesSignature]);

    useEffect(() => {
        const normalizedInitialTime = normalizeTimeValue(initialTime);

        setBrigades((prev) =>
            prev.map((employee) => ({
                ...employee,
                time: normalizedInitialTime,
            }))
        );
    }, [initialTime]);

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
                        ? (employee.time ? normalizeTimeValue(employee.time) : normalizedInitialTime)
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