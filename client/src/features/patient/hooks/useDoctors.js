import { useState } from 'react';

const useDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    // TODO: Implement fetch doctors with filters
    return { doctors, loading };
};

export default useDoctors;
