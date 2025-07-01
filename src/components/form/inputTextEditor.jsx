import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import DisplayHTML from './../displayHTML';

const InputTextEditor = ({ 
    value, 
    onChange, 
    uploadImage, 
    disabled = false, 
    allowImage = true, 
    placeholder = '', 
    error = false, 
    inputProps = {} // Props to pass additional configurations
}) => {
    const editorRef = useRef(null);
  
    const handleImageUpload = async (blobInfo, success, failure) => {
      try {
        const imageUrl = await uploadImage(blobInfo.blob());
        success(imageUrl);
      } catch (error) {
        failure("Failed to upload image");
      }
    };
  
    const handleEditorChange = (content, editor) => {
      if(!disabled){
        onChange(content);
      }
    };

    const canAddImages = allowImage ? 'image' : '';
    const editorHeight = inputProps.height || 400; // Allow control over height via inputProps

    if(!disabled){
      return (
          <div style={{border : error ? '1px solid red' : 'none'}}>
            <Editor
              apiKey="<your-api-key>"
              onInit={(evt, editor) => {
                editorRef.current = editor;
              }}
              value={value}
              onEditorChange={handleEditorChange}
              init={{
                  height: editorHeight, // Use the height from inputProps
                  menubar: false,
                  statusbar: false,
                  plugins: [
                    'advlist autolink lists link charmap anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime table paste wordcount emoticons ' + canAddImages,
                    
                  ],
                  toolbar: 'undo redo | styleselect | bold italic | ' +
                          'alignleft aligncenter alignright alignjustify | ' +
                          'outdent indent | numlist bullist | emoticons ' + canAddImages,
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  images_upload_handler: handleImageUpload,           
                  placeholder: placeholder,
                  setup: (editor) => {
                      editor.on('preInit', () => {
                      const images = editor.contentDocument.getElementsByTagName('img');
                      for (let i = 0; i < images.length; i++) {
                          images[i].setAttribute('height', images[i].getAttribute('data-mce-height'));
                          images[i].setAttribute('width', images[i].getAttribute('data-mce-width'));
                      }
                      });
                  },
                }
              }
                
            />
          </div>
        
      );
    }else{
      return <DisplayHTML value={value} />
    }    
  };

export default InputTextEditor;
