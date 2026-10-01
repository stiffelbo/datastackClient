// root/components/comments/ActivityDto.js

import { z } from 'zod';

/**
 * Typy elementów activity.
 *
 * Nie są nazwami tabel w bazie.
 * Określają logiczny typ elementu dla Comments UI.
 */
export const ACTIVITY_TYPES = {
    COMMENT: 'comment',
    FILE: 'file',
    FILE_COMMENT: 'file_comment',
};
/**
 * RLS / capabilities są w całości wyliczane przez backend.
 *
 * Frontend nigdy nie ustala samodzielnie,
 * czy użytkownik może wykonać daną operację.
 */
export const ActivityRlsSchema = z.object({
    can_view: z.boolean(),
    can_edit: z.boolean(),
    can_delete: z.boolean(),
    can_reply: z.boolean(),

    can_pin: z.boolean(),
    can_unpin: z.boolean(),

    can_change_status: z.boolean(),

    can_approve: z.boolean(),
    can_reject: z.boolean(),

    can_download: z.boolean(),
});


/**
 * Mention użytkownika.
 */
export const ActivityMentionSchema = z.object({
    user_id: z.union([
        z.number(),
        z.string(),
    ]),

    label: z.string(),
});


/**
 * Content zwykłego komentarza.
 *
 * Przechowujemy HTML generowany przez edytor.
 */
export const CommentContentSchema = z.string();


/**
 * Content elementu plikowego.
 *
 * Nie jest treścią komentarza — zawiera metadane
 * potrzebne frontendowi do określenia sposobu renderowania.
 */
export const FileContentSchema = z.object({
    mime: z.string(),
});


/**
 * Wspólna część każdego elementu activity.
 */
const ActivityBaseSchema = z.object({
    id: z.union([
        z.number(),
        z.string(),
    ]),

    type: z.string(),

    product_id: z.number(),

    created_at: z.string().nullable(),
    created_by: z.number().nullable(),

    authorName: z.string().nullable(),

    updated_at: z.string().nullable(),
    updated_by: z.number().nullable(),

    mentions: z.array(ActivityMentionSchema),

    rls: ActivityRlsSchema,
});


/**
 * Komentarz bezpośrednio pod produktem.
 */
export const ActivityCommentSchema = ActivityBaseSchema.extend({
    type: z.literal(ACTIVITY_TYPES.COMMENT),

    content: CommentContentSchema,

    is_file: z.literal(false),

    is_pinned: z.boolean(),
    pinned_at: z.string().nullable(),

    parent_id: z.null().optional(),
});


/**
 * Komentarz przypisany do pliku.
 */
export const ActivityFileCommentSchema = ActivityBaseSchema.extend({
    type: z.literal(ACTIVITY_TYPES.FILE_COMMENT),

    product_file_id: z.number(),

    content: CommentContentSchema.nullable(),

    is_file: z.literal(false),

    is_pinned: z.boolean(),
    pinned_at: z.string().nullable(),

    parent_id: z.union([
        z.number(),
        z.string(),
    ]).nullable(),
});


/**
 * Plik produktu.
 */
export const ActivityFileSchema = ActivityBaseSchema.extend({
    type: z.literal(ACTIVITY_TYPES.FILE),

    name: z.string(),
    url: z.string().nullable(),

    content: FileContentSchema,

    is_file: z.literal(true),

    file_type: z.string().nullable(),

    status: z.object({
        id: z.number().nullable(),
        name: z.string().nullable(),
        color: z.string().nullable().optional(),
    }).nullable(),

    is_pinned: z.boolean(),
    pinned_at: z.string().nullable(),

    comments: z.array(ActivityFileCommentSchema),
});


/**
 * Pojedynczy element głównej rolki.
 *
 * File comments nie występują na root level —
 * znajdują się w file.comments[].
 */
export const ActivityItemSchema = z.discriminatedUnion('type', [
    ActivityCommentSchema,
    ActivityFileSchema,
]);


/**
 * Cała rolka activity produktu.
 */
export const ActivitySchema = z.array(
    ActivityItemSchema
);


/**
 * Waliduje dane zwrócone przez backend.
 *
 * Rzuca ZodError jeśli kontrakt API jest nieprawidłowy.
 */
export const parseActivity = (data) => {
    return ActivitySchema.parse(data ?? []);
};


/**
 * Wersja bez wyjątku.
 *
 * Przydatna np. podczas developmentu / migracji backendu.
 */
export const safeParseActivity = (data) => {
    return ActivitySchema.safeParse(data ?? []);
};


export const MentionOptionSchema = z.object({
    value: z.union([
        z.number(),
        z.string(),
    ]),

    label: z.string(),

    title: z.string().nullable().optional(),

    disabled: z.boolean().default(false),
});


export const MentionOptionsSchema = z.array(
    MentionOptionSchema
);

export const parseMentionOptions = (data) => {
    return MentionOptionsSchema.parse(data ?? []);
};


export const safeParseMentionOptions = (data) => {
    return MentionOptionsSchema.safeParse(data ?? []);
};