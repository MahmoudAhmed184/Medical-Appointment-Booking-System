import catchAsync from '../utils/catchAsync.js';
import * as userService from '../services/userService.js';

/**
 * @desc    Get all users (paginated, filtered)
 * @route   GET /api/users
 * @access  Admin
 */
const getAllUsers = catchAsync(async (req, res) => {
    const { users, pagination } = await userService.getAllUsers(req.query);

    res.status(200).json({
        success: true,
        data: users,
        pagination,
    });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Admin
 */
const getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// TODO: Implement approveUser handler
const approveUser = (req, res) => { };

// TODO: Implement blockUser handler
const blockUser = (req, res) => { };

// TODO: Implement deleteUser handler
const deleteUser = (req, res) => { };

export { getAllUsers, getUserById, approveUser, blockUser, deleteUser };
