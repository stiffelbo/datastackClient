// src/pages/_dev/Comments.jsx
import React, { useCallback } from 'react';
import useEntity from '../../hooks/useEntity';
import { useAuth } from '../../context/AuthContext';
import CommentsRoll from '../../lib/commentsThread/CommentsRoll';

// Na razie „na sztywno” – później możesz wziąć z auth/contextu.

export default function Comments({ refType = 'dev', refId = '123' }) {

  const userProfile = useAuth().getUserProfile();

  const comments = useEntity({
    endpoint: 'comments',
    query: { ref_type: refType, ref_id: refId },
    schemaQuery: { ref_type: refType, ref_id: refId },
  });

  const mentions = useEntity({
    endpoint: 'mentions',
    query: { ref_type: refType, ref_id: refId },
    schemaQuery: { ref_type: refType, ref_id: refId },
    schemaOnly: true,
  });

  // LISTA UŻYTKOWNIKÓW DO MENTIONS – z comments.schema.options.users
  const mentionOptions =
    comments.schema?.options?.users && Array.isArray(comments.schema.options.users)
      ? comments.schema.options.users
      : [];

  // ---- Handlery headless dla CommentsRoll ----

  const onRefresh = useCallback(async () => {
    await (comments.refresh?.() ?? Promise.resolve());
  }, [comments]);


  // DEV fallback: lokalny URL (w produkcji podepniesz swój upload i zwrócisz URL z backendu)
  const onImageUpload = useCallback(async (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <div style={{ marginTop: 16 }}>
        <CommentsRoll
          data={comments.rows || []}
          loading={comments.loading}
          currentUser={userProfile}
          mentionOptions={mentionOptions}
          onCreate={data => (comments.create({...data, ref_type: refType, ref_id: refId}))}
          onUpdate={comments.update}
          onDelete={comments.remove}
          onRefresh={onRefresh}
          onImageUpload={comments.uploadImg}
          onMentions={(data)=>{console.log(data)}}
          height={770}
        />
      </div>
    </div>
  );
}
