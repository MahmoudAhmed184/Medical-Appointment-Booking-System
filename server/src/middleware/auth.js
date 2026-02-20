/**
 * JWT verification middleware.
 * Verifies the Bearer token and attaches decoded payload to req.user.
 */
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/tokenUtils.js';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new ApiError(401, 'Authorization token is required'));
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return next(new ApiError(401, 'Authorization token is required'));
        }

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select('_id name email role isApproved isBlocked');
        if (!user) {
            return next(new ApiError(401, 'Invalid token: user no longer exists'));
        }

        if (user.isBlocked) {
            return next(new ApiError(403, 'Your account has been blocked. Please contact support.'));
        }

        req.user = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
        };

        return next();
    } catch (error) {
        return next(error);
    }
};

export default auth;
