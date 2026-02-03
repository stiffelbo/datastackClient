// src/lib/commentsThread/useCommentsHeadless.js
import { useMemo } from 'react';

function stripHtml(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function makeSnippet(html, max = 120) {
  const text = stripHtml(html);
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

const asBool = (v) => v === true || v === 1 || v === '1';
const asStr = (v) => (v == null ? '' : String(v));
const asInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Headless: bierze surowe rows z useEntity (comments)
 * i zwraca:
 *  - flatList: VM komentarzy w kolejności chronologicznej
 *  - threads: mapę rootId -> { root, replies[] }
 *  - byId: mapę id -> VM
 *
 * W tym hooku robimy VM, żeby JSX był "głupi".
 */
export function useComments(rows, { currentUser } = {}) {
  return useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) {
      return { flatList: [], threads: {}, byId: {} };
    }

    // Map id -> raw row
    const byIdRaw = {};
    list.forEach((row) => {
      if (!row || row.id == null) return;
      byIdRaw[String(row.id)] = row;
    });

    // RootId cache
    const rootCache = {};
    function computeRootId(id) {
      const key = String(id);
      if (rootCache[key]) return rootCache[key];

      let current = byIdRaw[key];
      if (!current) {
        rootCache[key] = key;
        return key;
      }

      const visited = new Set();
      while (current && current.parent_id != null) {
        const pid = String(current.parent_id);
        if (visited.has(pid)) break;
        visited.add(pid);
        const parent = byIdRaw[pid];
        if (!parent) break;
        current = parent;
      }

      const rootId = current ? String(current.id) : key;
      rootCache[key] = rootId;
      return rootId;
    }

    // 1) Najpierw: VM bez threadSize/hasReplies (bo jeszcze nie mamy threads)
    const vmsBase = list.map((row) => {
      const id = asStr(row.id);
      const parentId = row.parent_id != null ? asStr(row.parent_id) : null;
      const rootId = computeRootId(id);

      const createdAt = row.created_at || row.createdAt || null;
      const dateObj = createdAt ? new Date(createdAt) : null;

      const isFile = asBool(row.is_file);
      const isPinned = asBool(row.is_pinned);

      const isReply = parentId != null && parentId !== '' && asInt(parentId) > 0;
      const isAttachment =
        row.attachment_of != null && row.attachment_of !== '' && asInt(row.attachment_of) > 0;

      // Policy z backendu (preferujemy, bo to “business rules”)
      const isEditable = asBool(row.is_editable);
      const isDeletable = asBool(row.is_deletable);
      const isPinnable = asBool(row.is_pinnable);

      const authorId = row.created_by != null ? asStr(row.created_by) : asStr(row.author_id || '');
      const authorName = asStr(row.authorName || row.author_name || 'Użytkownik');

      // replyTo - bazujemy na raw parent, ale robimy snippet z HTML
      const parent = parentId ? byIdRaw[parentId] : null;
      const replyTo = parent
        ? {
            id: asStr(parent.id),
            authorName: asStr(parent.authorName || parent.author_name || 'Nieznany'),
            snippet: makeSnippet(parent.content_html || parent.content || '', 140),
          }
        : null;

      const avatarUrl = row.avatar_url || '';
      const userInitials = authorName
        ? authorName
            .split(' ')
            .map((s) => s[0])
            .join('')
        : '';

      return {
        id,
        parentId,
        rootId,

        // display
        authorId,
        authorName,
        avatarUrl,
        userInitials,
        contentHtml: asStr(row.content_html || row.content || ''),
        createdAt: createdAt ? asStr(createdAt) : '',
        createdAtLabel: dateObj ? dateObj.toLocaleString() : asStr(createdAt || ''),

        // flags
        isPinned,
        isFile,
        isReply,
        isAttachment,

        // backend policy
        policy: {
          isEditable,
          isDeletable,
          isPinnable,
        },

        // derived
        replyTo,

        // keep raw if needed for debug
        _raw: row,
      };
    });

    // sort chrono
    vmsBase.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return ta - tb;
    });

    // 2) Threads: rootId -> { root, replies[] }
    const threads = {};
    vmsBase.forEach((vm) => {
      const rid = vm.rootId;
      if (!threads[rid]) threads[rid] = { root: null, replies: [] };

      if (vm.id === rid) threads[rid].root = vm;
      else threads[rid].replies.push(vm);
    });

    // sort replies in each thread
    Object.values(threads).forEach((t) => {
      t.replies.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      });
    });

    // 3) Final VM: uzupełnij threadSize/hasReplies + actions (jedno miejsce logiki UI)
    const byId = {};
    const finalFlatList = vmsBase.map((vm) => {
      const thread = threads[vm.rootId];
      const threadSize = thread ? 1 + (thread.replies?.length || 0) : 1;
      const hasReplies = threadSize > 1;

      const isAuthor = currentUser ? asStr(currentUser.id) === vm.authorId : false;

      const actions = {
        canReply: !vm.isFile, // plik nie jest treścią dyskusji
        canEdit: vm.policy.isEditable, // backend decision
        canPin: vm.policy.isPinnable, // backend decision (nie reply/attachment/file)
        // Usuń: backend + UX: nie usuwamy gdy są odpowiedzi w wątku (Twoja reguła)
        // (nie mieszamy tu autorstwa, bo backend już to rozstrzygnął w is_deletable)
        canDelete: vm.policy.isDeletable && !hasReplies,
        // opcjonalnie jeśli chcesz dodatkowy bezpiecznik:
        // canDelete: vm.policy.isDeletable && !hasReplies && isAuthor,
      };

      const out = {
        ...vm,
        threadSize,
        hasReplies,
        actions,
        isAuthor, // często przydatne do UI
      };

      byId[vm.id] = out;
      return out;
    });

    return {
      flatList: finalFlatList,
      threads,
      byId,
    };
  }, [rows, currentUser]);
}
