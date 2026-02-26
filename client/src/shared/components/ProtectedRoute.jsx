import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, token } = useSelector((state) => state.auth);

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const destinations = { admin: '/admin', doctor: '/doctor', patient: '/patient' };
        return <Navigate to={destinations[user.role] || '/login'} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
