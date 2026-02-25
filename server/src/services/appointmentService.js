import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Availability from '../models/Availability.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { APPOINTMENT_STATUS, toMinutes, MAX_APPOINTMENT_DURATION_MINUTES } from '../utils/constants.js';

/**
 * Get all appointments with pagination and filtering (admin).
 */
const getAllAppointments = async (query) => {
    const {
        page = 1,
        limit = 10,
        status,
        doctorId,
        patientId,
        startDate,
        endDate,
    } = query;

    const filter = {};

    if (status && Object.values(APPOINTMENT_STATUS).includes(status)) {
        filter.status = status;
    }
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, totalItems] = await Promise.all([
        Appointment.find(filter)
            .populate({
                path: 'patientId',
                populate: { path: 'userId', select: 'name email' },
            })
            .populate({
                path: 'doctorId',
                populate: [
                    { path: 'userId', select: 'name email' },
                    { path: 'specialtyId', select: 'name' },
                ],
            })
            .sort({ date: -1, startTime: -1 })
            .skip(skip)
            .limit(limitNum),
        Appointment.countDocuments(filter),
    ]);

    return {
        appointments,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems,
            totalPages: Math.ceil(totalItems / limitNum),
        },
    };
};

/**
 * Get a single appointment by ID with populated refs.
 * Checks ownership: admin can view any, doctor/patient can only view own.
 */
const getAppointmentById = async (appointmentId, requestingUser) => {
    const appointment = await Appointment.findById(appointmentId)
        .populate({
            path: 'patientId',
            populate: { path: 'userId', select: 'name email' },
        })
        .populate({
            path: 'doctorId',
            populate: [
                { path: 'userId', select: 'name email' },
                { path: 'specialtyId', select: 'name' },
            ],
        });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (requestingUser.role !== 'admin') {
        const isDoctor = appointment.doctorId?.userId?._id?.toString() === requestingUser._id.toString();
        const isPatient = appointment.patientId?.userId?._id?.toString() === requestingUser._id.toString();
        if (!isDoctor && !isPatient) {
            throw new ApiError(403, 'You are not authorized to view this appointment');
        }
    }

    return appointment;
};

/**
 * Find appointment and verify doctor ownership.
 */
const findAndVerifyDoctorOwnership = async (appointmentId, userId) => {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    const doctor = await Doctor.findOne({ userId });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        throw new ApiError(403, 'You can only manage your own appointments');
    }

    return appointment;
};

/**
 * Find appointment and verify patient ownership.
 */
const findAndVerifyPatientOwnership = async (appointmentId, userId) => {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    const patient = await Patient.findOne({ userId });
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        throw new ApiError(403, 'You can only manage your own appointments');
    }

    return { appointment, patient };
};

/**
 * Approve a pending appointment (doctor action).
 */
const approveAppointment = async (appointmentId, userId) => {
    const appointment = await findAndVerifyDoctorOwnership(appointmentId, userId);

    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
        throw new ApiError(400, `Cannot approve an appointment with status "${appointment.status}". Only pending appointments can be approved.`);
    }

    appointment.status = APPOINTMENT_STATUS.CONFIRMED;
    await appointment.save();
    return appointment;
};

/**
 * Reject a pending appointment (doctor action).
 */
const rejectAppointment = async (appointmentId, userId) => {
    const appointment = await findAndVerifyDoctorOwnership(appointmentId, userId);

    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
        throw new ApiError(400, `Cannot reject an appointment with status "${appointment.status}". Only pending appointments can be rejected.`);
    }

    appointment.status = APPOINTMENT_STATUS.REJECTED;
    await appointment.save();
    return appointment;
};

/**
 * Mark a confirmed appointment as completed (doctor action).
 */
const completeAppointment = async (appointmentId, userId) => {
    const appointment = await findAndVerifyDoctorOwnership(appointmentId, userId);

    if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
        throw new ApiError(400, `Cannot complete an appointment with status "${appointment.status}". Only confirmed appointments can be completed.`);
    }

    appointment.status = APPOINTMENT_STATUS.COMPLETED;
    await appointment.save();
    return appointment;
};


