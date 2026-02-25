import Patient from '../models/Patient.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * Get a patient profile by userId, populated with user details.
 */
const getProfile = async (userId) => {
    const patient = await Patient.findOne({ userId }).populate('user');
    if (!patient) {
        throw new ApiError(404, 'Patient profile not found');
    }

    return patient;
};

/**
 * Update a patient's profile and associated user record.
 */
const updateProfile = async (userId, data) => {
    const patient = await Patient.findOne({ userId });
    if (!patient) {
        throw new ApiError(404, 'Patient not found');
    }

    const { phone, dateOfBirth, name, email, address, image } = data;

    if (phone) patient.phone = phone;
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (address !== undefined) patient.address = address;
    if (image !== undefined) patient.image = image;
    await patient.save();

    const user = await User.findById(userId);
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    const updatedPatient = await Patient.findById(patient._id).populate('user');

    return updatedPatient;
};

export { getProfile, updateProfile };
