import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../utils/constants.js';

/**
 * Get all users with pagination, filtering by role, approval status, and name search.
 * FR-ADMIN-01
 */
const getAllUsers = async (query) => {
    const {
        page = 1,
        limit = 10,
        role,
        isApproved,
        isBlocked,
        search,
    } = query;

    const filter = {};

    // Filter by role
    if (role && Object.values(ROLES).includes(role)) {
        filter.role = role;
    }

    // Filter by approval status
    if (isApproved !== undefined) {
        filter.isApproved = isApproved === 'true';
    }

    // Filter by blocked status
    if (isBlocked !== undefined) {
        filter.isBlocked = isBlocked === 'true';
    }

    // Search by name (case-insensitive partial match)
    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, totalItems] = await Promise.all([
        User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(filter),
    ]);

    return {
        users,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems,
            totalPages: Math.ceil(totalItems / limitNum),
        },
    };
};

/**
 * Get a single user by ID.
 * FR-ADMIN-01
 */
const getUserById = async (id) => {
    const user = await User.findById(id).select('-password');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return user;
};

// TODO: Implement approveUser service
const approveUser = async (id) => { };

// TODO: Implement toggleBlockUser service
const toggleBlockUser = async (id) => { };

// TODO: Implement deleteUser service
const deleteUser = async (id) => { };

export { getAllUsers, getUserById, approveUser, toggleBlockUser, deleteUser };
