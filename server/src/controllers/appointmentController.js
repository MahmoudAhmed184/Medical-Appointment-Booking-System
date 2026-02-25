import catchAsync from '../utils/catchAsync.js';
import * as appointmentService from '../services/appointmentService.js';

/**
 * @desc    Get all appointments (paginated, filtered) — Admin view
 * @route   GET /api/appointments/all
 * @access  Admin
 */
const getAllAppointments = catchAsync(async (req, res) => {
    const { appointments, pagination } = await appointmentService.getAllAppointments(req.query);

    res.status(200).json({ success: true, data: appointments, pagination });
});

/**
 * @desc    Get appointment by ID — Owner or Admin
 * @route   GET /api/appointments/:id
 * @access  Auth required (ownership checked in service)
 */
const getAppointmentById = catchAsync(async (req, res) => {
    const data = await appointmentService.getAppointmentById(req.params.id, req.user);

    res.status(200).json({ success: true, data });
});

/**
 * @desc    Approve a pending appointment — Doctor only
 * @route   PATCH /api/appointments/:id/approve
 * @access  Doctor
 */
const approveAppointment = catchAsync(async (req, res) => {
    const data = await appointmentService.approveAppointment(req.params.id, req.user._id);

    res.status(200).json({ success: true, data, message: 'Appointment approved successfully' });
});

/**
 * @desc    Reject a pending appointment — Doctor only
 * @route   PATCH /api/appointments/:id/reject
 * @access  Doctor
 */
const rejectAppointment = catchAsync(async (req, res) => {
    const data = await appointmentService.rejectAppointment(req.params.id, req.user._id);

    res.status(200).json({ success: true, data, message: 'Appointment rejected successfully' });
});

/**
 * @desc    Mark appointment as completed — Doctor only
 * @route   PATCH /api/appointments/:id/complete
 * @access  Doctor
 */
const completeAppointment = catchAsync(async (req, res) => {
    const data = await appointmentService.completeAppointment(req.params.id, req.user._id);

    res.status(200).json({ success: true, data, message: 'Appointment completed successfully' });
});

/**
 * @desc    Cancel an appointment — Patient only
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Patient
 */
const cancelAppointment = catchAsync(async (req, res) => {
    const data = await appointmentService.cancelAppointment(req.params.id, req.user._id);

    res.status(200).json({ success: true, data, message: 'Appointment cancelled successfully' });
});

/**
 * @desc    Reschedule an appointment — Patient only
 * @route   PATCH /api/appointments/:id/reschedule
 * @access  Patient
 */
const rescheduleAppointment = catchAsync(async (req, res) => {
    const data = await appointmentService.rescheduleAppointment(
        req.params.id,
        req.user._id,
        req.body
    );

    res.status(200).json({ success: true, data, message: 'Appointment rescheduled successfully' });
});

/**
 * @desc    Add/update notes on an appointment — Doctor only
 * @route   PATCH /api/appointments/:id/notes
 * @access  Doctor
 */
const addNotes = catchAsync(async (req, res) => {
    const data = await appointmentService.addNotes(req.params.id, req.user._id, req.body.notes);

    res.status(200).json({ success: true, data, message: 'Notes updated successfully' });
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
