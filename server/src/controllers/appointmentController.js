import catchAsync from '../utils/catchAsync.js';
import * as appointmentService from '../services/appointmentService.js';

const listAppointments = catchAsync(async (req, res) => {
    const data = await appointmentService.getDoctorAppointments(req.user._id, req.query);

    res.status(200).json({ success: true, data });
});

const getAllAppointments = catchAsync(async (req, res) => {
    const { appointments, pagination } = await appointmentService.getAllAppointments(req.query);

    res.status(200).json({ success: true, data: appointments, pagination });
});

const getAppointmentById = catchAsync(async (req, res) => {
    const data = await appointmentService.getAppointmentById(req.params.id, req.user);

    res.status(200).json({ success: true, data });
});

const approveAppointment = catchAsync(async (req, res) => {
    const data = await appointmentService.approveAppointment(req.params.id, req.user._id);

    res.status(200).json({ success: true, data, message: 'Appointment approved successfully' });
});

const rejectAppointment = catchAsync(async (req, res) => {
    const data = await appointmentService.rejectAppointment(req.params.id, req.user._id);

    res.status(200).json({ success: true, data, message: 'Appointment rejected successfully' });
});

const completeAppointment = catchAsync(async (req, res) => {
    const data = await appointmentService.completeAppointment(req.params.id, req.user._id);

    res.status(200).json({ success: true, data, message: 'Appointment completed successfully' });
});

const addNotes = catchAsync(async (req, res) => {
    const data = await appointmentService.addNotes(req.params.id, req.user._id, req.body.notes);

    res.status(200).json({ success: true, data, message: 'Notes updated successfully' });
});

export {
    listAppointments,
    getAllAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    addNotes,
};
