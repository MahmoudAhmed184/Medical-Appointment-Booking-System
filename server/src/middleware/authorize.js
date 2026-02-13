/**
 * Role-based authorization middleware factory.
 * Usage: authorize('admin', 'doctor')
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // TODO: Implement role checking against req.user.role
        next();
    };
};

export default authorize;
