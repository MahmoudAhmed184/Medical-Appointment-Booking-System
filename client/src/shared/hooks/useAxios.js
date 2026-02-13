import { useState } from 'react';

/**
 * Custom hook for making Axios requests with loading/error state.
 * TODO: Implement request wrapper with loading, error, and data management
 */
const useAxios = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const request = async (config) => { };
    return { request, loading, error };
};

export default useAxios;
