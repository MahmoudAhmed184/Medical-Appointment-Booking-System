import catchAsync from '../utils/catchAsync.js';
import * as userService from '../services/userService.js';

const getAllUsers = catchAsync(async (req, res) => {
    const { users, pagination } = await userService.getAllUsers(req.query);

    res.status(200).json({
        success: true,
        data: users,
        pagination,
    });
});

const getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

const approveUser = catchAsync(async (req, res) => {
    const user = await userService.approveUser(req.params.id);

    res.status(200).json({
        success: true,
        data: user,
        message: 'User approved successfully',
    });
});

const blockUser = catchAsync(async (req, res) => {
    const user = await userService.toggleBlockUser(req.params.id);

    res.status(200).json({
        success: true,
        data: user,
        message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    });
});

const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);

    res.status(200).json({
        success: true,
        data: null,
        message: 'User deleted successfully',
    });
});

export { getAllUsers, getUserById, approveUser, blockUser, deleteUser };
