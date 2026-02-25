import catchAsync from '../utils/catchAsync.js';
import * as specialtyService from '../services/specialtyService.js';

/**
 * @desc    Get all specialties
 * @route   GET /api/specialties
 * @access  Public
 */
const getAllSpecialties = catchAsync(async (req, res) => {
    const specialties = await specialtyService.getAllSpecialties();

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
    const specialty = await specialtyService.getSpecialtyById(req.params.id);

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
    const specialty = await specialtyService.createSpecialty(req.body);

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
    const specialty = await specialtyService.updateSpecialty(req.params.id, req.body);

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
    await specialtyService.deleteSpecialty(req.params.id);

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
