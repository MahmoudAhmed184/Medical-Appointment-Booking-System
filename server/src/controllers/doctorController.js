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

// TODO: Implement setAvailability handler
const setAvailability = (req, res) => { };

// TODO: Implement updateAvailabilitySlot handler
const updateAvailabilitySlot = (req, res) => { };

// TODO: Implement deleteAvailabilitySlot handler
const deleteAvailabilitySlot = (req, res) => { };

// TODO: Implement getAvailableSlots handler
const getAvailableSlots = (req, res) => { };

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
