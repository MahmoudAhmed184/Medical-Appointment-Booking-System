import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps useAuth hook for context-based access.
 * TODO: Implement with useAuth hook
 */
export const AuthProvider = ({ children }) => {
    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
