// src/lib/commentsThread/useCommentsAdapter.ts
import { useMemo, useCallback } from 'react';
import type {
  Comment,
  CommentId,
  CommentsAdapter,
  EntityRef,
  NewCommentInput,
  UpdateCommentInput,
  CommentFile,
  Mention,
} from './types';

import useEntity from '../../hooks/useEntity';
import type { UseEntityFn, UseEntityResult } from '../../hooks/useEntityTypes';

// „Nadajemy typ” JS-owemu hookowi.
const typedUseEntity = useEntity as UseEntityFn<any>;

/**
 * Mapowanie pojedynczego rekordu (jak przychodzi z backendu/useEntity)
 * na typ Comment używany w libce.
 */
function mapRowToComment(row: any, entity: EntityRef): Comment {
  const mapMentions = (list: any[]): Mention[] =>
    Array.isArray(list)
      ? list.map((m) => ({
          id: String(m.id),
          displayName: m.displayName ?? m.name ?? m.label ?? '',
        }))
      : [];

  const mapFiles = (list: any[]): CommentFile[] =>
    Array.isArray(list)
      ? list.map((f) => ({
          id: String(f.id),
          fileName: f.file_name ?? f.name ?? '',
          mimeType: f.mime_type ?? 'application/octet-stream',
          size: Number(f.size ?? 0),
          url: f.url ?? f.path ?? '',
          statusId: f.status_id != null ? String(f.status_id) : null,
          typeId: f.type_id != null ? String(f.type_id) : null,
        }))
      : [];

  return {
    id: String(row.id),
    entity,

    parentId:
      row.parent_id !== undefined && row.parent_id !== null
        ? String(row.parent_id)
        : null,
    children: [], // drzewo możesz budować później w UI

    authorId: row.author_id != null ? String(row.author_id) : '',
    authorName: row.author_name ?? '',

    label: row.label ?? row.name ?? undefined,
    contentHtml: row.content_html ?? row.content ?? '',

    mentions: mapMentions(row.mentions ?? []),

    isPinned: !!row.is_pinned,
    pinnedAt: row.pinned_at ?? null,

    isFile: !!row.is_file,
    files: mapFiles(row.files ?? []),

    typeId: row.type_id != null ? String(row.type_id) : null,
    typeName: row.type_name ?? undefined,
    statusId: row.status_id != null ? String(row.status_id) : null,
    statusName: row.status_name ?? undefined,

    isPrivate: !!row.is_private,
    isAdminOnly: !!row.is_admin_only,

    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? null,
  };
}

/**
 * Mapowanie danych do tworzenia komentarza na payload oczekiwany przez backend.
 */
function mapNewInputToPayload(input: NewCommentInput): any {
  return {
    ref_type: input.entity.refType,
    ref_id: input.entity.refId,
    parent_id: input.parentId ?? null,

    label: input.label ?? null,
    content_html: input.contentHtml,

    is_private: input.isPrivate ?? false,
    is_admin_only: input.isAdminOnly ?? false,

    type_id: input.typeId ?? null,
    status_id: input.statusId ?? null,

    is_file: input.isFile ?? false,
    mentions: input.mentions ?? [],
    file_ids: input.fileIds ?? [],
  };
}

/**
 * Mapowanie patcha do aktualizacji komentarza na payload dla backendu.
 */
function mapUpdateInputToPayload(patch: UpdateCommentInput): any {
  const payload: any = {};

  if (patch.label !== undefined) payload.label = patch.label;
  if (patch.contentHtml !== undefined) payload.content_html = patch.contentHtml;
  if (patch.isPrivate !== undefined) payload.is_private = patch.isPrivate;
  if (patch.isAdminOnly !== undefined) payload.is_admin_only = patch.isAdminOnly;
  if (patch.typeId !== undefined) payload.type_id = patch.typeId;
  if (patch.statusId !== undefined) payload.status_id = patch.statusId;
  if (patch.isFile !== undefined) payload.is_file = patch.isFile;
  if (patch.mentions !== undefined) payload.mentions = patch.mentions;
  if (patch.fileIds !== undefined) payload.file_ids = patch.fileIds;

  return payload;
}

