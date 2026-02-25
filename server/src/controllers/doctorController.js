import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { isValidObjectId } from 'mongoose';
import * as doctorService from '../services/doctorService.js';

const getProfile = catchAsync(async (req, res) => {
    const data = await doctorService.getProfile(req.user._id);

    res.status(200).json({ success: true, data });
});

const getAllDoctors = catchAsync(async (req, res) => {
    const { doctors, pagination } = await doctorService.getAllDoctors(req.query);

    res.status(200).json({ success: true, data: doctors, pagination });
});

const getDoctorById = catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, 'Invalid doctor ID');
    }

    const data = await doctorService.getDoctorById(id);

    res.status(200).json({ success: true, data });
});

const updateProfile = catchAsync(async (req, res) => {
    const data = await doctorService.updateProfile(req.user._id, req.body);

    res.status(200).json({
        success: true,
        data,
        message: 'Doctor profile updated successfully',
    });
});

const getAvailability = catchAsync(async (req, res) => {
    const data = await doctorService.getAvailability(req.user._id);

    res.status(200).json({ success: true, data });
});

const setAvailability = catchAsync(async (req, res) => {
    const data = await doctorService.setAvailability(req.user._id, req.body);

    res.status(201).json({
        success: true,
        data,
        message: 'Availability slot created successfully',
    });
});

const updateAvailabilitySlot = catchAsync(async (req, res) => {
    const data = await doctorService.updateAvailabilitySlot(
        req.user._id,
        req.params.slotId,
        req.body
    );

    res.status(200).json({
        success: true,
        data,
        message: 'Availability slot updated successfully',
    });
});

const deleteAvailabilitySlot = catchAsync(async (req, res) => {
    await doctorService.deleteAvailabilitySlot(req.user._id, req.params.slotId);

    res.status(200).json({
        success: true,
        data: null,
        message: 'Slot deleted successfully',
    });
});

const getAvailableSlots = catchAsync(async (req, res) => {
    const doctorId = req.params.id;
    const { date } = req.query;

    if (!date) {
        throw new ApiError(400, 'Date query parameter is required');
    }
    if (!isValidObjectId(doctorId)) {
        throw new ApiError(400, 'Invalid doctor ID');
    }

    const data = await doctorService.getAvailableSlots(doctorId, date);

    res.status(200).json({ success: true, data });
});

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
