export function brigadeEmployeesDto(data) {
    if (!Array.isArray(data)) return [];

    return data.map((item) => {
        const details = item?.details ?? {};

        return {
            id: details.id ?? item?.employee_id ?? null,
            relationId: item?.id ?? null,
            brigadeId: item?.brigade_id ?? null,
            structureId: details?.structure_id ?? null,
            firstName: details?.first_name ?? "",
            lastName: details?.last_name ?? "",
            fullName: `${details?.first_name ?? ""} ${details?.last_name ?? ""}`.trim(),
            email: details?.email ?? "",
            phone: details?.phone ?? "",
            active: details?.is_active === 1 || details?.is_active === "1" || details?.is_active === true,
            fte: details?.fte ?? null,
            optimaGid: details?.optima_gid ?? null,
            workStatus: details?.work_status ?? null,
            sequenceNo: details?.sequence_no ?? null,
        };
    }).filter((item) => item.id);
}