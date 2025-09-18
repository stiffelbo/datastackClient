import { useState, useEffect } from "react";

/**
 * Custom hook to persist state in localStorage.
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {any} initialValue - The initial value to be used if nothing is found in localStorage.
 * @returns {[any, function]} - Returns the stored value and a setter function.
 */
const useLocalStorage = (key, initialValue) => {
    // Get value from localStorage or use initial value
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error("Error loading localStorage key:", key, error);
            return initialValue;
        }
    });

    // Function to update localStorage whenever state changes
    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error("Error setting localStorage key:", key, error);
        }
    };

    return [storedValue, setValue];
};

export default useLocalStorage;
