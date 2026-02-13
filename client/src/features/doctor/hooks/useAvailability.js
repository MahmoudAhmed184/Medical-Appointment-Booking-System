import { useState } from 'react';

const useAvailability = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    // TODO: Implement fetch, create, update, delete availability slots
    return { slots, loading };
};

export default useAvailability;
