import { useState } from 'react';

const useBooking = () => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    // TODO: Implement slot fetching and booking
    return { availableSlots, loading };
};

export default useBooking;
