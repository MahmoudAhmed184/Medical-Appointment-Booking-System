import Doctor from '../models/Doctor.js';
import Availability from '../models/Availability.js';

const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate({
                path: 'user',
                select: 'name email bio phone isApproved isBlocked',
                match: { 
                    isApproved: true, 
                    isBlocked: false 
                }
            })
            .populate('specialty', 'name');

        const filteredDoctors = doctors.filter(d => d.user);

        res.status(200).json({
            success: true,
            data: filteredDoctors,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctors',
            error: error.message,
        });
    }
};

const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        
        const doctor = await Doctor.findById(id)
            .populate({
                path: 'user',
                select: 'name email bio phone isApproved isBlocked',
                match: { isApproved: true, isBlocked: false }
            })
            .populate('specialty', 'name');

       
        if (!doctor || !doctor.user) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found or not active',
            });
        }

        res.status(200).json({
            success: true,
            data: doctor,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch doctor',
            error: error.message,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const doctorId = req.params.id; 
        const { bio, phone, specialtyId } = req.body;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found',
            });
        }

        if (bio !== undefined) doctor.bio = bio;
        if (phone !== undefined) doctor.phone = phone;
        if (specialtyId !== undefined) doctor.specialtyId = specialtyId;

    
        const updatedDoctor = await doctor.save();

        await updatedDoctor.populate([
            { path: 'user', select: 'name email role isApproved isBlocked' },
            { path: 'specialty', select: 'name' }
        ]);

        res.status(200).json({
            success: true,
            data: updatedDoctor,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message,
        });
    }
};




const getAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const slots = await Availability.find({ doctorId }).sort({ dayOfWeek: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            data: slots,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const setAvailability = async (req, res) => {
    try {
        const { doctorId, dayOfWeek, startTime, endTime } = req.body;

        const exists = await Availability.findOne({
            doctorId,
            dayOfWeek,
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } }
            ]
        });

        if (exists) {
            return res.status(400).json({ success: false, message: 'Slot overlaps with existing slot' });
        }

        const newSlot = await Availability.create({ doctorId, dayOfWeek, startTime, endTime });

        res.status(201).json({ success: true, data: newSlot });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const updateAvailabilitySlot = async (req, res) => {
    try {
        const { slotId } = req.params;
        const { startTime, endTime } = req.body;

        const slot = await Availability.findById(slotId);
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

        const conflict = await Availability.findOne({
            doctorId: slot.doctorId,
            dayOfWeek: slot.dayOfWeek,
            _id: { $ne: slotId },
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ success: false, message: 'Updated slot overlaps with existing slot' });
        }

        slot.startTime = startTime;
        slot.endTime = endTime;
        await slot.save();

        res.status(200).json({ success: true, data: slot });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const deleteAvailabilitySlot = async (req, res) => {
    try {
        const { slotId } = req.params;

        const deleted = await Availability.findByIdAndDelete(slotId);
        if (!deleted) return res.status(404).json({ success: false, message: 'Slot not found' });

        res.status(200).json({ success: true, message: 'Slot deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query; // date = YYYY-MM-DD

        const dayOfWeek = new Date(date).getDay();

        const slots = await Availability.find({ doctorId, dayOfWeek }).sort({ startTime: 1 });

        res.status(200).json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export {
    getAllDoctors,
    getDoctorById,
    updateProfile,
    getAvailability,
    setAvailability,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailableSlots,
};
