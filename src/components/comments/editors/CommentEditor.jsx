import React from 'react';

import {
    Box,
} from '@mui/material';

// właściwy istniejący komponent:
import TinyEditor from './TinyEditor';

const CommentEditor = ({
    value,
    mentionOptions = [],
    mode = 'create',
    loading = false,

    onChange,
    onSubmit,
    onCancel,
    onImageUpload,
    onImageDelete
}) => {

    return (
        <Box
            sx={{
                width: '100%',
                py: 1,
            }}
        >
            <TinyEditor
                mode={mode}
                initialContent={value}
                initialFormState={null}
                mentionOptions={mentionOptions}
                loading={loading}
                onContentChange={onChange}
                onSave={onSubmit}
                onCancel={onCancel}
                onImageUpload={onImageUpload}
                onImageDelete={onImageDelete}
            />
        </Box>
    );
};

export default CommentEditor;