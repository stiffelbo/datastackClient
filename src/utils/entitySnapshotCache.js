// utils/entitySnapshotCache.js
import { dbGet, dbPut, dbDelete, dbDeleteByPrefix } from './idb';

/**
 * Stable key from endpoint + query + optional sessionId.
 */
export function buildEntityKey({ endpoint, queryKey = '{}', sessionId = 'global' }) {
  const normEndpoint = (endpoint || '').replace(/\/+$/, '');
  return `${sessionId}::${normEndpoint}::${queryKey}`;
}

/**
 * Load snapshot: { entityKey, rows, lastFullSyncAt, lastDeltaSyncAt, meta, version } | null
 */
export async function loadSnapshot(entityKey) {
  const snap = await dbGet(entityKey);
  return snap || null;
}

/**
 * Save full snapshot (replaces rows).
 * You can pass meta.schema, meta.anything.
 */
export async function saveFullSnapshot(entityKey, rows, meta = {}) {
  const now = Date.now();
  const snap = {
    entityKey,
    rows: Array.isArray(rows) ? rows : [],
    lastFullSyncAt: now,
    lastDeltaSyncAt: now,
    meta,
    version: 1,
  };
  await dbPut(snap);
}

/**
 * Apply delta: updatedRows + deletedIds → merged rows.
 * Returns merged rows or null.
 */
export async function applyDelta(entityKey, { updatedRows = [], deletedIds = [], meta = {} }) {
  const snap = (await loadSnapshot(entityKey)) || {
    entityKey,
    rows: [],
    lastFullSyncAt: null,
    lastDeltaSyncAt: null,
    meta: {},
    version: 1,
  };

  const map = new Map((snap.rows || []).map((r) => [String(r.id), r]));

  for (const row of updatedRows) {
    if (!row || row.id == null) continue;
    map.set(String(row.id), row);
  }

  for (const id of deletedIds) {
    map.delete(String(id));
  }

  const mergedRows = Array.from(map.values());
  const now = Date.now();

  const newSnap = {
    ...snap,
    rows: mergedRows,
    lastDeltaSyncAt: now,
    meta: { ...(snap.meta || {}), ...meta },
  };

  await dbPut(newSnap);
  return mergedRows;
}

/**
 * Clear single snapshot – for hard reload of one entity.
 */
export async function clearSnapshot(entityKey) {
  await dbDelete(entityKey);
}

/**
 * Clear all snapshots for an endpoint, for all queries.
 */
export async function clearSnapshotsByEndpoint({ endpoint, sessionId = 'global' }) {
  const normEndpoint = (endpoint || '').replace(/\/+$/, '');
  const prefix = `${sessionId}::${normEndpoint}::`;
  await dbDeleteByPrefix(prefix);
}
