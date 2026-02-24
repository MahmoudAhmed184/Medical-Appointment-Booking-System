/**
 * Role-based authorization middleware factory.
 * Usage: authorize('admin', 'doctor')
 */
import ApiError from '../utils/ApiError.js';

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, 'You are not authorized to access this resource'));
        }

        return next();
    };
};

export default authorize;
