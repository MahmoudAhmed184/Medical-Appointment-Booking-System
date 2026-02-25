import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
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

/**
 * Approve a user (set isApproved to true).
 * FR-ADMIN-02
 */
const approveUser = async (id) => {
    const user = await User.findById(id).select('-password');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.isApproved) {
        throw new ApiError(400, 'User is already approved');
    }

    user.isApproved = true;
    await user.save();

    return user;
};

/**
 * Toggle block/unblock a user.
 * FR-ADMIN-02
 */
const toggleBlockUser = async (id) => {
    const user = await User.findById(id).select('-password');

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Prevent blocking admin users
    if (user.role === ROLES.ADMIN) {
        throw new ApiError(403, 'Cannot block an admin user');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return user;
};

/**
 * Delete a user and their associated profile (Doctor or Patient).
 * SRS §6.3
 */
const deleteUser = async (id) => {
    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Prevent deleting admin users
    if (user.role === ROLES.ADMIN) {
        throw new ApiError(403, 'Cannot delete an admin user');
    }

    // Delete associated profile and related data
    if (user.role === ROLES.DOCTOR) {
        const doctor = await Doctor.findOne({ userId: user._id });
        if (doctor) {
            await Availability.deleteMany({ doctorId: doctor._id });
            await Appointment.deleteMany({ doctorId: doctor._id });
            await doctor.deleteOne();
        }
    } else if (user.role === ROLES.PATIENT) {
        const patient = await Patient.findOne({ userId: user._id });
        if (patient) {
            await Appointment.deleteMany({ patientId: patient._id });
            await patient.deleteOne();
        }
    }

    await User.findByIdAndDelete(id);

    return { message: 'User deleted successfully' };
};

export { getAllUsers, getUserById, approveUser, toggleBlockUser, deleteUser };
