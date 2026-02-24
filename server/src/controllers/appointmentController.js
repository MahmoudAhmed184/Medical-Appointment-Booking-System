import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, startTime, endTime, reason } = req.body;
        const patientId = req.body.patientId; 

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const dayOfWeek = selectedDate.getDay();

        
        const availability = await Availability.findOne({
            doctorId,
            dayOfWeek,
            startTime: { $lte: startTime },
            endTime: { $gte: endTime }
        });

        if (!availability) {
            return res.status(400).json({
                success: false,
                message: 'Selected time is outside doctor availability'
            });
        }

        // 2️⃣ منع overlap
        const existing = await Appointment.find({
            doctorId,
            date: selectedDate,
            status: { $in: ['pending', 'confirmed'] }
        });

        const newStart = toMinutes(startTime);
        const newEnd = toMinutes(endTime);

        for (const app of existing) {
            const existingStart = toMinutes(app.startTime);
            const existingEnd = toMinutes(app.endTime);

            if (newStart < existingEnd && newEnd > existingStart) {
                return res.status(400).json({
                    success: false,
                    message: 'Time overlaps with another appointment'
                });
            }
        }

        const appointment = await Appointment.create({
            doctorId,
            patientId,
            date: selectedDate,
            startTime,
            endTime,
            reason
        });

        res.status(201).json({ success: true, data: appointment });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// TODO: Implement getMyAppointments handler for both patients and doctors
const getMyAppointments = async (req, res) => {
    try {
        const id = req.body.id;
        const role = req.body.role;

        let filter = {};

        if (role === 'patient') {
            const patient = await Patient.findOne({ id: id });
            if (!patient)
                return res.status(404).json({ success: false, message: 'Patient not found' });

            filter = { patientId: patient._id };
        }

        if (role === 'doctor') {
            const doctor = await Doctor.findOne({ id: id });
            if (!doctor)
                return res.status(404).json({ success: false, message: 'Doctor not found' });

            filter = { doctorId: doctor._id };
        }

        const appointments = await Appointment.find(filter)
            .populate({
                path: 'patient',
                populate: { path: 'user', select: 'name email phone' }
            })
            .populate({
                path: 'doctor',
                populate: { path: 'user', select: 'name email phone' }
            })
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: appointments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// TODO: Implement getAllAppointments handler for admin to view all appointments
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient')
            .populate('doctor')
            .sort({ date: -1 });

        res.json({ success: true, data: appointments });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

        const toMinutes = (t) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        const newStart = toMinutes(startTime);
        const newEnd = toMinutes(endTime);

        for (const app of existing) {
            const existingStart = toMinutes(app.startTime);
            const existingEnd = toMinutes(app.endTime);

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
