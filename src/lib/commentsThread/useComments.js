// src/lib/commentsThread/useCommentsHeadless.js
import { useMemo } from 'react';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function makeSnippet(html, max = 120) {
  const text = stripHtml(html);
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

/**
 * Headless: bierze surowe rows z useEntity (tabela comments)
 * i zwraca:
 *  - flatList: komentarze w kolejności chronologicznej,
 *  - threads: mapę rootId -> { root, replies[] }.
 *
 * rows – oczekujemy struktury z bazy: id, parent_id, content_html, created_at, created_by, is_pinned itd.
 */
export function useComments(rows) {
  return useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) {
      return {
        flatList: [],
        threads: {},
        byId: {},
      };
    }

    // Map id -> row
    const byId = {};
    list.forEach((row) => {
      if (!row || row.id == null) return;
      byId[String(row.id)] = row;
    });

    // Wyliczenie rootId (id „korzenia” wątku)
    const rootCache = {};

    function computeRootId(id) {
      const key = String(id);
      if (rootCache[key]) return rootCache[key];

      let current = byId[key];
      if (!current) {
        rootCache[key] = key;
        return key;
      }

      const visited = new Set();
      while (current && current.parent_id != null) {
        const pid = String(current.parent_id);
        if (visited.has(pid)) break; // pętla bezpieczeństwa
        visited.add(pid);
        const parent = byId[pid];
        if (!parent) break;
        current = parent;
      }

      const rootId = current ? String(current.id) : key;
      rootCache[key] = rootId;
      return rootId;
    }

    // Enriched flat list
    const enriched = list.map((row) => {
      const id = String(row.id);
      const parentId =
        row.parent_id !== null && row.parent_id !== undefined
          ? String(row.parent_id)
          : null;
      const rootId = computeRootId(id);
      const createdAt = row.created_at || row.createdAt || null;
      const dateObj = createdAt ? new Date(createdAt) : null;

      const parent = parentId ? byId[parentId] : null;

      return {
        id,
        parentId,
        rootId,
        authorId:
          row.created_by != null ? String(row.created_by) : String(row.author_id || ''),
        authorName: row.authorName || 'Użytkownik',

        contentHtml: row.content_html || row.content || '',
        isPinned: !!row.is_pinned,
        isPrivate: !!row.is_private,
        isAdminOnly: !!row.is_admin_only,
        isFile: !!row.is_file,

        createdAt,
        createdAtLabel: dateObj
          ? dateObj.toLocaleString()
          : (createdAt || ''),

        replyTo: parent
          ? {
              id: String(parent.id),
              authorName: parent.authorName || 'Nieznany',
              snippet: parent.content_html,
            }
          : null,
      };
    });

    // sort chrono
    enriched.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return ta - tb;
    });

    // threads map: rootId -> { root, replies[] }
    const threads = {};
    enriched.forEach((c) => {
      const rid = c.rootId;
      if (!threads[rid]) {
        threads[rid] = { root: null, replies: [] };
      }
      if (c.id === rid) {
        threads[rid].root = c;
      } else {
        threads[rid].replies.push(c);
      }
    });

    // posortuj replies w wątkach
    Object.values(threads).forEach((t) => {
      t.replies.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      });
    });

    return {
      flatList: enriched,
      threads,
      byId,
    };
  }, [rows]);
}
