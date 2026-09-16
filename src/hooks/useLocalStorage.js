import { useState } from 'react';

const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);

            return item !== null
                ? JSON.parse(item)
                : initialValue;
        } catch (error) {
            console.error(
                'Error loading localStorage key:',
                key,
                error
            );

            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            setStoredValue((previousValue) => {
                const valueToStore =
                    typeof value === 'function'
                        ? value(previousValue)
                        : value;

                localStorage.setItem(
                    key,
                    JSON.stringify(valueToStore)
                );

                return valueToStore;
            });
        } catch (error) {
            console.error(
                'Error setting localStorage key:',
                key,
                error
            );
        }
    };

    return [
        storedValue,
        setValue,
    ];
};

export default useLocalStorage;