/**
 * List appointments for a doctor.
 */
const getDoctorAppointments = async (userId, query = {}) => {
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
        throw new ApiError(404, 'Doctor profile not found');
    }

    const { status, startDate, endDate } = query;
    const filter = { doctorId: doctor._id };

    if (status && Object.values(APPOINTMENT_STATUS).includes(status)) {
        filter.status = status;
    }

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    return Appointment.find(filter)
        .populate({
            path: 'patientId',
            populate: { path: 'userId', select: 'name email' },
        })
        .sort({ date: -1, startTime: -1 });
};


/**
 * Add/update doctor notes on an appointment.
 */
const addNotes = async (appointmentId, userId, notes) => {
    if (!notes || typeof notes !== 'string') {
        throw new ApiError(400, 'Notes field is required and must be a string');
    }

    const appointment = await findAndVerifyDoctorOwnership(appointmentId, userId);

    appointment.notes = notes;
    await appointment.save();
    return appointment;
};

/**
 * Book a new appointment (patient action).
 */
const bookAppointment = async (userId, { doctorId, date, startTime, endTime, reason }) => {
    const patient = await Patient.findOne({ userId });
    if (!patient) {
        throw new ApiError(404, 'Patient profile not found');
    }

    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new ApiError(400, 'startTime and endTime must be in HH:mm format');
    }

    const dateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
    if (!dateMatch) {
        throw new ApiError(400, 'Invalid appointment date format (YYYY-MM-DD required)');
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);

    const appointmentDay = new Date(year, month - 1, day);
    if (
        Number.isNaN(appointmentDay.getTime()) ||
        appointmentDay.getFullYear() !== year ||
        appointmentDay.getMonth() !== month - 1 ||
        appointmentDay.getDate() !== day
    ) {
        throw new ApiError(400, 'Invalid appointment date');
    }

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    if (endMinutes <= startMinutes) {
        throw new ApiError(400, 'endTime must be greater than startTime');
    }

    if (endMinutes - startMinutes > MAX_APPOINTMENT_DURATION_MINUTES) {
        throw new ApiError(400, 'Appointment duration cannot exceed 1 hour');
    }

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name');
    if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
    }

    // Verify doctor is approved
    const doctorUser = await User.findById(doctor.userId._id || doctor.userId);
    if (!doctorUser || !doctorUser.isApproved || doctorUser.isBlocked) {
        throw new ApiError(400, 'This doctor is not available for appointments');
    }

    const now = new Date();
    const startDateTime = new Date(appointmentDay);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    if (startDateTime < now) {
        throw new ApiError(400, 'Cannot book an appointment in the past');
    }

    const dayOfWeek = appointmentDay.getDay();
    const doctorAvailabilities = await Availability.find({ doctorId, dayOfWeek }).select('startTime endTime');

    const isWithinAvailability = doctorAvailabilities.some((slot) => {
        const slotStart = toMinutes(slot.startTime);
        const slotEnd = toMinutes(slot.endTime);
        return startMinutes >= slotStart && endMinutes <= slotEnd;
    });

    if (!isWithinAvailability) {
        throw new ApiError(400, 'Doctor is not available at this date/time');
    }

    const dayStart = new Date(appointmentDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDay);
    dayEnd.setHours(23, 59, 59, 999);

    const conflicting = await Appointment.findOne({
        doctorId,
        date: { $gte: dayStart, $lte: dayEnd },
        status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    });

    if (conflicting) {
        throw new ApiError(400, 'This time slot is already booked');
    }

    const appointment = await Appointment.create({
        doctorId,
        patientId: patient._id,
        date: dayStart,
        startTime,
        endTime,
        reason,
        status: APPOINTMENT_STATUS.PENDING,
    });

    return { appointment, doctorName: doctor.userId?.name };
};

/**
 * List appointments for a patient.
 */
