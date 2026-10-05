import React from 'react';

import CommentItem from './CommentItem';
import FileItem from './FileItem';
import LogItem from './LogItem';

import {
    ACTIVITY_TYPES,
} from '../ActivityDto';


const ActivityItem = ({
    item,
    layout,
    actions,
    mentionOptions,
    filesStatusesOptions=[],
}) => {
    switch (item.item_type) {

        case ACTIVITY_TYPES.COMMENT:
            return (
                <CommentItem
                    comment={item}
                    layout={layout}
                    actions={actions}
                    mentionOptions={mentionOptions}
                />
            );

        case ACTIVITY_TYPES.FILE:
            return (
                <FileItem
                    file={item}
                    layout={layout}
                    actions={actions}
                    mentionOptions={mentionOptions}
                    filesStatusesOptions={filesStatusesOptions}
                />
            );

        case ACTIVITY_TYPES.LOG:
            return (
                <LogItem
                    log={item}
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