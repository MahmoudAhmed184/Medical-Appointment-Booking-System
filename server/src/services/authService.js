import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Specialty from '../models/Specialty.js';
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../utils/tokenUtils.js';
import { ROLES } from '../utils/constants.js';

const register = async (userData) => {
    const { name, email, password, role, specialtyId, bio, phone, dateOfBirth } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'Email is already registered', [
            { field: 'email', message: 'Email is already registered' },
        ]);
    }

    if (role === ROLES.DOCTOR) {
        const specialty = await Specialty.findById(specialtyId);
        if (!specialty) {
            throw new ApiError(404, 'Specialty not found', [
                { field: 'specialtyId', message: 'The specified specialty does not exist' },
            ]);
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        isApproved: role === ROLES.PATIENT,
    });

    if (role === ROLES.DOCTOR) {
        await Doctor.create({
            userId: user._id,
            specialtyId,
            phone,
            ...(bio && { bio }),
        });
    } else if (role === ROLES.PATIENT) {
        await Patient.create({
            userId: user._id,
            phone,
            dateOfBirth,
        });
    }

    const token = generateToken({ id: user._id, role: user.role });

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
        },
    };
};

// TODO: Implement login service
const login = async (credentials) => { };

export { register, login };
