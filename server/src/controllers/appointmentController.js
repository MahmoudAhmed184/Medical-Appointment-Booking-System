import catchAsync from '../utils/catchAsync.js';
import Appointment from '../models/Appointment.js';
import * as appointmentService from '../services/appointmentService.js';

// TODO: Implement bookAppointment handler
const bookAppointment = (req, res) => { };

const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

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
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate('patient')
            .populate('doctor');

        if (!appointment)
            return res.status(404).json({ success: false, message: 'Not found' });

        res.json({ success: true, data: appointment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TODO: Implement approveAppointment handler
const approveAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status: 'confirmed' },
            { new: true }
        );

        res.json({ success: true, data: appointment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TODO: Implement rejectAppointment handler by doctor
const rejectAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status: 'rejected' },
            { new: true }
        );

        res.json({ success: true, data: appointment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TODO: Implement completeAppointment handler
const completeAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true }
        );

        res.json({ success: true, data: appointment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TODO: Implement cancelAppointment handler by patient or doctor
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status: 'cancelled' },
            { new: true }
        );

        res.json({ success: true, data: appointment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TODO: Implement rescheduleAppointment handler
const rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, startTime, endTime } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment)
            return res.status(404).json({ success: false, message: 'Appointment not found' });

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);


        const existing = await Appointment.find({
            doctorId: appointment.doctorId,
            date: selectedDate,
            status: { $in: ['pending', 'confirmed'] },
            _id: { $ne: id }
        });

        const toMin = (t) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        const newStart = toMin(startTime);
        const newEnd = toMin(endTime);

        for (const app of existing) {
            const existingStart = toMin(app.startTime);
            const existingEnd = toMin(app.endTime);

            if (newStart < existingEnd && newEnd > existingStart) {
                return res.status(400).json({
                    success: false,
                    message: 'New time overlaps with another appointment'
                });
            }
        }


        appointment.date = selectedDate;
        appointment.startTime = startTime;
        appointment.endTime = endTime;
        appointment.status = 'pending';

        await appointment.save();

        res.status(200).json({
            success: true,
            data: appointment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// TODO: Implement addNotes handler
const addNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { notes },
            { new: true }
        );

        res.json({ success: true, data: appointment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    bookAppointment,
    getAllAppointments,
    getAppointmentById,
    approveAppointment,
    rejectAppointment,
    completeAppointment,
    cancelAppointment,
    rescheduleAppointment,
    addNotes,
};
