import { useCallback, useMemo, useState } from 'react';


export const COMMENTS_LAYOUT_MODE = {
    ROLL: 'roll',

    ADD_COMMENT: 'add_comment',
    EDIT_COMMENT: 'edit_comment',

    ADD_FILE: 'add_file',
    ADD_FILE_COMMENT: 'add_file_comment',
};


const useCommentsLayout = ({
    initialMode = COMMENTS_LAYOUT_MODE.ROLL,
} = {}) => {

    const [mode, setMode] = useState(initialMode);
    const [target, setTarget] = useState(null);


    const showRoll = useCallback(() => {
        setTarget(null);
        setMode(COMMENTS_LAYOUT_MODE.ROLL);
    }, []);


    // ---------------------------------------------------------
    // COMMENT
    // ---------------------------------------------------------

    const showCommentEditor = useCallback(() => {
        setTarget(null);
        setMode(COMMENTS_LAYOUT_MODE.ADD_COMMENT);
    }, []);

    const showCommentEdit = useCallback((comment) => {
        setTarget(comment);
        setMode(COMMENTS_LAYOUT_MODE.EDIT_COMMENT);
    }, []);


    // ---------------------------------------------------------
    // FILE
    // ---------------------------------------------------------

    const showFileEditor = useCallback(() => {
        setTarget(null);
        setMode(COMMENTS_LAYOUT_MODE.ADD_FILE);
    }, []);

    const showFileCommentEditor = useCallback((file) => {
        setTarget(file);
        setMode(COMMENTS_LAYOUT_MODE.ADD_FILE_COMMENT);
    }, []);


    // ---------------------------------------------------------
    // CLOSE
    // ---------------------------------------------------------

    const closeEditor = useCallback(() => {
        setTarget(null);
        setMode(COMMENTS_LAYOUT_MODE.ROLL);
    }, []);


    // ---------------------------------------------------------
    // STATE
    // ---------------------------------------------------------

    const isRoll =
        mode === COMMENTS_LAYOUT_MODE.ROLL;

    const isCommentEditor =
        mode === COMMENTS_LAYOUT_MODE.ADD_COMMENT;

    const isCommentEdit =
        mode === COMMENTS_LAYOUT_MODE.EDIT_COMMENT;

    const isFileEditor =
        mode === COMMENTS_LAYOUT_MODE.ADD_FILE;

    const isFileCommentEditor =
        mode === COMMENTS_LAYOUT_MODE.ADD_FILE_COMMENT;

    const isEditorOpen =
        isCommentEditor ||
        isCommentEdit ||
        isFileEditor ||
        isFileCommentEditor;


    return useMemo(() => ({
        mode,
        target,

        isRoll,
        isEditorOpen,

        isCommentEditor,
        isCommentEdit,

        isFileEditor,
        isFileCommentEditor,

        setMode,

        showRoll,

        showCommentEditor,
        showCommentEdit,

        showFileEditor,
        showFileCommentEditor,

        closeEditor,
    }), [
        mode,
        target,

        isRoll,
        isEditorOpen,

        isCommentEditor,
        isCommentEdit,

        isFileEditor,
        isFileCommentEditor,

        showRoll,

        showCommentEditor,
        showCommentEdit,

        showFileEditor,
        showFileCommentEditor,

        closeEditor,
    ]);
};

export default useCommentsLayout;