import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULTS = {
  viewMode: 'comments', // 'comments' | 'files'
  filters: {
    query: '',
    pinnedOnly: false,
    includePrivate: true,
    includeAdminOnly: true,
    includeReplies: true,      // UI-level (czasem chcesz tylko root)
    includeAttachments: true,  // dla files view (inline)
  },
  sort: 'oldest', // 'oldest' | 'newest'
};

function normalizeString(s) {
  return (s ?? '').toString().trim().toLowerCase();
}

function matchQuery(vm, q) {
  if (!q) return true;
  const hay =
    `${vm.authorName || ''} ${vm.contentHtml || ''} ${vm.createdAtLabel || ''}`.toLowerCase();
  return hay.includes(q);
}

function sortByCreatedAt(list, dir) {
  const arr = Array.isArray(list) ? [...list] : [];
  arr.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dir === 'newest' ? tb - ta : ta - tb;
  });
  return arr;
}

export function useCommentsLayout({
  flatList,
  threads,
  currentUser,
  storageKeyPrefix = 'commentsLayout',
  defaults,
} = {}) {
  const userKey = currentUser?.id ? String(currentUser.id) : 'anon';
  const storageKey = `${storageKeyPrefix}:${userKey}`;

  const initial = useMemo(() => {
    const merged = {
      ...DEFAULTS,
      ...(defaults || {}),
      filters: { ...DEFAULTS.filters, ...(defaults?.filters || {}) },
    };

    // localStorage override (best-effort)
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return merged;
      const parsed = JSON.parse(raw);
      return {
        ...merged,
        ...parsed,
        filters: { ...merged.filters, ...(parsed?.filters || {}) },
      };
    } catch {
      return merged;
    }
  }, [defaults, storageKey]);

  const [viewMode, setViewMode] = useState(initial.viewMode);
  const [filters, setFilters] = useState(initial.filters);
  const [sort, setSort] = useState(initial.sort);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ viewMode, filters, sort }));
    } catch {
      // ignore
    }
  }, [storageKey, viewMode, filters, sort]);

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...(patch || {}) }));
  }, []);

  const resetLayout = useCallback(() => {
    setViewMode(DEFAULTS.viewMode);
    setFilters(DEFAULTS.filters);
    setSort(DEFAULTS.sort);
  }, []);

  // --- selectors: COMMENTS VIEW ---
  const commentsFlat = useMemo(() => {
    const list = Array.isArray(flatList) ? flatList : [];
    const q = normalizeString(filters.query);

    let out = list.filter((vm) => {
      // nie pokazuj plików w comments view
      if (vm.isFile) return false;

      if (filters.pinnedOnly && !vm.isPinned) return false;

      // prywatne / admin-only
      if (!filters.includePrivate && vm.isPrivate) return false;
      if (!filters.includeAdminOnly && vm.isAdminOnly) return false;

      // replies
      if (!filters.includeReplies && vm.parentId) return false;

      // query
      if (!matchQuery(vm, q)) return false;

      return true;
    });

    out = sortByCreatedAt(out, sort);
    return out;
  }, [flatList, filters, sort]);

  // threads: filtrujemy wątki na podstawie commentsFlat
  const commentsThreads = useMemo(() => {
    const t = threads || {};
    const allowedIds = new Set(commentsFlat.map((c) => c.id));

    const out = {};
    Object.entries(t).forEach(([rootId, thread]) => {
      const root = thread?.root;
      if (!root) return;

      // root musi przejść filtry, inaczej cały wątek out
      if (!allowedIds.has(root.id)) return;

      const replies = Array.isArray(thread.replies)
        ? thread.replies.filter((r) => allowedIds.has(r.id))
        : [];

      out[rootId] = { root, replies };
    });

    return out;
  }, [threads, commentsFlat]);

  // --- selectors: FILES VIEW ---
  const filesList = useMemo(() => {
    const list = Array.isArray(flatList) ? flatList : [];
    const q = normalizeString(filters.query);

    let out = list.filter((vm) => {
      if (!vm.isFile) return false;

      // inline attachments toggle
      if (!filters.includeAttachments && vm.isAttachment) return false;

      // query: szukaj po autorze i “content” (często w file record trzymasz name/url)
      if (!matchQuery(vm, q)) return false;

      return true;
    });

    out = sortByCreatedAt(out, sort);
    return out;
  }, [flatList, filters, sort]);

  const counts = useMemo(() => {
    const totalComments = Array.isArray(flatList) ? flatList.filter((v) => !v.isFile).length : 0;
    const totalFiles = Array.isArray(flatList) ? flatList.filter((v) => v.isFile).length : 0;

    return {
      totalComments,
      totalFiles,
      visibleComments: commentsFlat.length,
      visibleFiles: filesList.length,
    };
  }, [flatList, commentsFlat.length, filesList.length]);

  return {
    // state
    viewMode,
    filters,
    sort,

    // actions
    setViewMode,
    setSort,
    setFilters,
    updateFilters,
    resetLayout,

    // selectors
    commentsFlat,
    commentsThreads,
    filesList,
    counts,
  };
}
