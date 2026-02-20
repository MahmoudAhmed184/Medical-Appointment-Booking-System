import Appointment from '../models/Appointment.js';
import { APPOINTMENT_STATUS } from '../utils/constants.js';

// TODO: Implement bookAppointment service
const bookAppointment = async (data) => { };

// TODO: Implement getAppointments service
const getAppointments = async (userId, role, query) => { };

/**
 * Get all appointments with pagination and filtering (admin).
 * FR-ADMIN-05
 * Filters: status, doctorId, patientId, date range
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

    // Filter by status
    if (status && Object.values(APPOINTMENT_STATUS).includes(status)) {
        filter.status = status;
    }

    // Filter by doctor
    if (doctorId) {
        filter.doctorId = doctorId;
    }

    // Filter by patient
    if (patientId) {
        filter.patientId = patientId;
    }

    // Filter by date range
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
                path: 'patient',
                populate: { path: 'user', select: 'name email' },
            })
            .populate({
                path: 'doctor',
                populate: [
                    { path: 'user', select: 'name email' },
                    { path: 'specialty', select: 'name' },
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

// TODO: Implement getAppointmentById service
const getAppointmentById = async (id) => { };

// TODO: Implement updateStatus service
const updateStatus = async (id, status) => { };

// TODO: Implement reschedule service
const reschedule = async (id, data) => { };

// TODO: Implement addNotes service
const addNotes = async (id, notes) => { };

export {
    bookAppointment,
    getAppointments,
    getAllAppointments,
    getAppointmentById,
    updateStatus,
    reschedule,
    addNotes,
};
