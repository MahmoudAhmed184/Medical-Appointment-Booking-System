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

/**
 * @desc    Get appointments for the logged-in doctor
 * @route   GET /api/appointments/doctor
 * @access  Doctor
 */
const getDoctorAppointments = async (req, res) => {
    try {
        const Doctor = (await import('../models/Doctor.js')).default;
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        const appointments = await Appointment.find({ doctorId: doctor._id })
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
            .lean();

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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
    getDoctorAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    addNotes,
};
