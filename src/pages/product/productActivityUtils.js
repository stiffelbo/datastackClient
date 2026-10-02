export const prepareCreateCommentPayload = ({ data, product }) => {
    return {
        action: 'comment',

        comment: {
            product_id: product.id,
            content: data.content,
        },

        mentions: data.mentions ?? [],
    };
};


export const prepareCreateFilePayload = ({ data, product }) => {
    const payload = new FormData();

    payload.append('action', 'file');

    payload.append(
        'file_data',
        JSON.stringify({
            product_id: product.id,
            type: data.type,
        })
    );

    payload.append('file', data.file);

    return payload;
};

export const prepareCreateFileCommentPayload = ({ data, product, file }) => {
    return {
        action: 'file_comment',

        comment: {
            product_file_id: file.id,
            content: data.content,
        },

        context: {
            product_id: product.id,
        },

        mentions: data.mentions ?? [],
    };
};
