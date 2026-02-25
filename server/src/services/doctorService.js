import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import ApiError from '../utils/ApiError.js';
import { APPOINTMENT_STATUS, toMinutes } from '../utils/constants.js';

const DOCTOR_DEFAULT_AVATAR = 'https://avatar.iran.liara.run/public/boy?username=doctor';

/**
 * Format a doctor document with optional availability for API responses.
 */
const formatDoctor = (doctorDoc, availability = []) => {
    const doctor = doctorDoc?.toObject ? doctorDoc.toObject() : doctorDoc;
    return {
        _id: doctor?._id,
        userId: doctor?.userId,
        specialtyId: doctor?.specialtyId,
        bio: doctor?.bio || '',
        phone: doctor?.phone || '',
        address: doctor?.address || '',
        image: doctor?.image || DOCTOR_DEFAULT_AVATAR,
        availability,
    };
};

/**
 * Normalize availability rows to plain objects.
 */
const normalizeAvailability = (rows) =>
    rows.map((row) => ({
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
    }));

/**
 * Get a populated Doctor document by userId.
 */
const getDoctorByUserId = async (userId) => {
    const doctor = await Doctor.findOne({ userId })
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description');
    if (!doctor) {
        throw new ApiError(404, 'Doctor profile not found');
    }
    return doctor;
};

/**
 * Get the Doctor _id from an authenticated userId.
 */
const getDoctorIdByUserId = async (userId) => {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
        throw new ApiError(404, 'Doctor profile not found');
    }
    return doctor._id;
};

/**
 * Get own doctor profile with availability.
 */
const getProfile = async (userId) => {
    const doctor = await getDoctorByUserId(userId);

    const availability = await Availability.find({ doctorId: doctor._id })
        .select('dayOfWeek startTime endTime')
        .sort({ dayOfWeek: 1, startTime: 1 });

    return formatDoctor(doctor, normalizeAvailability(availability));
};

/**
 * Get all approved, non-blocked doctors with their availability.
 */
const getAllDoctors = async (query = {}) => {
    const { specialty, search, page = 1, limit = 10 } = query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

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

    const totalItems = await Doctor.countDocuments(doctorFilter);
    const totalPages = Math.ceil(totalItems / limitNum);

    const doctors = await Doctor.find(doctorFilter)
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    // Batch-load availability for all doctors
    const doctorIds = doctors.map((doc) => doc._id);
    const availabilityRows = await Availability.find({ doctorId: { $in: doctorIds } })
        .select('doctorId dayOfWeek startTime endTime')
        .sort({ dayOfWeek: 1, startTime: 1 });

    const availabilityByDoctorId = new Map();
    for (const row of availabilityRows) {
        const key = String(row.doctorId);
        if (!availabilityByDoctorId.has(key)) {
            availabilityByDoctorId.set(key, []);
        }
        availabilityByDoctorId.get(key).push({
            dayOfWeek: row.dayOfWeek,
            startTime: row.startTime,
            endTime: row.endTime,
        });
    }

    const data = doctors.map((doc) =>
        formatDoctor(doc, availabilityByDoctorId.get(String(doc._id)) || [])
    );

    return {
        doctors: data,
        pagination: { page: pageNum, limit: limitNum, totalItems, totalPages },
    };
};

/**
 * Get a doctor by their Doctor profile _id with availability.
 */
const getDoctorById = async (id) => {
    const doctor = await Doctor.findById(id)
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description');

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    const availability = await Availability.find({ doctorId: doctor._id })
        .select('dayOfWeek startTime endTime')
        .sort({ dayOfWeek: 1, startTime: 1 });

    return formatDoctor(doctor, normalizeAvailability(availability));
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
        if (!user) throw new ApiError(404, 'User not found');
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        await user.save();
    }

    const updatedDoctor = await Doctor.findById(doctor._id)
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description');

    const availability = await Availability.find({ doctorId: doctor._id })
        .select('dayOfWeek startTime endTime')
        .sort({ dayOfWeek: 1, startTime: 1 });

    return formatDoctor(updatedDoctor, normalizeAvailability(availability));
};

/**
 * Get all availability slots for a doctor by userId.
 */
const getAvailability = async (userId) => {
    const doctorId = await getDoctorIdByUserId(userId);
    return Availability.find({ doctorId }).sort({ dayOfWeek: 1, startTime: 1 });
};

/**
 * Create a new availability slot for a doctor.
 */
const setAvailability = async (userId, slotData) => {
    const doctorId = await getDoctorIdByUserId(userId);
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
 * Update an availability slot (verifies ownership).
 */
const updateAvailabilitySlot = async (userId, slotId, data) => {
    const slot = await Availability.findById(slotId);
    if (!slot) {
        throw new ApiError(404, 'Slot not found');
    }

    const doctorId = await getDoctorIdByUserId(userId);
    if (slot.doctorId.toString() !== doctorId.toString()) {
        throw new ApiError(403, 'You can only update your own availability slots');
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
 * Delete an availability slot (verifies ownership).
 */
const deleteAvailabilitySlot = async (userId, slotId) => {
    const slot = await Availability.findById(slotId);
    if (!slot) {
        throw new ApiError(404, 'Slot not found');
    }

    const doctorId = await getDoctorIdByUserId(userId);
    if (slot.doctorId.toString() !== doctorId.toString()) {
        throw new ApiError(403, 'You can only delete your own availability slots');
    }

    await Availability.findByIdAndDelete(slotId);
};

/**
 * Get available slots for a doctor on a specific date,
 * subtracting already-booked appointments (SRS FR-PAT-02).
 */
const getAvailableSlots = async (doctorId, date) => {
    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
        throw new ApiError(400, 'Invalid date format');
    }

    const dayOfWeek = requestedDate.getDay();

    // 1. Fetch doctor's availability for this day of week
    const slots = await Availability.find({ doctorId, dayOfWeek }).sort({ startTime: 1 });

    // 2. Fetch already-booked appointments for this doctor on this date
    const dayStart = new Date(requestedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
        doctorId,
        date: { $gte: dayStart, $lte: dayEnd },
        status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] },
    }).select('startTime endTime');

    // 3. Subtract booked slots from available slots

    return slots.filter((slot) => {
        const slotStart = toMinutes(slot.startTime);
        const slotEnd = toMinutes(slot.endTime);

        const isBooked = bookedAppointments.some((appt) => {
            const apptStart = toMinutes(appt.startTime);
            const apptEnd = toMinutes(appt.endTime);
            return apptStart < slotEnd && apptEnd > slotStart;
        });

        return !isBooked;
    });
};

export {
    getProfile,
    getAllDoctors,
    getDoctorById,
    updateProfile,
    getAvailability,
    setAvailability,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailableSlots,
};
