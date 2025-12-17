import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { MentionsUtility } from './mentionsUtility';

import { Button, Box, Chip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

//Components
import MentionsOptions from './MentionsOptions';

const TinyEditor = ({
  mode = 'create',
  initialContent = '',
  initialFormState,
  mentionOptions = [],
  onSave,
  onContentChange,
  onCancel,
  onImageUpload,
  onImageDelete
}) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState(initialContent);
  const [mentions, setMentions] = useState([]);
  const [mentionMode, setMentionMode] = useState(false);
  const [mentionSearch, setMentionSearch] = useState(null);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentionBookmark, setMentionBookmark] = useState(null);

  const [formState, setFormState] = useState(initialFormState);
  const [hasChanges, setHasChanges] = useState(false);


  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.setContent(initialContent);
      setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    if (initialFormState) {
      setFormState(initialFormState);
    }
  }, [initialFormState]);

  //Mentions
  const mentionsUtility = new MentionsUtility(
    editorRef,
    mentionOptions,
    mentionMode,
    setMentionMode,
    mentions,
    setMentions,
    setMentionSuggestions,
    setMentionSearch,
    mentionSearch,
    setMentionBookmark,
    mentionBookmark
  );

  const handleEditorChange = (content, editor) => {
    setContent(content);
    if (onContentChange) onContentChange(content);

    if (!hasChanges && content !== initialContent) {
      setHasChanges(true);
    }

    if (mentionOptions && mentionOptions.length) {
      mentionsUtility.detectMentionMode();
      mentionsUtility.monitorMentions();
      if (mentionMode) mentionsUtility.detectMentions();
    }
  };

  const handleFormStateChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    if (!hasChanges) setHasChanges(true);
  };

  const handleSubmit = () => {
    if (!onSave) return;

    const submissionData = {
      content: content,
      mentions: mentions,
    };

    onSave(submissionData);
  };

  // Image Upload Handler (Utility) (not implemented so far)
  const handleLocalImageUpload = async (file) => {
    if (!onImageUpload || !file) return;

    try {
      const url = await onImageUpload(file);
      return url;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const renderHeader = () => {
    return (
      <div>
        <MentionsOptions
          mentionMode={mentionMode}
          mentionSuggestions={mentionSuggestions}
          onInsert={mentionsUtility.handleMentionInsert}
        />
      </div>
    );
  };

  console.log(
    mode,
    initialContent,
    initialFormState,
    mentionOptions,
    onSave,
    onContentChange,
    onCancel,
    onImageUpload,
    onImageDelete
  );

  const renderFooter = () => {
    const label =
      mode === 'reply'
        ? 'Odpowiedz'
        : mode === 'edit'
          ? 'Zapisz zmiany'
          : 'Dodaj komentarz';

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          size="small"
          color="primary"
        >
          {label}
        </Button>

        {onCancel && (
          <IconButton
            color="error"
            onClick={onCancel}
            title="Anuluj"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
    );
  };
  return (
    <Box sx={{ position: 'relative' }}>
      {renderHeader()}
      <Editor
        apiKey='dk8jh10jcugp7w2k9662l4zzphbjmhkihi7snf04otjpgnjc'
        onInit={(evt, editor) => editorRef.current = editor}
        value={content}
        onEditorChange={handleEditorChange}
        init={{
          height: 300,
          menubar: false,
          toolbar: 'styleselect | bold italic | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'outdent indent | numlist bullist | emoticons | image | ' +
            'table',

          plugins: [
            'table',
            'image'
          ],
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',

          // Image handling configuration
          images_upload_handler: (blobInfo, success, failure) => {
            handleLocalImageUpload(blobInfo.blob())
              .then(url => success(url))
              .catch(error => failure('Upload failed: ' + error.message));
          },

          automatic_uploads: true,
          file_picker_types: 'image',
          file_picker_callback: (callback, value, meta) => {
            if (meta.filetype === 'image') {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');

              input.onchange = async (e) => {
                const file = e.target.files[0];
                const url = await handleLocalImageUpload(file);
                callback(url, { title: file.name });
              };
              input.click();
            }
          }
        }}
      />
      {renderFooter()}
    </Box>
  );
};

export default TinyEditor;
