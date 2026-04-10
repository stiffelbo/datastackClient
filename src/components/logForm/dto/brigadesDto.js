import { defaultTime } from "../utils";

export function brigadeEmployeesDto(data) {
    if (!Array.isArray(data)) return [];

    const defaultTimeValue = defaultTime();

    return data.map((item) => {
        const details = item?.details ?? {};

        return {
            id: details.id ?? item?.employee_id ?? null,
            brigadeId: item?.brigade_id ?? null,
            structureId: details?.structure_id ?? null,
            firstName: details?.first_name ?? "",
            lastName: details?.last_name ?? "",
            fullName: `${details?.first_name ?? ""} ${details?.last_name ?? ""}`.trim(),
            email: details?.email ?? "",
            active: details?.is_active === 1 || details?.is_active === "1" || details?.is_active === true,
            //placeholders for reporting
            time: defaultTimeValue,
            isSelected: data.length === 1,
        };
    }).filter((item) => item.id);
}