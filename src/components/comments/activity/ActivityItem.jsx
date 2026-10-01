import React from 'react';

import CommentItem from './CommentItem';
import FileItem from './FileItem';

import {
    ACTIVITY_TYPES,
} from '../ActivityDto';


const ActivityItem = ({
    item,
    layout,
    onCreateFileComment,
    onPinn,
    ...props
}) => {

    switch (item.type) {

        case ACTIVITY_TYPES.COMMENT:
            return (
                <CommentItem
                    comment={item}
                    layout={layout}
                    onPinn={onPinn}
                    {...props}
                />
            );

        case ACTIVITY_TYPES.FILE:
            return (
                <FileItem
                    file={item}
                    layout={layout}
                    onCreateFileComment={onCreateFileComment}
                    onPinn={onPinn}
                    {...props}
                />
            );

        default:
            console.warn(
                'CommentsRoll: unsupported activity type',
                item.type,
                item
            );

            return null;
    }
};

export default ActivityItem;