import {
    prepareCreateCommentPayload,
    prepareCreateFilePayload,
    prepareCreateFileCommentPayload,
} from './productActivityUtils';


export const createProductActivityActions = ({
    product,
    activityEntity,
}) => {

    const refresh = async (result) => {
        await activityEntity.refresh();
        return result;
    };

    return {

        comments: {

            create: async (data) => {
                const payload = prepareCreateCommentPayload({
                    data,
                    product,
                });

                return refresh(
                    await activityEntity.create(payload)
                );
            },

            update: async (comment, data) => {
                return refresh(
                    await activityEntity.update(comment.id, {
                        product_id: product.id,
                        action: 'comment_update',
                        comment_id: comment.id,
                        ...data
                    })
                );
            },

            pin: async (comment, pinned) => {
                return refresh(
                    await activityEntity.update(comment.id, {
                        product_id: product.id,
                        action: 'comment_pin',
                        comment_id: comment.id,
                        pinned,
                    })
                );
            },

            delete: async (id) => {
                return refresh(
                    await activityEntity.remove(id, {
                        action : 'remove_comment',
                        product_id: product.id
                    })
                );
            }
        },


        files: {

            create: async (data) => {
                const payload = prepareCreateFilePayload({
                    data,
                    product,
                });

                return refresh(
                    await activityEntity.create(payload)
                );
            },

            update: async (file, field, value) => {
                return refresh(
                    await activityEntity.update({
                        product_id: product.id,
                        action: 'file_update',
                        file_id: file.id,
                        field,
                        value,
                    })
                );
            },

            pin: async (file, pinned) => {
                return refresh(
                    await activityEntity.update(file.id, {
                        product_id: product.id,
                        action: 'file_pin',
                        file_id: file.id,
                        pinned,
                    })
                );
            },

            status: async (file, statusId) => {
                return refresh(
                    await activityEntity.update(file.id,{
                        product_id: product.id,
                        action: 'file_status',
                        file_id: file.id,
                        status_id: statusId,
                    })
                );
            },

            delete: async (id) => {
                return refresh(
                    await activityEntity.remove(id, {
                        action : 'remove_file',
                        product_id: product.id,
                    })
                );
            }
        },


        fileComments: {

            create: async (file, data) => {
                const payload = prepareCreateFileCommentPayload({
                    data,
                    product,
                    file,
                });

                return refresh(
                    await activityEntity.create(payload)
                );
            },

            update: async (comment, data) => {
                const payload = {
                    product_id: product.id,
                    action: 'comment_file_update',
                    comment: {
                        id: comment.id,
                        content: data.content,
                    },
                    mentions: data.mentions ?? [],
                };

                return refresh(
                    await activityEntity.update(comment.id, payload)
                );
            },

            delete: async (id) => {
                return refresh(
                    await activityEntity.remove(id, {
                        action : 'remove_file_comment',
                        product_id: product.id
                    })
                );
            }
        },
    };
};