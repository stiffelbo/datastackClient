export const buildEmployeeMap = (employees = []) => {
    const map = {};

    employees.forEach(emp => {
        const fullName = `${emp.last_name} ${emp.first_name}`.toLowerCase().trim();
        const altName = `${emp.first_name} ${emp.last_name}`.toLowerCase().trim();

        map[fullName] = emp.id;
        map[altName] = emp.id;
    });

    return map;
};

export const matchEmployee = (employeeName = '', employeeMap = {}) => {
    const nameKey = employeeName.toLowerCase().trim();
    return employeeMap[nameKey] || 0;
};

export const getEmployeeOptions = (employees = []) => {
    return [...employees]
        .sort((a, b) => a.last_name.localeCompare(b.last_name))
        .map((emp) => ({
            label: `${emp.last_name} ${emp.first_name}`,
            value: emp.id,
        }))
        .concat({
            label: "Nieznany",
            value: 0,
        });
};

export const processData = (data = [], employees = []) => {
    if (!data) return [];

    const employeeMap = buildEmployeeMap(employees);

    return data.map((row, index) => {
        const employee_name = row['Pracownik Nazwa'] || '';
        const employee_id = matchEmployee(employee_name, employeeMap);

        return {
            id: index + 1,
            company_name: row['Spółka'] || '',
            branch: row['Pion'] || '',
            dept_name: row['Wydział'] || '',
            ocupation: row['Stanowisko'] || '',
            employee_name,
            employee_id,

            salarie_brutto: parseFloat(row['Wynagrodzenie brutto']) || 0,
            zus: parseFloat(row['Składka ZUS']) || 0,
            cost_total: parseFloat(row['Łączny koszt pracodawcy']) || 0,
            worked_hours: parseFloat(row['Przepracowany czas (h)']) || 0,
            cost_per_hour: parseFloat(row['Łączny koszt za godzinę']) || 0,
            bonus_total: parseFloat(row['łączny koszt premii']) || 0,
            overtime_hours: parseFloat(row['Ilość wypłaconych nadgodzin (h)']) || 0,
            overtime_cost: parseFloat(row['Łączny koszt wypłaconych nadgodzin']) || 0,
            days_off: parseFloat(row['Ilość dni zwolnień chorobowych/zasiłków/bezpłatnych']) || 0,
            vacation_days: parseFloat(row['ilość dni urlopowych']) || 0,
            bonus_anniversary: parseFloat(row['łączny koszt nagrody jubileuszowej']) || 0,
            sick_pay_cost: parseFloat(row['w tym łączny koszt wynagrodzenia chorobowego']) || 0,
        };
    });
};

export const getPeriodLabel = (period) => {
    if (!period?.code) return `${period.date_from} – ${period.date_to}`;
    const [year, month] = period.code.split('-'); // np. "2025-11"
    const months = {
        '01': 'Styczeń',
        '02': 'Luty',
        '03': 'Marzec',
        '04': 'Kwiecień',
        '05': 'Maj',
        '06': 'Czerwiec',
        '07': 'Lipiec',
        '08': 'Sierpień',
        '09': 'Wrzesień',
        '10': 'Październik',
        '11': 'Listopad',
        '12': 'Grudzień'
    };
    return `${months[month]} ${year}`;
};