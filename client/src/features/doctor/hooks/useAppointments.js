import { useState } from 'react';

const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    // TODO: Implement fetch and manage appointments
    return { appointments, loading };
};

export default useAppointments;
