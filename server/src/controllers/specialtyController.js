import Specialty from '../models/Specialty.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Get all specialties
 * @route   GET /api/specialties
 * @access  Public
 */
const getAllSpecialties = catchAsync(async (req, res) => {
    const specialties = await Specialty.find().sort({ name: 1 });

    res.status(200).json({
        success: true,
        data: specialties,
    });
});

/**
 * @desc    Get specialty by ID
 * @route   GET /api/specialties/:id
 * @access  Public
 */
const getSpecialtyById = catchAsync(async (req, res) => {
    const specialty = await Specialty.findById(req.params.id);

    if (!specialty) {
        throw new ApiError(404, 'Specialty not found');
    }

    res.status(200).json({
        success: true,
        data: specialty,
    });
});

/**
 * @desc    Create a new specialty
 * @route   POST /api/specialties
 * @access  Admin
 */
const createSpecialty = catchAsync(async (req, res) => {
    const { name, description } = req.body;

    const specialty = await Specialty.create({ name, description });

    res.status(201).json({
        success: true,
        data: specialty,
        message: 'Specialty created successfully',
    });
});

/**
 * @desc    Update a specialty
 * @route   PUT /api/specialties/:id
 * @access  Admin
 */
const updateSpecialty = catchAsync(async (req, res) => {
    const { name, description } = req.body;

    const specialty = await Specialty.findByIdAndUpdate(
        req.params.id,
        { name, description },
        { new: true, runValidators: true }
    );

    if (!specialty) {
        throw new ApiError(404, 'Specialty not found');
    }

    res.status(200).json({
        success: true,
        data: specialty,
        message: 'Specialty updated successfully',
    });
});

/**
 * @desc    Delete a specialty
 * @route   DELETE /api/specialties/:id
 * @access  Admin
 */
const deleteSpecialty = catchAsync(async (req, res) => {
    const specialty = await Specialty.findByIdAndDelete(req.params.id);

    if (!specialty) {
        throw new ApiError(404, 'Specialty not found');
    }

    res.status(200).json({
        success: true,
        data: null,
        message: 'Specialty deleted successfully',
    });
});

export {
  getAllSpecialties,
  getSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
};
