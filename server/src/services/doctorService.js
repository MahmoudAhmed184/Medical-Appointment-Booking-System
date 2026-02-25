import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Availability from '../models/Availability.js';
import ApiError from '../utils/ApiError.js';

/**
 * Get all approved doctors with their availability.
 */
const getAllDoctors = async (query = {}) => {
    const { specialty, search } = query;

    // Get only approved, non-blocked doctor users
    const userFilter = { role: 'doctor', isApproved: true, isBlocked: false };
    if (search) {
        userFilter.name = { $regex: search, $options: 'i' };
    }

    const approvedUsers = await User.find(userFilter).select('_id');
    const approvedUserIds = approvedUsers.map((u) => u._id);

    const doctorFilter = { userId: { $in: approvedUserIds } };
    if (specialty) {
        doctorFilter.specialtyId = specialty;
    }

    const doctors = await Doctor.find(doctorFilter)
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description')
        .sort({ createdAt: -1 });

    return doctors;
};

/**
 * Get a doctor by their Doctor profile _id.
 */
const getDoctorById = async (id) => {
    const doctor = await Doctor.findById(id)
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description');

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    return doctor;
};

/**
 * Update a doctor's profile and associated user record.
 */
const updateProfile = async (userId, data) => {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
        throw new ApiError(404, 'Doctor profile not found');
    }

    const { phone, bio, address, image, name, email } = data;

    if (phone !== undefined) doctor.phone = phone;
    if (bio !== undefined) doctor.bio = bio;
    if (address !== undefined) doctor.address = address;
    if (image !== undefined) doctor.image = image;
    await doctor.save();

    if (name !== undefined || email !== undefined) {
        const user = await User.findById(userId);
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        await user.save();
    }

    return Doctor.findById(doctor._id)
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description');
};

/**
 * Get all availability slots for a doctor.
 */
const getAvailability = async (doctorId) => {
    return Availability.find({ doctorId }).sort({ dayOfWeek: 1, startTime: 1 });
};

/**
 * Create a new availability slot.
 */
const setAvailability = async (doctorId, slotData) => {
    const { dayOfWeek, startTime, endTime } = slotData;

    // Check for overlapping slots
    const exists = await Availability.findOne({
        doctorId,
        dayOfWeek,
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
        ],
    });

    if (exists) {
        throw new ApiError(400, 'Slot overlaps with existing slot');
    }

    return Availability.create({ doctorId, dayOfWeek, startTime, endTime });
};

/**
 * Update an existing availability slot.
 */
const updateAvailabilitySlot = async (slotId, data) => {
    const slot = await Availability.findById(slotId);
    if (!slot) {
        throw new ApiError(404, 'Slot not found');
    }

    const { startTime, endTime } = data;

    const conflict = await Availability.findOne({
        doctorId: slot.doctorId,
        dayOfWeek: slot.dayOfWeek,
        _id: { $ne: slotId },
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
        ],
    });

    if (conflict) {
        throw new ApiError(400, 'Updated slot overlaps with existing slot');
    }

    slot.startTime = startTime;
    slot.endTime = endTime;
    await slot.save();

    return slot;
};

/**
 * Delete an availability slot.
 */
const deleteAvailabilitySlot = async (slotId) => {
    const slot = await Availability.findByIdAndDelete(slotId);
    if (!slot) {
        throw new ApiError(404, 'Slot not found');
    }
    return slot;
};

/**
 * Get available slots for a doctor on a specific date,
 * subtracting already-booked appointments.
 */
const getAvailableSlots = async (doctorId, date) => {
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    const slots = await Availability.find({ doctorId, dayOfWeek }).sort({ startTime: 1 });

    return slots;
};

export {
    getAllDoctors,
    getDoctorById,
    updateProfile,
    getAvailability,
    setAvailability,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailableSlots,
};
