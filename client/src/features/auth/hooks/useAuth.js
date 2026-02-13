/**
 * useAuth hook — wraps login, register, and logout with Redux dispatch.
 * TODO: Implement login, register, logout functions with API calls and navigation
 */
const useAuth = () => {
    return { user: null, token: null, loading: false, error: null, login: async () => { }, register: async () => { }, logout: () => { } };
};

export default useAuth;
