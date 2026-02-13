// TODO: Implement useUsers hook for fetching and managing users
import { useState } from 'react';

const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // TODO: Implement fetch, approve, block, delete

    return { users, loading };
};

export default useUsers;
