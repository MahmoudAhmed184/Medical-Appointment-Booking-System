import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { isValidObjectId } from 'mongoose';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import { APPOINTMENT_STATUS } from '../utils/constants.js';

const DOCTOR_DEFAULT_AVATAR = 'https://avatar.iran.liara.run/public/boy?username=doctor';

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
 * @desc    Get own doctor profile
 * @route   GET /api/doctors/profile
 * @access  Doctor
 */
const getProfile = catchAsync(async (req, res) => {
    const doctor = await Doctor.findOne({ userId: req.user._id })
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description');

    if (!doctor) {
        throw new ApiError(404, 'Doctor profile not found');
    }

    const availability = await Availability.find({ doctorId: doctor._id })
        .select('dayOfWeek startTime endTime')
        .sort({ dayOfWeek: 1, startTime: 1 });

    const normalizedAvailability = availability.map((row) => ({
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
    }));

    res.status(200).json({
        success: true,
        data: formatDoctor(doctor, normalizedAvailability),
    });
});

/**
 * @desc    List all approved doctors
 * @route   GET /api/doctors
 * @access  Public
 */
const getAllDoctors = catchAsync(async (req, res) => {
    // Get only approved users with doctor role
    const approvedDoctorUsers = await User.find({
        role: 'doctor',
        isApproved: true,
        isBlocked: false,
    }).select('_id');

    const approvedUserIds = approvedDoctorUsers.map((u) => u._id);

    const doctors = await Doctor.find({ userId: { $in: approvedUserIds } })
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description')
        .sort({ createdAt: -1 });

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

    const mapped = doctors.map((doc) =>
        formatDoctor(doc, availabilityByDoctorId.get(String(doc._id)) || [])
    );

    res.status(200).json({
        success: true,
        data: mapped,
    });
});

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctorById = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, 'Invalid doctor ID');
    }

    const doctor = await Doctor.findById(id)
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description');

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    const availability = await Availability.find({ doctorId: doctor._id })
        .select('dayOfWeek startTime endTime')
        .sort({ dayOfWeek: 1, startTime: 1 });

    const normalizedAvailability = availability.map((row) => ({
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
    }));

    res.status(200).json({
        success: true,
        data: formatDoctor(doctor, normalizedAvailability),
    });
});

/**
 * @desc    Update own doctor profile
 * @route   PUT /api/doctors/profile
 * @access  Doctor
 */
const updateProfile = catchAsync(async (req, res) => {
    const { name, email, phone, bio, address, image } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
        throw new ApiError(404, 'Doctor profile not found');
    }

    if (phone !== undefined) doctor.phone = phone;
    if (bio !== undefined) doctor.bio = bio;
    if (address !== undefined) doctor.address = address;
    if (image !== undefined) doctor.image = image;
    await doctor.save();

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    await user.save();

    const updatedDoctor = await Doctor.findById(doctor._id)
        .populate('userId', 'name email')
        .populate('specialtyId', 'name description');

    const availability = await Availability.find({ doctorId: doctor._id })
        .select('dayOfWeek startTime endTime')
        .sort({ dayOfWeek: 1, startTime: 1 });

    const normalizedAvailability = availability.map((row) => ({
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
    }));

    res.status(200).json({
        success: true,
        data: formatDoctor(updatedDoctor, normalizedAvailability),
        message: 'Doctor profile updated successfully',
    });
});

/**
 * @desc    Get own availability
 * @route   GET /api/doctors/availability
 * @access  Doctor
 */
const getAvailability = catchAsync(async (req, res) => {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
        throw new ApiError(404, 'Doctor profile not found');
    }

    const availability = await Availability.find({ doctorId: doctor._id })
        .sort({ dayOfWeek: 1, startTime: 1 });

    res.status(200).json({
        success: true,
        data: availability,
    });
});

/**
 * @desc    Set a new availability slot (derives doctorId from authenticated user)
 * @route   POST /api/doctors/availability
 * @access  Doctor
 */
const setAvailability = catchAsync(async (req, res) => {
    const { dayOfWeek, startTime, endTime } = req.body;

    // Derive doctorId from the authenticated user — never trust req.body.doctorId
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
        throw new ApiError(404, 'Doctor profile not found');
    }

    const doctorId = doctor._id;

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

    const newSlot = await Availability.create({ doctorId, dayOfWeek, startTime, endTime });

    res.status(201).json({
        success: true,
        data: newSlot,
        message: 'Availability slot created successfully',
    });
});

/**
 * @desc    Update an availability slot (verifies slot belongs to authenticated doctor)
 * @route   PUT /api/doctors/availability/:slotId
 * @access  Doctor
 */
const updateAvailabilitySlot = catchAsync(async (req, res) => {
    const { slotId } = req.params;
    const { startTime, endTime } = req.body;

    const slot = await Availability.findById(slotId);
    if (!slot) {
        throw new ApiError(404, 'Slot not found');
    }

    // Verify slot belongs to the authenticated doctor
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || slot.doctorId.toString() !== doctor._id.toString()) {
        throw new ApiError(403, 'You can only update your own availability slots');
    }

    // Check for conflicts
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

    res.status(200).json({
        success: true,
        data: slot,
        message: 'Availability slot updated successfully',
    });
});

/**
 * @desc    Delete an availability slot (verifies slot belongs to authenticated doctor)
 * @route   DELETE /api/doctors/availability/:slotId
 * @access  Doctor
 */
const deleteAvailabilitySlot = catchAsync(async (req, res) => {
    const { slotId } = req.params;

    const slot = await Availability.findById(slotId);
    if (!slot) {
        throw new ApiError(404, 'Slot not found');
    }

    // Verify slot belongs to the authenticated doctor
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || slot.doctorId.toString() !== doctor._id.toString()) {
        throw new ApiError(403, 'You can only delete your own availability slots');
    }

    await Availability.findByIdAndDelete(slotId);

    res.status(200).json({
        success: true,
        data: null,
        message: 'Slot deleted successfully',
    });
});

/**
 * @desc    Get available slots for a doctor on a given date (subtracts booked slots per SRS FR-PAT-02)
 * @route   GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
 * @access  Patient
 */
const getAvailableSlots = catchAsync(async (req, res) => {
    const doctorId = req.params.id;
    const { date } = req.query;

    if (!date) {
        throw new ApiError(400, 'Date query parameter is required');
    }

    if (!isValidObjectId(doctorId)) {
        throw new ApiError(400, 'Invalid doctor ID');
    }

    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
        throw new ApiError(400, 'Invalid date format');
    }

    const dayOfWeek = requestedDate.getDay();

    // 1. Fetch doctor's availability for this day of week
    const slots = await Availability.find({
        doctorId,
        dayOfWeek,
    }).sort({ startTime: 1 });

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
    const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const availableSlots = slots.filter((slot) => {
        const slotStart = toMinutes(slot.startTime);
        const slotEnd = toMinutes(slot.endTime);

        // Check if any booked appointment overlaps with this slot
        const isBooked = bookedAppointments.some((appt) => {
            const apptStart = toMinutes(appt.startTime);
            const apptEnd = toMinutes(appt.endTime);
            return apptStart < slotEnd && apptEnd > slotStart;
        });

        return !isBooked;
    });

    res.status(200).json({
        success: true,
        data: availableSlots,
    });
});

export {
    getAllDoctors,
    getDoctorById,
    getProfile,
    updateProfile,
    getAvailability,
    setAvailability,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailableSlots,
};
