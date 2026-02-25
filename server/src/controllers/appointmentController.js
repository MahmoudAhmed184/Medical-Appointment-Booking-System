import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import * as appointmentService from '../services/appointmentService.js';
import { APPOINTMENT_STATUS } from '../utils/constants.js';

/**
 * @desc    Get all appointments (paginated, filtered) — Admin view
 * @route   GET /api/appointments/all
 * @access  Admin
 */
const getAllAppointments = catchAsync(async (req, res) => {
    const { appointments, pagination } = await appointmentService.getAllAppointments(req.query);

    res.status(200).json({
        success: true,
        data: appointments,
        pagination,
    });
});

/**
 * @desc    Get appointment by ID — Owner (doctor or patient) or Admin
 * @route   GET /api/appointments/:id
 * @access  Auth required (ownership checked)
 */
const getAppointmentById = catchAsync(async (req, res) => {
    const { id } = req.params;

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

    // Ownership check: admin can view any, doctor/patient can only view own
    if (req.user.role !== 'admin') {
        const isDoctor = appointment.doctorId?.userId?._id?.toString() === req.user._id.toString();
        const isPatient = appointment.patientId?.userId?._id?.toString() === req.user._id.toString();

        if (!isDoctor && !isPatient) {
            throw new ApiError(403, 'You are not authorized to view this appointment');
        }
    }

    res.status(200).json({ success: true, data: appointment });
});

/**
 * @desc    Approve a pending appointment — Doctor only
 * @route   PATCH /api/appointments/:id/approve
 * @access  Doctor
 */
const approveAppointment = catchAsync(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    // Ownership: verify appointment belongs to this doctor
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        throw new ApiError(403, 'You can only approve your own appointments');
    }

    // Status validation: can only approve pending appointments
    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
        throw new ApiError(400, `Cannot approve an appointment with status "${appointment.status}". Only pending appointments can be approved.`);
    }

    appointment.status = APPOINTMENT_STATUS.CONFIRMED;
    await appointment.save();

    res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment approved successfully',
    });
});

/**
 * @desc    Reject a pending appointment — Doctor only
 * @route   PATCH /api/appointments/:id/reject
 * @access  Doctor
 */
const rejectAppointment = catchAsync(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    // Ownership: verify appointment belongs to this doctor
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        throw new ApiError(403, 'You can only reject your own appointments');
    }

    // Status validation: can only reject pending appointments
    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
        throw new ApiError(400, `Cannot reject an appointment with status "${appointment.status}". Only pending appointments can be rejected.`);
    }

    appointment.status = APPOINTMENT_STATUS.REJECTED;
    await appointment.save();

    res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment rejected successfully',
    });
});

/**
 * @desc    Mark appointment as completed — Doctor only
 * @route   PATCH /api/appointments/:id/complete
 * @access  Doctor
 */
const completeAppointment = catchAsync(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    // Ownership: verify appointment belongs to this doctor
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        throw new ApiError(403, 'You can only complete your own appointments');
    }

    // Status validation: can only complete confirmed appointments
    if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
        throw new ApiError(400, `Cannot complete an appointment with status "${appointment.status}". Only confirmed appointments can be completed.`);
    }

    appointment.status = APPOINTMENT_STATUS.COMPLETED;
    await appointment.save();

    res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment completed successfully',
    });
});

/**
 * @desc    Cancel an appointment — Patient only (via appointment routes)
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Patient
 */
const cancelAppointment = catchAsync(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    // Ownership: verify appointment belongs to this patient
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        throw new ApiError(403, 'You can only cancel your own appointments');
    }

    // Status validation: can only cancel pending or confirmed
    if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
        throw new ApiError(400, `Cannot cancel an appointment with status "${appointment.status}". Only pending or confirmed appointments can be cancelled.`);
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();

    res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment cancelled successfully',
    });
});

/**
 * @desc    Reschedule an appointment — Patient only (via appointment routes)
 * @route   PATCH /api/appointments/:id/reschedule
 * @access  Patient
 */
const rescheduleAppointment = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { date, startTime, endTime } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    // Ownership: verify appointment belongs to this patient
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        throw new ApiError(403, 'You can only reschedule your own appointments');
    }

    // Status validation
    if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
        throw new ApiError(400, `Cannot reschedule an appointment with status "${appointment.status}"`);
    }

    // Validate time format
    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new ApiError(400, 'startTime and endTime must be in HH:mm format');
    }

    // Validate date format
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

    const toMinutes = (value) => {
        const [h, m] = value.split(':').map(Number);
        return h * 60 + m;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    if (endMinutes <= startMinutes) {
        throw new ApiError(400, 'endTime must be greater than startTime');
    }

    // Check not in the past
    const now = new Date();
    const startDateTime = new Date(appointmentDay);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    if (startDateTime < now) {
        throw new ApiError(400, 'Cannot reschedule to a past time');
    }

    // Check doctor availability
    const { default: Availability } = await import('../models/Availability.js');
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

    // Check for conflicting appointments
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

    res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment rescheduled successfully',
    });
});

/**
 * @desc    Add/update notes on an appointment — Doctor only
 * @route   PATCH /api/appointments/:id/notes
 * @access  Doctor
 */
const addNotes = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes || typeof notes !== 'string') {
        throw new ApiError(400, 'Notes field is required and must be a string');
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    // Ownership: verify appointment belongs to this doctor
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        throw new ApiError(403, 'You can only add notes to your own appointments');
    }

    appointment.notes = notes;
    await appointment.save();

    res.status(200).json({
        success: true,
        data: appointment,
        message: 'Notes updated successfully',
    });
});

export {
    getAllAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    cancelAppointment,
    rescheduleAppointment,
    addNotes,
};
