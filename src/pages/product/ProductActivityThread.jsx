import React, { useCallback } from 'react';

import useEntity from '../../hooks/useEntity';

import CommentsRoll from '../../components/comments/CommentsRoll';

import {createProductActivityActions} from './productActivityActions';

const ProductActivityThread = ({product, entity, activityEntity}) => {

    const actions = createProductActivityActions({
        product,
        activityEntity,
    });

    return <CommentsRoll 
                data={activityEntity.rows}
                loading={entity?.loading || activityEntity?.loading}
                mentionOptions={activityEntity?.schema?.options?.mentions}
                filesOptions={activityEntity?.schema?.options?.files}
                actions={actions}
            />
}

export default ProductActivityThread;