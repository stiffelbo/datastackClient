import { alpha } from "@mui/material/styles";

/**
 * Stabilny hash string → number
 */
const hashString = (str) => {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }

    return hash;
};

/**
 * Lepszy rozkład niż full hue wheel
 * (unika brzydkich zielono-żółtych konfliktów)
 */
const HUE_BUCKETS = [
    210, // blue
    160, // teal
    120, // green
    280, // purple
    20,  // orange
    340, // pink/red
    45,  // amber
    190, // cyan
];

export const colorFromString = (label, { opacity = 1 } = {}) => {
    if (!label) {
        return `rgba(120,120,120,${opacity})`;
    }

    const hash = hashString(label);
    const hue = HUE_BUCKETS[hash % HUE_BUCKETS.length];

    // stała estetyczna: nie za jaskrawe, nie pastelowe
    const saturation = 65;
    const lightness = 45;

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
};
