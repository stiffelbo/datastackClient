import { useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';

const DEFAULT_FILTERS = {
    pinnedOnly: false,
    showLogs: true,
    sortDirection: 'desc',
    search: '',
};

const normalizeText = value =>
    String(value ?? '').toLowerCase().trim();

const useCommentsFilters = (
    data = [],
    entityName = 'ProductComments'
) => {
    const [filters, setFilters] = useLocalStorage(
        `${entityName}:activityFilters`,
        DEFAULT_FILTERS
    );

    const {
        pinnedOnly = false,
        showLogs = true,
        sortDirection = 'desc',
        search = '',
    } = filters ?? DEFAULT_FILTERS;

    const updateFilters = changes => {
        setFilters(prev => ({
            ...DEFAULT_FILTERS,
            ...prev,
            ...changes,
        }));
    };

    const filteredData = useMemo(() => {
        const query = normalizeText(search);

        const result = data.filter(item => {
            if (pinnedOnly && !item.is_pinned) {
                return false;
            }

            if (!showLogs && item.is_log) {
                return false;
            }

            if (!query) {
                return true;
            }

            const ownText = [
                item.content,
                item.name,
                item.authorName,
                item.file_type,
                item.status?.name,
            ].map(normalizeText).join(' ');

            if (ownText.includes(query)) {
                return true;
            }

            return (item.comments ?? []).some(comment => {
                const commentText = [
                    comment.content,
                    comment.authorName,
                ].map(normalizeText).join(' ');

                return commentText.includes(query);
            });
        });

        return [...result].sort((a, b) => {
            // 1. Pinned zawsze na górze
            const aPinned = Boolean(a.is_pinned);
            const bPinned = Boolean(b.is_pinned);

            if (aPinned !== bPinned) {
                return aPinned ? -1 : 1;
            }

            // 2. Wybór daty zależnie od sekcji
            const aDate = aPinned ? a.pinned_at : a.created_at;
            const bDate = bPinned ? b.pinned_at : b.created_at;

            const aTime = aDate ? new Date(aDate).getTime() : 0;
            const bTime = bDate ? new Date(bDate).getTime() : 0;

            // 3. Ten sam kierunek dla obu sekcji
            const direction = sortDirection === 'asc' ? 1 : -1;

            return (aTime - bTime) * direction;
        });
    }, [data, pinnedOnly, showLogs, sortDirection, search]);

    return {
        data: filteredData,

        filters,
        setFilters,
        updateFilters,
    };
};

export default useCommentsFilters;