import { useCallback, useMemo, useState } from 'react';

const normalizeEditorPayload = (payload) => {
    const content_html = payload?.contentHtml ?? payload?.content ?? '';
    const mentions = payload?.mentions ?? [];
    return { content_html, mentions };
};

export function useCommentsController({
    onCreate,
    onUpdate,
    onDelete,
    onRefresh,
    onImageUpload,
    onMentions
}) {
    const [replyTo, setReplyTo] = useState(null);
    const [editing, setEditing] = useState(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [openThreadRootId, setOpenThreadRootId] = useState(null);

    const closeEditor = useCallback(() => {
        setReplyTo(null);
        setEditing(null);
        setEditorOpen(false);
    }, []);

    const openCreate = useCallback(() => {
        setReplyTo(null);
        setEditing(null);
        setEditorOpen(true);
    }, []);

    const openReply = useCallback((comment) => {
        setReplyTo(comment);
        setEditing(null);
        setEditorOpen(true);
    }, []);

    const openEdit = useCallback((comment) => {
        setEditing(comment);
        setReplyTo(null);
        setEditorOpen(true);
    }, []);

    const handleSave = useCallback(
        async (rawPayload) => {
            const { content_html, mentions } = normalizeEditorPayload(rawPayload);

            if (editing?.id && onUpdate) {
                await onUpdate(editing.id, { content_html });
                await onMentions && onMentions({ id: editing.id, mentions });
            } else if (onCreate) {
                const newID = await onCreate({ content_html, parent_id: replyTo?.id || null });
                await onMentions && onMentions({ id: newID, mentions });
            }

            closeEditor();
            await (onRefresh && onRefresh());
        },
        [closeEditor, editing?.id, onCreate, onRefresh, onUpdate, replyTo?.id],
    );

    // image-only comment via drop
    const handleDrop = useCallback(
        async (e) => {
            if (!onImageUpload || !onCreate) return;

            e.preventDefault();
            setDragging(false);

            const file = Array.from(e.dataTransfer.files || []).find((f) =>
                f.type?.startsWith('image/'),
            );
            if (!file) return;

            const url = await onImageUpload(file);
            if (!url) return;

            await onCreate({
                contentHtml: `<p><img src="${url}" alt="" /></p>`,
                parentId: null,
                mentions: [],
            });

            await (onRefresh && onRefresh());
        },
        [onCreate, onImageUpload, onRefresh],
    );

    const handleDragOver = useCallback(
        (e) => {
            if (!onImageUpload || !onCreate) return;
            e.preventDefault();
            setDragging(true);
        },
        [onCreate, onImageUpload],
    );

    const handleDragLeave = useCallback(() => setDragging(false), []);

    const handleDelete = useCallback(
        async (data) => {
            if (!onDelete) return;
            await onDelete(data.id);
            await (onRefresh && onRefresh());
        },
        [onDelete, onRefresh],
    );

    //Theread
    const handleToggleThread = useCallback((comment) => {
        const rootId = String(comment?.rootId ?? comment?.id ?? '');
        if (!rootId) return;

        setOpenThreadRootId(prev => (prev === rootId ? null : rootId));
    }, []);

    const handleTogglePin = useCallback(
        async (comment) => {
            console.log('handleTogglePin called');
            if (!onUpdate || !comment?.id) return;

            const nextPinned = !Boolean(comment.isPinned);
            const pinned_at = nextPinned ? new Date().toISOString() : null;
            await onUpdate(comment.id, { is_pinned: nextPinned, pinned_at });
            await (onRefresh && onRefresh());
        },
        [onUpdate, onRefresh],
    );


    //missing handlers:

    //onImageUpload -> we got it on props but wee need to control it here too
    //handleTogglePin
    //handleToggleThread
    //openThreadRootId

    const cancelCompose = closeEditor

    return useMemo(
        () => ({
            // state
            replyTo,
            editing,
            editorOpen,
            dragging,
            openThreadRootId,

            // actions
            openCreate,
            openReply,
            openEdit,
            closeEditor,
            cancelCompose,
            handleToggleThread,
            handleTogglePin,
            handleSave,
            handleDelete,

            // DnD
            handleDrop,
            handleDragOver,
            handleDragLeave,
        }),
        [
            replyTo,
            editing,
            editorOpen,
            dragging,
            openThreadRootId,

            openCreate,
            openReply,
            openEdit,
            closeEditor,
            cancelCompose,
            handleToggleThread,
            handleTogglePin,
            handleSave,
            handleDelete,

            handleDrop,
            handleDragOver,
            handleDragLeave,

        ],
    );
}
