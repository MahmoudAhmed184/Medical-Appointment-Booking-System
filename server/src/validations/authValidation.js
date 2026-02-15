import Joi from 'joi';

const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required',
    }),

    email: Joi.string().trim().lowercase().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),

    password: Joi.string()
        .min(6)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters long',
            'string.pattern.base':
                'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)',
            'any.required': 'Password is required',
        }),

    role: Joi.string().valid('doctor', 'patient').required().messages({
        'any.only': 'Role must be either doctor or patient',
        'any.required': 'Role is required',
    }),

    specialtyId: Joi.when('role', {
        is: 'doctor',
        then: Joi.string().hex().length(24).required().messages({
            'string.empty': 'Specialty is required for doctors',
            'string.hex': 'Specialty ID must be a valid ObjectId',
            'string.length': 'Specialty ID must be a valid ObjectId',
            'any.required': 'Specialty is required for doctors',
        }),
        otherwise: Joi.forbidden(),
    }),

    bio: Joi.when('role', {
        is: 'doctor',
        then: Joi.string().trim().max(500).allow('').optional().messages({
            'string.max': 'Bio cannot exceed 500 characters',
        }),
        otherwise: Joi.forbidden(),
    }),

    phone: Joi.string()
        .trim()
        .pattern(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
        .required()
        .messages({
            'string.empty': 'Phone number is required',
            'string.pattern.base': 'Please provide a valid phone number',
            'any.required': 'Phone number is required',
        }),

    dateOfBirth: Joi.when('role', {
        is: 'patient',
        then: Joi.date().less('now').required().messages({
            'date.less': 'Date of birth must be in the past',
            'any.required': 'Date of birth is required for patients',
        }),
        otherwise: Joi.forbidden(),
    }),
});

export { registerSchema };
