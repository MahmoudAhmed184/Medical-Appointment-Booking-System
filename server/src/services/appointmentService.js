import Appointment from '../models/Appointment.js';
import ApiError from '../utils/ApiError.js';
import { APPOINTMENT_STATUS } from '../utils/constants.js';

/**
 * Get all appointments with pagination and filtering (admin).
 * FR-ADMIN-05
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

    if (doctorId) {
        filter.doctorId = doctorId;
    }

    if (patientId) {
        filter.patientId = patientId;
    }

    if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
            filter.date.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.date.$lte = new Date(endDate);
        }
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
 * Get a single appointment by ID with populated references.
 */
const getAppointmentById = async (id) => {
    const appointment = await Appointment.findById(id)
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

    return appointment;
};

/**
 * Update appointment status with validation.
 */
const updateStatus = async (id, newStatus) => {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    // Status transition validation
    const validTransitions = {
        [APPOINTMENT_STATUS.PENDING]: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.REJECTED, APPOINTMENT_STATUS.CANCELLED],
        [APPOINTMENT_STATUS.CONFIRMED]: [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED],
    };

    const allowed = validTransitions[appointment.status];
    if (!allowed || !allowed.includes(newStatus)) {
        throw new ApiError(400, `Cannot transition from "${appointment.status}" to "${newStatus}"`);
    }

    appointment.status = newStatus;
    await appointment.save();

    return appointment;
};

/**
 * Add or update doctor notes on an appointment.
 */
const addNotes = async (id, notes) => {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    appointment.notes = notes;
    await appointment.save();

    return appointment;
};

export {
    getAllAppointments,
    getAppointmentById,
    updateStatus,
    addNotes,
};
