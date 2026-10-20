import http from '../../http';

export const imageUploadService = async ({ id, field, value, onUpload, setLoading }) => {
    const formData = new FormData();

    formData.append('id', String(id));
    formData.append('field', field);

    if (value instanceof File) {
        formData.append('action', 'upload');
        formData.append('file', value);
    } else {
        formData.append('action', 'delete');
    }

    setLoading(true);

    try {
        const response = await http.post(
            '/numismatics/files.php',
            formData
        );

        if (response?.success !== true) {
            throw new Error('Operacja na zdjęciu nie powiodła się');
        }

        await onUpload(id);

        return response.data;
    } finally {
        setLoading(false);
    }
};
