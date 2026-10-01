import React, { useCallback } from 'react';

import useEntity from '../../hooks/useEntity';

import CommentsRoll from '../../components/comments/CommentsRoll';

import {prepareCreateCommentPayload, prepareCreateFilePayload, prepareCreateFileCommentPayload } from './productActivityUtils';

const ProductActivityThread = ({product, entity, activityEntity}) => {

    const handleCreateComment = async (data) => {
        const payload = prepareCreateCommentPayload({data, product});
        const result = await activityEntity.create(payload); 
        activityEntity.refresh();
    }

    const handleCreateFile = async (data) => {
        const payload = prepareCreateFilePayload({data, product});
        const result = await activityEntity.create(payload); 
        activityEntity.refresh();
    }
    const handleCreateFileComment = async (file, data) => {
        const payload = prepareCreateFileCommentPayload({data, product, file});
        const result = await activityEntity.create(payload); 
        activityEntity.refresh();
    }
    const handlePinn = async () => {
        activityEntity.refresh();
    }

    return <CommentsRoll 
                data={activityEntity.rows}
                loading={entity?.loading || activityEntity?.loading}
                mentionOptions={activityEntity?.schema?.options?.mentions}
                filesOptions={activityEntity?.schema?.options?.files}
                onCreateComment={handleCreateComment}
                onCreateFile={handleCreateFile}
                onCreateFileComment={handleCreateFileComment}
                onPinn={handlePinn}
            />
}

export default ProductActivityThread;