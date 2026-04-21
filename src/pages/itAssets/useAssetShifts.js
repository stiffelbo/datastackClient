import { useCallback, useMemo, useState } from 'react';

const toTime = (value) => {
    if (!value) return 0;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 0;

    return date.getTime();
};

const isActiveShift = (item) => {
    return Number(item?.is_active) === 1 && !item?.date_to;
};

export default function useAssetShifts({
    assetId = null,
    asset = {},
    shiftsEntity,
    employeesEntity,
    assetEntity,
}) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const shifts = useMemo(() => {
        const rows = Array.isArray(shiftsEntity?.rows) ? [...shiftsEntity.rows] : [];
        return rows.sort((a, b) => toTime(b?.date_from) - toTime(a?.date_from));
    }, [shiftsEntity?.rows]);

    const activeShift = useMemo(() => {
        return shifts.find(isActiveShift) || null;
    }, [shifts]);

    const closedShifts = useMemo(() => {
        return shifts.filter((item) => !isActiveShift(item));
    }, [shifts]);

    const employees = useMemo(() => {
        return Array.isArray(employeesEntity?.rows) ? employeesEntity.rows : [];
    }, [employeesEntity?.rows]);

    const assetLabel = useMemo(() => {
        return [
            asset?.typeName,
            asset?.brand,
            asset?.model,
            asset?.service_tag ? `(${asset.service_tag})` : null,
        ]
            .filter(Boolean)
            .join(' ');
    }, [asset]);

    const isAssetShifted = useMemo(() => {
        if (activeShift) return true;
        return Number(asset?.is_shifted ?? 0) === 1;
    }, [activeShift, asset?.is_shifted]);

    const canCreateShift = useMemo(() => {
        return (
            Boolean(assetId) &&
            Number(asset?.is_active ?? 0) === 1 &&
            Number(asset?.is_deleted ?? 0) === 0 &&
            !activeShift
        );
    }, [assetId, asset?.is_active, asset?.is_deleted, activeShift]);

    const reload = useCallback(async () => {
        if (typeof shiftsEntity?.get === 'function') {
            await shiftsEntity.get();
        }
        if (typeof assetEntity?.getOne === 'function' && assetId) {
            await assetEntity.getOne(assetId);
        }
    }, [shiftsEntity, assetEntity, assetId]);

    const createShift = useCallback(async (payload) => {
        try {
            setSaving(true);
            setError(null);

            const finalPayload = {
                ...payload,
                id_it_asset: payload?.id_it_asset ?? assetId,
                is_active: true,
            };

            await shiftsEntity.create(finalPayload);
            await reload();

            return { ok: true };
        } catch (err) {
            setError(err);
            return { ok: false, error: err };
        } finally {
            setSaving(false);
        }
    }, [assetId, shiftsEntity, reload]);

    const closeShift = useCallback(async (payload) => {
        try {
            setSaving(true);
            setError(null);

            if (!payload?.id) {
                throw new Error('Brak id aktywnego wydania');
            }

            await shiftsEntity.update(payload.id, payload);
            await reload();

            return { ok: true };
        } catch (err) {
            setError(err);
            return { ok: false, error: err };
        } finally {
            setSaving(false);
        }
    }, [shiftsEntity, reload]);

    return {
        assetId,
        asset,
        assetLabel,

        shifts,
        activeShift,
        closedShifts,

        employees,

        isAssetShifted,
        canCreateShift,

        loading: Boolean(shiftsEntity?.loading || employeesEntity?.loading),
        saving,
        error,

        createShift,
        closeShift,
        reload,
    };
}