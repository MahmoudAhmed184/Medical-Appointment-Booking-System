// TODO: Implement useSpecialties hook
import { useState } from 'react';

const useSpecialties = () => {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);

    // TODO: Implement CRUD operations

    return { specialties, loading };
};

export default useSpecialties;
