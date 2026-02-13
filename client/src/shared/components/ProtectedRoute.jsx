import { Outlet } from 'react-router-dom';

/**
 * ProtectedRoute component — guards routes by auth status and role.
 * TODO: Implement auth check (redirect to /login) and role check (redirect to /)
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
    return <Outlet />;
};

export default ProtectedRoute;
