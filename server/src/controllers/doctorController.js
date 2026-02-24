import { isValidObjectId } from 'mongoose';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Availability from '../models/Availability.js';

const DOCTOR_DEFAULT_AVATAR = 'https://avatar.iran.liara.run/public/boy?username=doctor';

const formatDoctor = (doctorDoc, availability = []) => {
    const doctor = doctorDoc?.toObject ? doctorDoc.toObject() : doctorDoc;
    return {
        _id: doctor?._id,
        userId: doctor?.userId,
        specialtyId: doctor?.specialtyId,
        bio: doctor?.bio || '',
        phone: doctor?.phone || '',
        address: doctor?.address || '',
        image: doctor?.image || DOCTOR_DEFAULT_AVATAR,
        availability,
    };
};

// GET /api/doctors/profile
const getProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id })
            .populate('userId', 'name email')
            .populate('specialtyId', 'name description');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const availability = await Availability.find({ doctorId: doctor._id })
            .select('dayOfWeek startTime endTime')
            .sort({ dayOfWeek: 1, startTime: 1 });

        const normalizedAvailability = availability.map((row) => ({
            dayOfWeek: row.dayOfWeek,
            startTime: row.startTime,
            endTime: row.endTime,
        }));

        return res.status(200).json({
            doctor: formatDoctor(doctor, normalizedAvailability),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// GET /api/doctors
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'name email')
            .populate('specialtyId', 'name description')
            .sort({ createdAt: -1 });

        const doctorIds = doctors.map((doc) => doc._id);
        const availabilityRows = await Availability.find({ doctorId: { $in: doctorIds } })
            .select('doctorId dayOfWeek startTime endTime')
            .sort({ dayOfWeek: 1, startTime: 1 });

        const availabilityByDoctorId = new Map();
        for (const row of availabilityRows) {
            const key = String(row.doctorId);
            if (!availabilityByDoctorId.has(key)) {
                availabilityByDoctorId.set(key, []);
            }
            availabilityByDoctorId.get(key).push({
                dayOfWeek: row.dayOfWeek,
                startTime: row.startTime,
                endTime: row.endTime,
            });
        }

        const mapped = doctors.map((doc) =>
            formatDoctor(doc, availabilityByDoctorId.get(String(doc._id)) || [])
        );

        return res.status(200).json({ doctors: mapped });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid doctor ID' });
        }

        const doctor = await Doctor.findById(id)
            .populate('userId', 'name email')
            .populate('specialtyId', 'name description');

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const availability = await Availability.find({ doctorId: doctor._id })
            .select('dayOfWeek startTime endTime')
            .sort({ dayOfWeek: 1, startTime: 1 });

        const normalizedAvailability = availability.map((row) => ({
            dayOfWeek: row.dayOfWeek,
            startTime: row.startTime,
            endTime: row.endTime,
        }));

        return res.status(200).json({
            doctor: formatDoctor(doctor, normalizedAvailability),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// PUT /api/doctors/profile
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, bio, address, image } = req.body;

        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        if (phone !== undefined) doctor.phone = phone;
        if (bio !== undefined) doctor.bio = bio;
        if (address !== undefined) doctor.address = address;
        if (image !== undefined) doctor.image = image;
        await doctor.save();

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        await user.save();

        const updatedDoctor = await Doctor.findById(doctor._id)
            .populate('userId', 'name email')
            .populate('specialtyId', 'name description');

        const availability = await Availability.find({ doctorId: doctor._id })
            .select('dayOfWeek startTime endTime')
            .sort({ dayOfWeek: 1, startTime: 1 });

        const normalizedAvailability = availability.map((row) => ({
            dayOfWeek: row.dayOfWeek,
            startTime: row.startTime,
            endTime: row.endTime,
        }));

        return res.status(200).json({
            message: 'Doctor profile updated successfully',
            doctor: formatDoctor(updatedDoctor, normalizedAvailability),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// GET /api/doctors/availability
const getAvailability = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }

        const availability = await Availability.find({ doctorId: doctor._id }).sort({ dayOfWeek: 1, startTime: 1 });
        return res.status(200).json({ availability });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

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


// const getAvailableSlots = async (req, res) => {
//     try {
//         const { doctorId, date } = req.body; // date = YYYY-MM-DD

//         const dayOfWeek = new Date(date).getDay();

//         const slots = await Availability.find({ doctorId, dayOfWeek }).sort({ startTime: 1 });

//         res.status(200).json({ success: true, data: slots });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

const getAvailableSlots = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            });
        }

        const dayOfWeek = new Date(date).getDay();

        const slots = await Availability.find({
            doctorId,
            dayOfWeek
        }).sort({ startTime: 1 });

        res.status(200).json({
            success: true,
            data: slots
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export {
    getAllDoctors,
    getDoctorById,
    getProfile,
    updateProfile,
    getAvailability,
    setAvailability,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    getAvailableSlots,
};
