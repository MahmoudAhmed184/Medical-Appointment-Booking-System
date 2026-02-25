import Specialty from '../models/Specialty.js';
import ApiError from '../utils/ApiError.js';

const getAllSpecialties = async () => {
    return Specialty.find().sort({ name: 1 });
};

const getSpecialtyById = async (id) => {
    const specialty = await Specialty.findById(id);

    if (!specialty) {
        throw new ApiError(404, 'Specialty not found');
    }

    return specialty;
};

const createSpecialty = async ({ name, description }) => {
    return Specialty.create({ name, description });
};

const updateSpecialty = async (id, { name, description }) => {
    const specialty = await Specialty.findByIdAndUpdate(
        id,
        { name, description },
        { new: true, runValidators: true }
    );

    if (!specialty) {
        throw new ApiError(404, 'Specialty not found');
    }

    return specialty;
};

const deleteSpecialty = async (id) => {
    const specialty = await Specialty.findByIdAndDelete(id);

    if (!specialty) {
        throw new ApiError(404, 'Specialty not found');
    }

    return specialty;
};

export {
    getAllSpecialties,
    getSpecialtyById,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
};