/**
 * Hook–adapter: opakowuje Twój useEntity({ endpoint: 'clients_comments', ... })
 * w kontrakt CommentsAdapter używany przez libkę komentarzy.
 */
export function useCommentsAdapter(
  entity: EntityRef,
  options?: {
    endpoint?: string; // możliwość podmiany endpointu, domyślnie "clients_comments"
  },
): CommentsAdapter {
  const endpoint = options?.endpoint ?? 'clients_comments';

  const {
    rows,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    updateField,
    getOne,
  }: UseEntityResult<any> = typedUseEntity({
    endpoint,
    query: {
      ref_type: entity.refType,
      ref_id: entity.refId,
    },
  });

  // Mapowanie surowych rekordów na Comment
  const comments: Comment[] = useMemo(
    () =>
      Array.isArray(rows)
        ? rows.map((row: any) => mapRowToComment(row, entity))
        : [],
    [rows, entity],
  );

  const createComment = useCallback(
    async (input: NewCommentInput): Promise<Comment> => {
      if (!create) {
        throw new Error(`Create endpoint is disabled for ${endpoint}`);
      }

      const payload = mapNewInputToPayload(input);
      const createdIdOrResp = await create(payload);

      // Twój create zwraca prawdopodobnie id, ale zabezpieczmy się:
      const id: CommentId =
        createdIdOrResp &&
        typeof createdIdOrResp === 'object' &&
        'id' in createdIdOrResp
          ? String((createdIdOrResp as any).id)
          : String(createdIdOrResp);

      if (!id) {
        throw new Error('Backend did not return id for created comment');
      }

      // Jeśli mamy getOne, dociągamy świeży rekord z backendu.
      if (getOne) {
        const raw = await getOne(id);
        if (raw) {
          return mapRowToComment(raw, entity);
        }
      }

      // Fallback (gdyby getOne nie istniało) – budujemy lokalnie z payloadu.
      return mapRowToComment(
        {
          id,
          ...payload,
          created_at: new Date().toISOString(),
        },
        entity,
      );
    },
    [create, getOne, endpoint, entity],
  );

  const updateComment = useCallback(
    async (id: CommentId, patch: UpdateCommentInput): Promise<Comment> => {
      if (!update) {
        throw new Error(`Update endpoint is disabled for ${endpoint}`);
      }

      const payload = mapUpdateInputToPayload(patch);
      await update(id, payload);

      if (getOne) {
        const raw = await getOne(id);
        if (raw) {
          return mapRowToComment(raw, entity);
        }
      }

      // Fallback – mapujemy z patcha, bez pełnego obrazu z backendu.
      return mapRowToComment(
        {
          id,
          ...payload,
        },
        entity,
      );
    },
    [update, getOne, endpoint, entity],
  );

  const deleteComment = useCallback(
    async (id: CommentId): Promise<void> => {
      if (!remove) {
        throw new Error(`Delete endpoint is disabled for ${endpoint}`);
      }
      await remove(id);
    },
    [remove, endpoint],
  );

  const pinComment = useCallback(
    async (id: CommentId, pinned: boolean): Promise<Comment> => {
      if (!updateField) {
        throw new Error(
          `Pinning is disabled for ${endpoint} (updateField endpoint not configured)`,
        );
      }

      await updateField({ id, field: 'is_pinned', value: pinned ? 1 : 0 });

      if (getOne) {
        const raw = await getOne(id);
        if (raw) {
          return mapRowToComment(raw, entity);
        }
      }

      return mapRowToComment(
        {
          id,
          is_pinned: pinned,
        },
        entity,
      );
    },
    [updateField, getOne, endpoint, entity],
  );

  const adapter: CommentsAdapter = {
    loading,
    error,
    comments,
    refresh,
    createComment,
    updateComment,
    deleteComment,
    pinComment,
  };

  return adapter;
}
