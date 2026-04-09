import { useState } from 'react';


export default function useBrigades({ initialTime = {}, employees = [], onChange }) {
    const [brigades, setBrigades] = useState([]);

    function updateBrigades(newBrigades) {
        setBrigades(newBrigades);
        if (typeof onChange === 'function') {
            onChange(newBrigades);
        }
    }
}