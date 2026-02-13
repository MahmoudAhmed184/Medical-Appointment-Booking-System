/**
 * JWT verification middleware.
 * Verifies the Bearer token and attaches decoded payload to req.user.
 */
const auth = (req, res, next) => {
    // TODO: Implement JWT verification
    next();
};

export default auth;
