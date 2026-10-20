
export const copyToClipboard = async (value) => {
    if (value === null || value === undefined) {
        return false;
    }

    const text = String(value);

    try {
        // HTTPS lub localhost
        if (navigator.clipboard?.writeText && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        // Fallback dla HTTP
        const textarea = document.createElement('textarea');

        textarea.value = text;
        textarea.setAttribute('readonly', '');

        Object.assign(textarea.style, {
            position: 'fixed',
            left: '-9999px',
            top: '0',
            opacity: '0',
        });

        document.body.appendChild(textarea);

        const activeElement = document.activeElement;

        try {
            textarea.focus();
            textarea.select();

            const success = document.execCommand('copy');

            return success;
        } finally {
            document.body.removeChild(textarea);
            activeElement?.focus?.();
        }
    } catch (error) {
        console.error('Clipboard error:', error);
        return false;
    }
};
