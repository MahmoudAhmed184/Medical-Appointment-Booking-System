import catchAsync from '../utils/catchAsync.js';
import * as specialtyService from '../services/specialtyService.js';

const getAllSpecialties = catchAsync(async (req, res) => {
    const specialties = await specialtyService.getAllSpecialties();

    res.status(200).json({
        success: true,
        data: specialties,
    });
});

const getSpecialtyById = catchAsync(async (req, res) => {
    const specialty = await specialtyService.getSpecialtyById(req.params.id);

    res.status(200).json({
        success: true,
        data: specialty,
    });
});

const createSpecialty = catchAsync(async (req, res) => {
    const specialty = await specialtyService.createSpecialty(req.body);

    res.status(201).json({
        success: true,
        data: specialty,
        message: 'Specialty created successfully',
    });
});

const updateSpecialty = catchAsync(async (req, res) => {
    const specialty = await specialtyService.updateSpecialty(req.params.id, req.body);

    res.status(200).json({
        success: true,
        data: specialty,
        message: 'Specialty updated successfully',
    });
});

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
