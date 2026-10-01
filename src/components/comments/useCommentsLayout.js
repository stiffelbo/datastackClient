import { useCallback, useMemo, useState } from 'react';


export const COMMENTS_LAYOUT_MODE = {
    ROLL: 'roll',
    ADD_COMMENT: 'add_comment',
    ADD_FILE: 'add_file',
    ADD_FILE_COMMENT: 'add_file_comment',
};

/**
 * Kontroluje stan layoutu Comments UI.
 *
 * Nie wykonuje CRUD.
 * Nie zna endpointów.
 * Nie zarządza activity data.
 */
const useCommentsLayout = ({
    initialMode = COMMENTS_LAYOUT_MODE.ROLL,
} = {}) => {

    const [mode, setMode] = useState(initialMode);
    const [target, setTarget] = useState(null);

    const showRoll = useCallback(() => {
        setTarget(null);
        setMode(COMMENTS_LAYOUT_MODE.ROLL);
    }, []);

    const showCommentEditor = useCallback(() => {
        setTarget(null);
        setMode(COMMENTS_LAYOUT_MODE.ADD_COMMENT);
    }, []);

    const showFileEditor = useCallback(() => {
        setTarget(null);
        setMode(COMMENTS_LAYOUT_MODE.ADD_FILE);
    }, []);

    const showFileCommentEditor = useCallback((file) => {
        setTarget(file);
        setMode(COMMENTS_LAYOUT_MODE.ADD_FILE_COMMENT);
    }, []);

    const closeEditor = useCallback(() => {
        setTarget(null);
        setMode(COMMENTS_LAYOUT_MODE.ROLL);
    }, []);

    const isRoll =
        mode === COMMENTS_LAYOUT_MODE.ROLL;

    const isCommentEditor =
        mode === COMMENTS_LAYOUT_MODE.ADD_COMMENT;

    const isFileEditor =
        mode === COMMENTS_LAYOUT_MODE.ADD_FILE;

    const isFileCommentEditor =
        mode === COMMENTS_LAYOUT_MODE.ADD_FILE_COMMENT;

    const isEditorOpen =
        isCommentEditor ||
        isFileEditor ||
        isFileCommentEditor;

    return useMemo(() => ({
        mode,
        target,

        isRoll,
        isEditorOpen,
        isCommentEditor,
        isFileEditor,
        isFileCommentEditor,

        setMode,

        showRoll,
        showCommentEditor,
        showFileEditor,
        showFileCommentEditor,
        closeEditor,
    }), [
        mode,
        target,

        isRoll,
        isEditorOpen,
        isCommentEditor,
        isFileEditor,
        isFileCommentEditor,

        showRoll,
        showCommentEditor,
        showFileEditor,
        showFileCommentEditor,
        closeEditor,
    ]);
};

export default useCommentsLayout;