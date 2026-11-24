const COLORS = [
    '#1976d2',
    '#00897b',
    '#7b1fa2',
    '#ef6c00',
    '#c2185b',
    '#3949ab',
    '#689f38',
    '#0097a7',
    '#795548',
    '#546e7a',
    '#d84315',
    '#5e35b1',
];

export const getDagColor = (value) => {
    const key = String(value ?? 'default');

    let hash = 0;

    for (let i = 0; i < key.length; i++) {
        hash = Math.imul(31, hash) + key.charCodeAt(i);
        hash |= 0;
    }

    return COLORS[(hash >>> 0) % COLORS.length];
};