const getPatientAppointments = async (userId, query = {}) => {
    const patient = await Patient.findOne({ userId });
    if (!patient) {
        throw new ApiError(404, 'Patient profile not found');
    }

    const { page = 1, limit = 10 } = query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { patientId: patient._id };
    const totalItems = await Appointment.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limitNum);

    const appointments = await Appointment.find(filter)
        .populate({
            path: 'doctorId',
            populate: [
                { path: 'userId', select: 'name email' },
                { path: 'specialtyId', select: 'name' },
            ],
        })
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(limitNum);

    return {
        appointments,
        pagination: { page: pageNum, limit: limitNum, totalItems, totalPages },
    };
};

/**
 * Cancel a patient's own appointment (via patient routes).
 */
const cancelPatientAppointment = async (appointmentId, userId) => {
    const patient = await Patient.findOne({ userId });
    if (!patient) {
        throw new ApiError(404, 'Patient profile not found');
    }

    const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId: patient._id,
    });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
        throw new ApiError(400, 'Already cancelled');
    }

    if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
        throw new ApiError(400, `Cannot cancel an appointment with status "${appointment.status}"`);
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();
    return appointment;
};

/**
 * Reschedule a patient's own appointment (via patient routes).
 */
const reschedulePatientAppointment = async (appointmentId, userId, data) => {
    const patient = await Patient.findOne({ userId });
    if (!patient) {
        throw new ApiError(404, 'Patient profile not found');
    }

    const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId: patient._id,
    });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    const { date, startTime, endTime } = data;

    if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
        throw new ApiError(400, `Cannot reschedule an appointment with status "${appointment.status}"`);
    }

    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new ApiError(400, 'startTime and endTime must be in HH:mm format');
    }

    const dateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
    if (!dateMatch) {
        throw new ApiError(400, 'Invalid appointment date format (YYYY-MM-DD required)');
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);

    const appointmentDay = new Date(year, month - 1, day);
    if (
        Number.isNaN(appointmentDay.getTime()) ||
        appointmentDay.getFullYear() !== year ||
        appointmentDay.getMonth() !== month - 1 ||
        appointmentDay.getDate() !== day
    ) {
        throw new ApiError(400, 'Invalid appointment date');
    }

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    if (endMinutes <= startMinutes) {
        throw new ApiError(400, 'endTime must be greater than startTime');
    }

    if (endMinutes - startMinutes > MAX_APPOINTMENT_DURATION_MINUTES) {
        throw new ApiError(400, 'Appointment duration cannot exceed 1 hour');
    }

    const now = new Date();
    const startDateTime = new Date(appointmentDay);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    if (startDateTime < now) {
        throw new ApiError(400, 'Cannot reschedule to a past time');
    }

    const dayOfWeek = appointmentDay.getDay();
    const doctorAvailabilities = await Availability.find({
        doctorId: appointment.doctorId,
        dayOfWeek,
    }).select('startTime endTime');

    const isWithinAvailability = doctorAvailabilities.some((slot) => {
        const slotStart = toMinutes(slot.startTime);
        const slotEnd = toMinutes(slot.endTime);
        return startMinutes >= slotStart && endMinutes <= slotEnd;
    });

    if (!isWithinAvailability) {
        throw new ApiError(400, 'Doctor is not available at this date/time');
    }

    const dayStart = new Date(appointmentDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDay);
    dayEnd.setHours(23, 59, 59, 999);

    const conflicting = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctorId: appointment.doctorId,
        date: { $gte: dayStart, $lte: dayEnd },
        status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    });

    if (conflicting) {
        throw new ApiError(400, 'This time slot is already booked');
    }

    appointment.date = dayStart;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.status = APPOINTMENT_STATUS.PENDING;
    await appointment.save();

    // Fetch doctor name for email
    const doctor = await Doctor.findById(appointment.doctorId).populate('userId', 'name');

    return { appointment, doctorName: doctor?.userId?.name };
};

export {
    getAllAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    addNotes,
    bookAppointment,
    getDoctorAppointments,
    getPatientAppointments,
    cancelPatientAppointment,
    reschedulePatientAppointment,
};

