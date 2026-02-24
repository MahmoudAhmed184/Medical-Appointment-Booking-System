import catchAsync from "../utils/catchAsync.js";
import * as userService from "../services/userService.js";

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

/**
 * @desc    Approve a user (doctor)
 * @route   PATCH /api/users/:id/approve
 * @access  Admin
 */
const approveUser = catchAsync(async (req, res) => {
  const user = await userService.approveUser(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
    message: "User approved successfully",
  });
});

/**
 * @desc    Block/unblock a user
 * @route   PATCH /api/users/:id/block
 * @access  Admin
 */
const blockUser = catchAsync(async (req, res) => {
  const user = await userService.toggleBlockUser(req.params.id);

  res.status(200).json({
    success: true,
    data: user,
    message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
  });
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);

  res.status(200).json({
    success: true,
    data: null,
    message: "User deleted successfully",
  });
});

export { getAllUsers, getUserById, approveUser, blockUser, deleteUser };
