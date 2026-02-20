import catchAsync from '../utils/catchAsync.js';
import * as appointmentService from '../services/appointmentService.js';

// TODO: Implement bookAppointment handler
const bookAppointment = (req, res) => { };

// TODO: Implement getMyAppointments handler
const getMyAppointments = (req, res) => { };

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

// TODO: Implement getAppointmentById handler
const getAppointmentById = (req, res) => { };

// TODO: Implement approveAppointment handler
const approveAppointment = (req, res) => { };

// TODO: Implement rejectAppointment handler
const rejectAppointment = (req, res) => { };

// TODO: Implement completeAppointment handler
const completeAppointment = (req, res) => { };

// TODO: Implement cancelAppointment handler
const cancelAppointment = (req, res) => { };

// TODO: Implement rescheduleAppointment handler
const rescheduleAppointment = (req, res) => { };

// TODO: Implement addNotes handler
const addNotes = (req, res) => { };

export {
    bookAppointment,
    getMyAppointments,
    getAllAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    cancelAppointment,
    rescheduleAppointment,
    addNotes,
};
